// kit.js — utilidades compartidas por todos los efectos.
//
// CONTRATO DE UN EFECTO (igual al de HyperFrames):
//   export default { id, build(stage, params, ctx) => gsap.Timeline (paused) }
//   - stage: div de 1920x1080 (escalado por CSS). El efecto dibuja su escena adentro.
//   - params: valores de los sliders (claves definidas en effects-index.json).
//   - ctx: { gsap, W, H, fps, rng, theme } — ver makeCtx().
//   - Debe devolver un timeline PAUSADO y determinista:
//     nada de Math.random sin semilla, Date.now ni requestAnimationFrame.
//   Así el mismo archivo sirve para la demo en el navegador y para renderizar
//   video con HyperFrames (que busca/“seekea” el timeline fotograma a fotograma).

export const W = 1920;
export const H = 1080;
export const FPS = 30;

// Generador pseudoaleatorio con semilla (mulberry32): mismo seed => misma secuencia.
export function rng(seed = 1) {
  let a = seed >>> 0;
  return function () {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// Crea un elemento con estilos inline y lo agrega al padre.
export function el(tag, style = {}, parent = null, html = '') {
  const node = document.createElement(tag);
  Object.assign(node.style, style);
  if (html) node.innerHTML = html;
  if (parent) parent.appendChild(node);
  return node;
}

// Crea un nodo SVG.
export function svg(tag, attrs = {}, parent = null) {
  const node = document.createElementNS('http://www.w3.org/2000/svg', tag);
  for (const [k, v] of Object.entries(attrs)) node.setAttribute(k, v);
  if (parent) parent.appendChild(node);
  return node;
}

// Capa a pantalla completa dentro del stage.
export function layer(parent, style = {}) {
  return el('div', { position: 'absolute', inset: '0', overflow: 'hidden', ...style }, parent);
}

// Lee los tokens de color del tema activo (para efectos que dibujan en canvas).
export function themeColors(node) {
  const cs = getComputedStyle(node);
  const v = (name, fb) => (cs.getPropertyValue(name).trim() || fb);
  return {
    bg: v('--s-bg', '#111318'),
    ink: v('--s-ink', '#f4efe6'),
    muted: v('--s-muted', '#8a8f9c'),
    accent: v('--s-accent', '#4c6fff'),
    accent2: v('--s-accent2', '#ff6a4d'),
    accent3: v('--s-accent3', '#f2c14e'),
    bg2: v('--s-bg-2', '#1a1d25'),
    font: v('--s-font', 'Inter Tight, sans-serif'),
  };
}

// Divide un texto en spans (letra | palabra | linea) envueltos en una "ventana"
// con overflow hidden: base del revelado tipográfico con máscara.
export function splitText(container, text, unit = 'letra') {
  container.innerHTML = '';
  const inner = [];
  const wrap = (content, isSpace = false) => {
    const outer = el('span', { display: 'inline-block', overflow: 'hidden', verticalAlign: 'top', paddingBottom: '0.08em' }, container);
    const span = el('span', { display: 'inline-block', willChange: 'transform' }, outer);
    span.textContent = content;
    if (isSpace) span.innerHTML = '&nbsp;';
    inner.push(span);
    return span;
  };
  if (unit === 'linea') {
    for (const line of text.split('\n')) {
      const outer = el('div', { overflow: 'hidden', paddingBottom: '0.08em' }, container);
      const span = el('div', { willChange: 'transform' }, outer);
      span.textContent = line;
      inner.push(span);
    }
    return inner;
  }
  const lines = text.split('\n');
  lines.forEach((line, li) => {
    const words = line.split(' ');
    words.forEach((w, wi) => {
      if (unit === 'palabra') wrap(w);
      else {
        const word = el('span', { display: 'inline-block', whiteSpace: 'nowrap' }, container);
        for (const ch of w) {
          const outer = el('span', { display: 'inline-block', overflow: 'hidden', verticalAlign: 'top', paddingBottom: '0.08em' }, word);
          const span = el('span', { display: 'inline-block', willChange: 'transform' }, outer);
          span.textContent = ch;
          inner.push(span);
        }
      }
      if (wi < words.length - 1) el('span', { display: 'inline-block', width: '0.28em' }, container);
    });
    if (li < lines.length - 1) el('br', {}, container);
  });
  return inner;
}

// Ruido 1D suave y determinista (para sacudidas de cámara orgánicas).
export function smoothNoise(seed) {
  const r = rng(seed);
  const pts = Array.from({ length: 512 }, () => r() * 2 - 1);
  return (x) => {
    const i = Math.floor(x), f = x - i;
    const a = pts[((i % 512) + 512) % 512], b = pts[(((i + 1) % 512) + 512) % 512];
    const s = f * f * (3 - 2 * f);
    return a + (b - a) * s;
  };
}

// Mezcla dos colores hex (#rrggbb) en proporción t (0..1).
export function mix(a, b, t) {
  const p = (h) => { const x = h.replace('#', ''); const f = x.length === 3 ? x.split('').map((c) => c + c).join('') : x; return [0, 2, 4].map((i) => parseInt(f.slice(i, i + 2), 16)); };
  const A = p(a), B = p(b);
  return '#' + A.map((v, i) => Math.round(v + (B[i] - v) * t).toString(16).padStart(2, '0')).join('');
}

// Estilos tipográficos reutilizables (respetan el tema activo).
export const DISPLAY = { fontFamily: 'var(--s-font)', fontWeight: 'var(--s-weight)', textTransform: 'var(--s-case)', letterSpacing: 'var(--s-track)', lineHeight: '0.95' };
export const SERIF = { fontFamily: 'var(--s-serif)', fontStyle: 'italic', fontWeight: '400', letterSpacing: '-0.01em' };
export const MONO = { fontFamily: '"JetBrains Mono", ui-monospace, monospace', fontSize: '26px', letterSpacing: '0.08em', textTransform: 'uppercase' };

// Contador de ids únicos (filtros SVG, clipPaths) para que varias demos convivan.
let uid = 0;
export const nextId = (p = 'fx') => `${p}-${++uid}`;

export function makeCtx(stage, theme = 'neutral') {
  return { gsap: window.gsap, W, H, fps: FPS, rng, theme, colors: themeColors(stage) };
}

// Lista de curvas ofrecidas en los selectores de easing, con su "sensación".
export const EASES = [
  'none', 'sine.inOut', 'power1.inOut', 'power2.out', 'power3.out', 'power3.inOut',
  'power4.inOut', 'expo.out', 'expo.inOut', 'circ.inOut', 'back.out(1.7)', 'back.inOut(1.4)',
  'elastic.out(1,0.45)', 'bounce.out',
];
