// Exporta un efecto (con parámetros) como composición HyperFrames autocontenida.
// Uso:
//   node scripts/export-hyperframes.mjs <id-efecto> [params.json | '{"clave":valor}'] [--tema=fluo] [--out=carpeta]
// Ejemplo:
//   node scripts/export-hyperframes.mjs golpe-tipografico params.json --out=renders/golpe
//   (en PowerShell conviene usar un archivo .json: el JSON en línea pierde sus comillas)
// Luego, dentro de la carpeta de salida:
//   npx hyperframes render --output golpe.mp4
//
// Qué hace: une kit.js + el módulo del efecto en un solo <script> clásico (sin
// imports), incrusta GSAP y los tokens de color del tema, y calcula la duración
// exacta del timeline abriendo el efecto en Chrome (Playwright).
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';
import { spawn } from 'node:child_process';

const root = fileURLToPath(new URL('..', import.meta.url));
const args = process.argv.slice(2);
const id = args.find((a) => !a.startsWith('--'));
const rawParams = args.filter((a) => !a.startsWith('--'))[1];
const theme = (args.find((a) => a.startsWith('--tema=')) || '--tema=neutral').split('=')[1];
const outDir = resolve((args.find((a) => a.startsWith('--out=')) || `--out=renders/${id}`).split('=')[1]);
if (!id) { console.error('Uso: node scripts/export-hyperframes.mjs <id-efecto> [params] [--tema=neutral|fluo] [--out=carpeta]'); process.exit(1); }

const index = JSON.parse(await readFile(join(root, 'effects-index.json'), 'utf8'));
const meta = index.effects.find((e) => e.id === id);
if (!meta) { console.error(`No existe el efecto "${id}". Opciones: ${index.effects.map((e) => e.id).join(', ')}`); process.exit(1); }
let overrides = {};
if (rawParams) overrides = JSON.parse(existsSync(rawParams) ? await readFile(rawParams, 'utf8') : rawParams);
// Acepta también el formato del botón "Copiar parámetros": { effect, params }
if (overrides && typeof overrides.params === 'object') overrides = overrides.params;
const params = { ...Object.fromEntries(meta.params.map((p) => [p.key, p.default])), ...overrides };

// 1) Código: kit + efecto, sin import/export
const strip = (src) => src.replace(/^import[^;]+;\s*$/gm, '').replace(/^export default\s+/m, 'const FX = ').replace(/^export\s+/gm, '');
const kit = strip(await readFile(join(root, 'src/core/kit.js'), 'utf8'));
const fx = strip(await readFile(join(root, meta.implementation), 'utf8'));
const gsapSrc = await readFile(join(root, 'vendor/gsap.min.js'), 'utf8');

// 2) Tokens del tema (bloque --s-* de styles.css)
const css = await readFile(join(root, 'src/styles.css'), 'utf8');
const block = (sel) => (css.match(new RegExp(`${sel.replace(/[[\]"]/g, '\\$&')}\\s*\\{([\\s\\S]*?)\\}`)) || [])[1] || '';
const neutralVars = block(':root[data-theme="neutral"]').split('\n').filter((l) => l.trim().startsWith('--s-')).join('\n');
const fluoVars = block(':root[data-theme="fluo"]').split('\n').filter((l) => l.trim().startsWith('--s-')).join('\n');
const vars = theme === 'fluo' ? `${neutralVars}\n${fluoVars}` : neutralVars;

// 3) Duración exacta: se construye el efecto en Chrome y se lee tl.duration()
const PORT = 4398;
const server = spawn(process.execPath, [join(root, 'scripts/serve.mjs'), String(PORT)], { stdio: 'ignore' });
await new Promise((r) => setTimeout(r, 600));
let duration;
const browser = await chromium.launch({ channel: 'chrome' });
try {
  const page = await browser.newPage();
  await page.goto(`http://localhost:${PORT}/`);
  await page.waitForSelector('#app *', { state: 'attached' });
  duration = await page.evaluate(async ({ id, params }) => {
    await document.fonts.ready;
    const { makeCtx } = await import('/src/core/kit.js');
    const fx = (await import(`/src/effects/${id}.js`)).default;
    const stage = document.createElement('div');
    stage.className = 'stage';
    document.body.appendChild(stage);
    return fx.build(stage, params, makeCtx(stage)).duration();
  }, { id, params });
} finally { await browser.close(); server.kill(); }
const dur = Math.ceil(duration * 30) / 30;

const html = `<!doctype html>
<html lang="es">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=1920, height=1080" />
<!-- Generado por scripts/export-hyperframes.mjs · efecto: ${id} · tema: ${theme} -->
<link href="https://fonts.googleapis.com/css2?family=Inter+Tight:ital,wght@0,400;0,500;0,600;0,800;0,900;1,400&family=Instrument+Serif:ital@0;1&family=JetBrains+Mono:wght@400;600&display=block" rel="stylesheet" />
<style>
:root {
${vars}
}
body { margin: 0; background: #000; }
#root { position: relative; width: 1920px; height: 1080px; overflow: hidden; }
.stage { position: absolute; inset: 0; overflow: hidden; background: var(--s-bg); color: var(--s-ink); font-family: var(--s-font); }
</style>
<script>${gsapSrc}</script>
</head>
<body>
<div id="root" data-composition-id="main" data-start="0" data-duration="${dur}" data-width="1920" data-height="1080">
  <div id="stage" class="stage clip" data-start="0" data-duration="${dur}" data-track-index="1"></div>
</div>
<script>
// ---- kit.js ----
${kit}
// ---- ${meta.implementation} ----
${fx}
// ---- Registro para HyperFrames ----
const PARAMS = ${JSON.stringify(params, null, 2)};
window.__timelines = window.__timelines || {};
const stage = document.getElementById('stage');
window.__timelines.main = FX.build(stage, PARAMS, makeCtx(stage));
</script>
</body>
</html>
`;
await mkdir(outDir, { recursive: true });
await writeFile(join(outDir, 'index.html'), html);
await writeFile(join(outDir, 'params.json'), JSON.stringify({ effect: id, theme, duration_s: dur, params }, null, 2));
console.log(`✓ Composición HyperFrames lista: ${join(outDir, 'index.html')} (${dur.toFixed(2)} s)`);
console.log(`  Siguiente paso: cd "${outDir}" && npx hyperframes render --output ${id}.mp4`);
