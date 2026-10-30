// Captura la galería y cada efecto (en su fotograma "póster") en ambos temas,
// y reporta errores de consola. Usa el Chrome instalado en el equipo.
// Uso: npm run screenshots   (requiere: npm install)
import { chromium } from 'playwright';
import { spawn } from 'node:child_process';
import { readFile, mkdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { join } from 'node:path';

const root = fileURLToPath(new URL('..', import.meta.url));
const out = join(root, 'docs/screenshots');
await mkdir(out, { recursive: true });
const index = JSON.parse(await readFile(join(root, 'effects-index.json'), 'utf8'));
const PORT = 4399;
const server = spawn(process.execPath, [join(root, 'scripts/serve.mjs'), String(PORT)], { stdio: 'ignore' });
await new Promise((r) => setTimeout(r, 700));

const only = process.argv.slice(2);
const browser = await chromium.launch({ channel: 'chrome' });
const errors = [];
try {
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 });
  page.on('console', (m) => { if (m.type() === 'error') errors.push(`[console] ${m.text()}`); });
  page.on('pageerror', (e) => errors.push(`[pageerror] ${e.message}`));
  const base = `http://localhost:${PORT}/`;

  for (const theme of ['neutral', 'fluo']) {
    await page.goto(base);
    await page.evaluate((t) => { try { localStorage.setItem('vfx-theme', t); } catch {} }, theme);
    await page.goto(base + '#/');
    await page.reload();
    await page.waitForSelector('.card .stage > *', { timeout: 10000, state: 'attached' });
    await page.waitForTimeout(1200);
    if (!only.length) await page.screenshot({ path: join(out, `galeria-${theme}.png`) });

    for (const e of index.effects) {
      if (only.length && !only.includes(e.id)) continue;
      if (theme === 'fluo' && !only.length && !['golpe-tipografico', 'datos-barras-conteo', 'rotador-palabras', 'particulas-forman'].includes(e.id)) continue;
      await page.goto(base + `#/e/${e.id}`);
      await page.waitForSelector('.detail .stage > *', { timeout: 10000, state: 'attached' });
      await page.waitForTimeout(300);
      // Pausa y salta a un fotograma representativo
      const poster = await page.evaluate(async (id) => (await import(`/src/effects/${id}.js`)).default.poster ?? 0.7, e.id);
      await page.evaluate(() => { const b = document.querySelector('[data-act="play"]'); if (b.textContent.includes('Pausa')) b.click(); });
      await page.$eval('.scrub', (el, v) => { el.value = String(Math.round(v * 1000)); el.dispatchEvent(new Event('input')); }, poster);
      await page.waitForTimeout(250);
      const name = theme === 'neutral' ? `${e.id}.png` : `${e.id}-fluo.png`;
      await page.screenshot({ path: join(out, name), fullPage: false });
    }
  }
  // Vista móvil de un efecto
  if (!only.length) {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(base + '#/e/revelado-letras');
    await page.waitForTimeout(2500);
    await page.screenshot({ path: join(out, 'movil-detalle.png'), fullPage: true });
  }
} finally {
  await browser.close();
  server.kill();
}
if (errors.length) { console.error(`✗ Errores en el navegador:\n${[...new Set(errors)].join('\n')}`); process.exit(1); }
console.log(`✓ Capturas guardadas en docs/screenshots (sin errores de consola).`);
