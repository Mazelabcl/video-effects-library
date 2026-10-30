// Valida que effects-index.json y los módulos en src/effects/ estén alineados.
// Uso: node scripts/validate-index.mjs   (sale con código 1 si hay errores)
import { readFile, readdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { join } from 'node:path';

const root = fileURLToPath(new URL('..', import.meta.url));
const index = JSON.parse(await readFile(join(root, 'effects-index.json'), 'utf8'));
const files = (await readdir(join(root, 'src/effects'))).filter((f) => f.endsWith('.js'));
const errors = [];
const REQUIRED = ['id', 'name_es', 'family', 'intent_tags', 'summary_es', 'emotion_es', 'when_to_use', 'avoid_when', 'common_misuse', 'params', 'implementation', 'demo_path', 'energy', 'sources'];
const ids = new Set();

for (const e of index.effects) {
  for (const k of REQUIRED) if (e[k] == null) errors.push(`${e.id}: falta "${k}"`);
  if (ids.has(e.id)) errors.push(`${e.id}: id duplicado`);
  ids.add(e.id);
  if (!index.families[e.family]) errors.push(`${e.id}: familia desconocida "${e.family}"`);
  for (const t of e.intent_tags) if (!index.intent_vocabulary.includes(t)) errors.push(`${e.id}: intención fuera del vocabulario "${t}"`);
  if (e.implementation !== `src/effects/${e.id}.js`) errors.push(`${e.id}: ruta de implementación inesperada`);
  if (e.demo_path !== `/#/e/${e.id}`) errors.push(`${e.id}: demo_path inesperado`);
  if (!files.includes(`${e.id}.js`)) errors.push(`${e.id}: no existe src/effects/${e.id}.js`);
  for (const p of e.params) {
    if (p.type === 'number' && !(p.min <= p.default && p.default <= p.max)) errors.push(`${e.id}.${p.key}: default fuera de rango`);
    if (p.type === 'select' && !p.options.includes(p.default)) errors.push(`${e.id}.${p.key}: default no está en options`);
  }
  for (const pair of e.pairs_well_with || []) if (!index.effects.some((x) => x.id === pair)) errors.push(`${e.id}: pairs_well_with apunta a "${pair}" inexistente`);
  // Las claves de parámetros deben aparecer en el código del efecto
  const src = await readFile(join(root, e.implementation), 'utf8').catch(() => '');
  for (const p of e.params) if (!src.includes(`p.${p.key}`)) errors.push(`${e.id}: el código no usa el parámetro "${p.key}"`);
  if (/Math\.random|Date\.now|requestAnimationFrame/.test(src)) errors.push(`${e.id}: usa una API no determinista`);
}
for (const f of files) if (!ids.has(f.replace('.js', ''))) errors.push(`src/effects/${f} no está en el índice`);

if (errors.length) { console.error(`✗ ${errors.length} problema(s):\n- ` + errors.join('\n- ')); process.exit(1); }
console.log(`✓ effects-index.json válido: ${index.effects.length} efectos, ${Object.keys(index.families).length} familias.`);
