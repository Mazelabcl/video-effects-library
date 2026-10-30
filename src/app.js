// app.js — galería, reproductor y panel de parámetros.
// Lee effects-index.json (fuente de verdad de metadatos) y carga cada efecto
// como módulo ES desde src/effects/<id>.js.
import { makeCtx, EASES, W, H, FPS } from './core/kit.js';

const app = document.getElementById('app');
const gsap = window.gsap;
const modCache = new Map();
let INDEX = null;
let cleanup = []; // funciones a ejecutar al salir de una vista

// ---------- Utilidades ----------
const $ = (html) => { const t = document.createElement('template'); t.innerHTML = html.trim(); return t.content.firstElementChild; };
const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

function safeGet(key) { try { return localStorage.getItem(key); } catch { return null; } }
function safeSet(key, val) { try { localStorage.setItem(key, val); } catch { /* sin almacenamiento */ } }

function toast(msg) {
  let t = document.querySelector('.toast');
  if (!t) { t = $('<div class="toast" role="status"></div>'); document.body.appendChild(t); }
  t.textContent = msg; t.classList.add('show');
  clearTimeout(t._h); t._h = setTimeout(() => t.classList.remove('show'), 1600);
}

async function loadEffect(id) {
  if (!modCache.has(id)) modCache.set(id, import(`./effects/${id}.js`).then((m) => m.default));
  return modCache.get(id);
}

function defaults(meta) {
  return Object.fromEntries(meta.params.map((p) => [p.key, p.default]));
}

// Escala el escenario de 1920x1080 al ancho de su contenedor.
function fitStage(wrap, stage) {
  const ro = new ResizeObserver(() => {
    const s = wrap.clientWidth / W;
    stage.style.transform = `scale(${s})`;
  });
  ro.observe(wrap);
  return () => ro.disconnect();
}

// Construye el efecto dentro del escenario y devuelve el timeline pausado.
function buildInto(stage, fx, params) {
  stage.innerHTML = '';
  const tl = fx.build(stage, params, makeCtx(stage, document.documentElement.dataset.theme));
  tl.pause(0);
  return tl;
}

// ---------- Tema ----------
function applyTheme(theme) {
  document.documentElement.dataset.theme = theme;
  document.querySelectorAll('[data-set-theme]').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.setTheme === theme)));
  safeSet('vfx-theme', theme);
}
document.querySelectorAll('[data-set-theme]').forEach((b) => b.addEventListener('click', () => {
  applyTheme(b.dataset.setTheme);
  route(); // reconstruye: los efectos en canvas leen los colores al construirse
}));
applyTheme(safeGet('vfx-theme') || 'neutral');

// ---------- Rutas (#/, #/e/<id>?k=v, #/guia) ----------
function parseHash() {
  const h = location.hash.replace(/^#/, '') || '/';
  const [path, qs] = h.split('?');
  return { path, query: new URLSearchParams(qs || '') };
}

async function route() {
  cleanup.forEach((fn) => { try { fn(); } catch { /* noop */ } });
  cleanup = [];
  gsap.globalTimeline.getChildren(false, true, true).forEach((t) => t.kill());
  const { path, query } = parseHash();
  const m = path.match(/^\/e\/([\w-]+)$/);
  window.scrollTo(0, 0);
  if (m) return renderDetail(m[1], query);
  if (path === '/guia') return renderGuide();
  return renderGallery(query);
}
window.addEventListener('hashchange', route);

// ---------- Galería ----------
const FAMILY_ES = {
  transicion: 'Transiciones', tipografia: 'Tipografía cinética', camara: 'Cámara', easing: 'Easing',
  ritmo: 'Ritmo', mascara: 'Máscaras', particulas: 'Partículas', color: 'Color',
  'pantalla-dividida': 'Pantalla dividida', datos: 'Datos',
};

function renderGallery(query) {
  const fam = query.get('familia') || '';
  const tag = query.get('intencion') || '';
  const list = INDEX.effects.filter((e) => (!fam || e.family === fam) && (!tag || e.intent_tags.includes(tag)));
  const families = [...new Set(INDEX.effects.map((e) => e.family))];
  const tags = [...new Set(INDEX.effects.flatMap((e) => e.intent_tags))].sort();
  const link = (k, v) => { const q = new URLSearchParams(query); if (q.get(k) === v || !v) q.delete(k); else q.set(k, v); const s = q.toString(); return `#/${s ? '?' + s : ''}`; };

  app.innerHTML = '';
  app.appendChild($(`
    <section class="hero">
      <h1>Ningún efecto<br/>sin <em>intención.</em></h1>
      <p>${INDEX.effects.length} efectos de video en vivo. Mueve los parámetros, mira cómo cambia la sensación y lee cuándo usarlo y cuándo no. Pasa el cursor sobre una tarjeta para reproducirla.</p>
    </section>`));
  const f1 = $(`<div class="filters"><span class="label">Familia</span></div>`);
  f1.appendChild($(`<a class="chip" href="${link('familia', '')}" aria-pressed="${!fam}">Todas</a>`));
  families.forEach((f) => f1.appendChild($(`<a class="chip" href="${link('familia', f)}" aria-pressed="${fam === f}">${esc(FAMILY_ES[f] || f)}</a>`)));
  const f2 = $(`<div class="filters"><span class="label">Intención</span></div>`);
  tags.forEach((t) => f2.appendChild($(`<a class="chip" href="${link('intencion', t)}" aria-pressed="${tag === t}">${esc(t)}</a>`)));
  app.append(f1, f2);

  const grid = $('<div class="grid"></div>');
  app.appendChild(grid);
  if (!list.length) { grid.appendChild($('<p class="empty">No hay efectos con esa combinación de filtros.</p>')); return; }

  const io = new IntersectionObserver((entries) => {
    entries.forEach((en) => { if (en.isIntersecting) { io.unobserve(en.target); en.target._build(); } });
  }, { rootMargin: '200px' });
  cleanup.push(() => io.disconnect());

  for (const meta of list) {
    const card = $(`
      <a class="card" href="#/e/${meta.id}">
        <div class="stage-wrap"><div class="stage"></div></div>
        <div class="card-body">
          <div class="card-top"><h3>${esc(meta.name_es)}</h3><span class="fam">${esc(FAMILY_ES[meta.family] || meta.family)}</span></div>
          <p>${esc(meta.emotion_es)}</p>
          <div class="tags">${meta.intent_tags.map((t) => `<span class="tag">${esc(t)}</span>`).join('')}<span class="energy" title="Energía">${'●'.repeat(meta.energy)}${'○'.repeat(5 - meta.energy)}</span></div>
        </div>
      </a>`);
    grid.appendChild(card);
    const wrap = card.querySelector('.stage-wrap');
    const stage = card.querySelector('.stage');
    cleanup.push(fitStage(wrap, stage));
    let tl = null;
    card._build = async () => {
      const fx = await loadEffect(meta.id);
      tl = buildInto(stage, fx, defaults(meta));
      tl.progress(fx.poster ?? 0.7);
    };
    io.observe(card);
    const play = () => { if (!tl) return; tl.repeat(-1).repeatDelay(0.5).restart(); };
    const stop = async () => { if (!tl) return; const fx = await loadEffect(meta.id); tl.pause(); tl.repeat(0); tl.progress(fx.poster ?? 0.7); };
    card.addEventListener('mouseenter', play);
    card.addEventListener('focus', play);
    card.addEventListener('mouseleave', stop);
    card.addEventListener('blur', stop);
    cleanup.push(() => tl && tl.kill());
  }
}

// ---------- Detalle ----------
function paramControl(p, value, onChange) {
  const id = `p-${p.key}`;
  let node;
  if (p.type === 'number') {
    node = $(`
      <div class="param">
        <div class="param-head"><label for="${id}">${esc(p.label_es)}</label><output>${value}${p.unit ? ' ' + esc(p.unit) : ''}</output></div>
        <input id="${id}" type="range" min="${p.min}" max="${p.max}" step="${p.step}" value="${value}" />
        <div class="range-meta"><span>${p.min}</span><span>${p.max}</span></div>
      </div>`);
    const input = node.querySelector('input');
    const out = node.querySelector('output');
    input.addEventListener('input', () => { const v = Number(input.value); out.textContent = `${v}${p.unit ? ' ' + p.unit : ''}`; onChange(v); });
  } else if (p.type === 'select' || p.type === 'ease') {
    const options = p.type === 'ease' ? [...new Set([p.default, ...EASES])] : p.options;
    node = $(`
      <div class="param">
        <div class="param-head"><label for="${id}">${esc(p.label_es)}</label></div>
        <select id="${id}">${options.map((o) => `<option ${String(o) === String(value) ? 'selected' : ''}>${esc(o)}</option>`).join('')}</select>
      </div>`);
    const sel = node.querySelector('select');
    sel.addEventListener('change', () => onChange(sel.value));
  } else {
    node = $(`
      <div class="param">
        <div class="param-head"><label for="${id}">${esc(p.label_es)}</label></div>
        <textarea id="${id}" rows="2">${esc(value)}</textarea>
      </div>`);
    const ta = node.querySelector('textarea');
    let h;
    ta.addEventListener('input', () => { clearTimeout(h); h = setTimeout(() => onChange(ta.value), 250); });
  }
  return node;
}

function coerce(p, raw) {
  if (raw == null) return p.default;
  if (p.type === 'number') { const n = Number(raw); return Number.isFinite(n) ? Math.min(p.max, Math.max(p.min, n)) : p.default; }
  if (p.type === 'select') return p.options.map(String).includes(String(raw)) ? raw : p.default;
  return raw;
}

async function renderDetail(id, query) {
  const meta = INDEX.effects.find((e) => e.id === id);
  if (!meta) { app.innerHTML = '<p class="empty">Efecto no encontrado. <a href="#/">Volver a la galería</a></p>'; return; }
  const fx = await loadEffect(id);
  const params = Object.fromEntries(meta.params.map((p) => [p.key, coerce(p, query.get(p.key))]));
  const i = INDEX.effects.indexOf(meta);
  const prev = INDEX.effects[(i - 1 + INDEX.effects.length) % INDEX.effects.length];
  const next = INDEX.effects[(i + 1) % INDEX.effects.length];

  app.innerHTML = '';
  const view = $(`
    <section class="detail">
      <div class="crumbs">
        <a href="#/">← Galería</a>
        <span><a href="#/e/${prev.id}">‹ ${esc(prev.name_es)}</a> &nbsp;·&nbsp; <a href="#/e/${next.id}">${esc(next.name_es)} ›</a></span>
      </div>
      <div>
        <div class="title-row">
          <span class="fam">${esc(FAMILY_ES[meta.family] || meta.family)} · energía ${meta.energy}/5</span>
          <h1>${esc(meta.name_es)}</h1>
          <p class="lead">${esc(meta.summary_es)}</p>
        </div>
        <div class="player">
          <div class="stage-wrap"><div class="stage"></div></div>
          <div class="transport">
            <button class="btn primary" data-act="play">▶ Reproducir</button>
            <input class="scrub" type="range" min="0" max="1000" value="0" aria-label="Línea de tiempo" />
            <span class="time">0.00 s · f0</span>
            <select data-act="speed" aria-label="Velocidad"><option value="0.25">0.25×</option><option value="0.5">0.5×</option><option value="1" selected>1×</option></select>
            <label><input type="checkbox" data-act="loop" checked /> Bucle</label>
          </div>
        </div>
        <div class="panel code">
          <h2>Para el director <span><button class="linkish" data-act="copy-json">Copiar parámetros</button> · <button class="linkish" data-act="copy-link">Copiar enlace</button></span></h2>
          <pre></pre>
        </div>
      </div>
      <aside class="side">
        <div class="panel params"><h2>Parámetros <button class="linkish" data-act="reset">Restablecer</button></h2></div>
        <div class="panel intent">
          <h2>Intención</h2>
          <dl>
            <div><dt>Qué siente el espectador</dt><dd class="feel">${esc(meta.emotion_es)}</dd></div>
            <div><dt>Úsalo cuando</dt><dd><ul class="good">${meta.when_to_use.map((x) => `<li>${esc(x)}</li>`).join('')}</ul></dd></div>
            <div><dt>Evítalo cuando</dt><dd><ul class="bad">${meta.avoid_when.map((x) => `<li>${esc(x)}</li>`).join('')}</ul></dd></div>
            <div><dt>Mal uso común</dt><dd><ul class="bad">${meta.common_misuse.map((x) => `<li>${esc(x)}</li>`).join('')}</ul></dd></div>
            <div><dt>Intenciones</dt><dd class="tags">${meta.intent_tags.map((t) => `<a class="tag" href="#/?intencion=${encodeURIComponent(t)}">${esc(t)}</a>`).join('')}</dd></div>
            <div><dt>Combina bien con</dt><dd class="pairs">${meta.pairs_well_with.map((p) => `<a href="#/e/${p}">${esc(INDEX.effects.find((e) => e.id === p)?.name_es || p)}</a>`).join('')}</dd></div>
            <div><dt>Fuentes</dt><dd><ul>${meta.sources.map((s) => `<li>${s.startsWith('http') ? `<a href="${esc(s)}" target="_blank" rel="noopener">${esc(s.replace(/^https?:\/\//, ''))}</a>` : esc(s)}</li>`).join('')}</ul></dd></div>
          </dl>
        </div>
      </aside>
    </section>`);
  app.appendChild(view);

  const wrap = view.querySelector('.stage-wrap');
  const stage = view.querySelector('.stage');
  cleanup.push(fitStage(wrap, stage));
  const playBtn = view.querySelector('[data-act="play"]');
  const scrub = view.querySelector('.scrub');
  const time = view.querySelector('.time');
  const speed = view.querySelector('[data-act="speed"]');
  const loop = view.querySelector('[data-act="loop"]');
  const pre = view.querySelector('.code pre');

  let tl = null;
  let restartCall = null;
  const updateUI = () => {
    if (!tl) return;
    const t = tl.time(), d = tl.duration();
    scrub.value = String(Math.round((d ? t / d : 0) * 1000));
    time.textContent = `${t.toFixed(2)} s · f${Math.round(t * FPS)} / ${d.toFixed(2)} s`;
    playBtn.textContent = tl.paused() ? '▶ Reproducir' : '❚❚ Pausa';
  };
  const onComplete = () => {
    updateUI();
    if (loop.checked) restartCall = gsap.delayedCall(0.7, () => tl.restart());
  };
  const rebuild = (keepRatio = true) => {
    const ratio = tl && keepRatio ? tl.progress() : 0;
    const wasPlaying = tl && !tl.paused();
    if (tl) tl.kill();
    if (restartCall) restartCall.kill();
    tl = buildInto(stage, fx, params);
    tl.timeScale(Number(speed.value));
    tl.eventCallback('onComplete', onComplete);
    tl.progress(ratio);
    if (wasPlaying) tl.play();
    writeCode();
    updateUI();
  };
  const writeCode = () => {
    const snippet = `// Guion de dirección → efecto
{
  "effect": "${meta.id}",
  "params": ${JSON.stringify(params, null, 2).replace(/\n/g, '\n  ')},
  "duracion_total_s": ${tl.duration().toFixed(2)}
}

// Renderizar a MP4 con HyperFrames (desde la carpeta de la biblioteca):
// 1) "Copiar parámetros" y pegarlos en un archivo params.json
// 2) node scripts/export-hyperframes.mjs ${meta.id} params.json --tema=${document.documentElement.dataset.theme}
// 3) cd renders/${meta.id}  y  npx hyperframes render --output ${meta.id}.mp4
// Implementación: ${meta.implementation}`;
    pre.textContent = snippet;
  };

  const paramsPanel = view.querySelector('.params');
  const drawParams = () => {
    paramsPanel.querySelectorAll('.param').forEach((n) => n.remove());
    meta.params.forEach((p) => paramsPanel.appendChild(paramControl(p, params[p.key], (v) => { params[p.key] = v; rebuild(); })));
  };
  drawParams();

  playBtn.addEventListener('click', () => {
    if (restartCall) restartCall.kill();
    if (tl.progress() >= 1) tl.restart(); else tl.paused(!tl.paused());
    updateUI();
  });
  scrub.addEventListener('input', () => { if (restartCall) restartCall.kill(); tl.pause(); tl.progress(Number(scrub.value) / 1000); updateUI(); });
  speed.addEventListener('change', () => tl.timeScale(Number(speed.value)));
  view.querySelector('[data-act="reset"]').addEventListener('click', () => { Object.assign(params, defaults(meta)); drawParams(); rebuild(false); });
  view.querySelector('[data-act="copy-json"]').addEventListener('click', async () => {
    try { await navigator.clipboard.writeText(JSON.stringify({ effect: meta.id, params }, null, 2)); toast('Parámetros copiados'); } catch { toast('No se pudo copiar'); }
  });
  view.querySelector('[data-act="copy-link"]').addEventListener('click', async () => {
    const q = new URLSearchParams(Object.entries(params).map(([k, v]) => [k, String(v)]));
    const url = `${location.origin}${location.pathname}#/e/${meta.id}?${q}`;
    try { await navigator.clipboard.writeText(url); toast('Enlace copiado'); } catch { toast('No se pudo copiar'); }
  });

  gsap.ticker.add(updateUI);
  cleanup.push(() => { gsap.ticker.remove(updateUI); if (tl) tl.kill(); if (restartCall) restartCall.kill(); });
  rebuild(false);
  // Autoplay suave al entrar (respeta reduced motion).
  if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) tl.play();
}

// ---------- Guía ----------
function renderGuide() {
  const fams = Object.entries(INDEX.easing_families).map(([k, v]) => `<tr><td><strong>${esc(k)}</strong></td><td><code>${esc(v.enter)}</code></td><td><code>${esc(v.transform)}</code></td><td><code>${esc(v.data)}</code></td><td>${esc(v.feel)}</td></tr>`).join('');
  const famDesc = Object.entries(INDEX.families).map(([k, v]) => `<tr><td><a href="#/?familia=${k}"><strong>${esc(FAMILY_ES[k] || k)}</strong></a></td><td>${esc(v)}</td></tr>`).join('');
  app.innerHTML = '';
  app.appendChild($(`
    <article class="guide">
      <h1>Cómo dirigir con intención</h1>
      <p>Un efecto no es decoración: es una decisión que cambia lo que el espectador siente o entiende. Antes de animar se escribe un <strong>guion de dirección</strong>: por escena, qué se ve, cuánto dura, qué efecto se usa y <strong>por qué</strong>. El orden de prioridades viene del montaje de cine (Walter Murch): emoción, historia, ritmo, mirada, plano 2D, espacio 3D.</p>
      <h2>Reglas anti-relleno</h2>
      <ol>${INDEX.anti_slop_rules.map((r) => `<li>${esc(r)}</li>`).join('')}</ol>
      <h2>Familias de easing (elige UNA por video)</h2>
      <table><thead><tr><th>Familia</th><th>Entradas</th><th>Transformaciones</th><th>Datos</th><th>Sensación</th></tr></thead><tbody>${fams}</tbody></table>
      <h2>Familias de efectos</h2>
      <table><tbody>${famDesc}</tbody></table>
      <h2>Para agentes</h2>
      <p>El archivo <a href="effects-index.json" target="_blank" rel="noopener"><code>effects-index.json</code></a> describe cada efecto: intención, parámetros con rangos, cuándo usar y cuándo evitar, y la ruta del módulo. El enlace "Copiar enlace" de cada efecto abre la demo con los parámetros exactos, útil para que una persona apruebe el guion viendo cada decisión.</p>
    </article>`));
}

// ---------- Arranque ----------
(async function boot() {
  try {
    const res = await fetch('effects-index.json');
    INDEX = await res.json();
  } catch {
    app.innerHTML = '<p class="empty">No se pudo cargar effects-index.json. Abre la biblioteca con el servidor local (<code>npm run dev</code>), no con doble clic sobre el archivo.</p>';
    return;
  }
  try { await document.fonts.ready; } catch { /* sin API de fuentes */ }
  route();
})();
