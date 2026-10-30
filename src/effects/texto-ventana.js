// Texto ventana: la palabra es una ventana (background-clip: text) hacia un mar
// al atardecer. Para "atravesar" la letra, el zoom se ancla en el punto MÁS
// INTERIOR del trazo de la letra central (calculado con un canvas fuera de
// pantalla); si se anclara en el hueco de la letra, se volaría hacia el vacío.
import { el, layer, MONO, SERIF } from '../core/kit.js';

const SEA = 'repeating-linear-gradient(180deg, rgba(255,255,255,0.0) 0px, rgba(255,255,255,0.0) 22px, rgba(255,255,255,0.22) 24px, rgba(255,255,255,0) 30px), linear-gradient(180deg, var(--s-accent3) 0%, var(--s-accent2) 38%, var(--s-accent) 52%, #0b1d3a 100%)';

function deepestPoint(text, font, w, h, baseline, from, to) {
  const c = document.createElement('canvas');
  c.width = Math.ceil(w); c.height = Math.ceil(h);
  const g = c.getContext('2d');
  g.font = font; g.fillStyle = '#000';
  g.fillText(text, 0, baseline);
  const data = g.getImageData(0, 0, c.width, c.height).data;
  const inside = (x, y) => x >= 0 && y >= 0 && x < c.width && y < c.height && data[(y * c.width + x) * 4 + 3] > 128;
  let best = { x: (from + to) / 2, y: h / 2, d: -1 };
  const dirs = [[1, 0], [-1, 0], [0, 1], [0, -1], [0.7, 0.7], [-0.7, 0.7], [0.7, -0.7], [-0.7, -0.7]];
  for (let y = 0; y < c.height; y += 4) {
    for (let x = Math.floor(from); x < to; x += 4) {
      if (!inside(x, y)) continue;
      let d = 999;
      for (const [dx, dy] of dirs) {
        let k = 1;
        while (k < 120 && inside(Math.round(x + dx * k), Math.round(y + dy * k))) k++;
        d = Math.min(d, k);
      }
      if (d > best.d) best = { x, y, d };
    }
  }
  return best;
}

export default {
  id: 'texto-ventana',
  poster: 0.45,
  build(stage, p, { gsap }) {
    const text = (p.texto || 'MAREA').trim().slice(0, 10) || 'MAREA';
    layer(stage, { background: 'var(--s-bg)' });
    const fs = Math.min(460, Math.floor(1700 / (text.length * 0.72)));
    const cs = getComputedStyle(stage);
    const family = cs.getPropertyValue('--s-font').trim() || 'Inter Tight, sans-serif';
    const font = `900 ${fs}px ${family}`;

    const word = el('div', {
      position: 'absolute', left: '0', top: '0', fontFamily: family, fontWeight: '900', fontSize: `${fs}px`, lineHeight: '1', letterSpacing: '-0.02em',
      whiteSpace: 'nowrap', color: 'transparent', backgroundImage: SEA, backgroundSize: '100% 100%, 100% 100%', WebkitBackgroundClip: 'text', backgroundClip: 'text',
    }, stage, text);
    // Medidas reales y centrado
    const w = word.offsetWidth, h = word.offsetHeight;
    const left = (1920 - w) / 2, top = (1080 - h) / 2 - 20;
    Object.assign(word.style, { left: `${left}px`, top: `${top}px` });

    // Punto interior de la letra central (mismo font en canvas)
    const g = document.createElement('canvas').getContext('2d');
    g.font = font;
    const m = g.measureText(text);
    const asc = m.fontBoundingBoxAscent ?? fs * 0.9, desc = m.fontBoundingBoxDescent ?? fs * 0.25;
    const baseline = (h - (asc + desc)) / 2 + asc;
    const mid = Math.floor(text.length / 2);
    const scaleX = w / m.width; // compensa el letter-spacing aplicado en CSS
    const x0 = g.measureText(text.slice(0, mid)).width, x1 = g.measureText(text.slice(0, mid + 1)).width;
    const pt = deepestPoint(text, font, m.width + 10, h, baseline, x0, x1);
    const ox = pt.x * scaleX, oy = pt.y;
    word.style.transformOrigin = `${ox}px ${oy}px`;

    const kicker = el('div', { ...MONO, position: 'absolute', left: '0', right: '0', top: `${top - 40}px`, textAlign: 'center', color: 'var(--s-muted)' }, stage, 'Un documental sobre');
    const full = layer(stage, { backgroundImage: SEA, visibility: 'hidden' });
    const fullTitle = el('div', { position: 'absolute', left: '150px', bottom: '140px', color: '#fff' }, full);
    el('div', { ...MONO, marginBottom: '16px', opacity: '0.8' }, fullTitle, 'Capítulo 1');
    el('div', { ...SERIF, fontSize: '120px', lineHeight: '1' }, fullTitle, 'La orilla');

    const intro = 0.7, read = p.lectura, z = p.duracion;
    const tl = gsap.timeline({ paused: true });
    tl.fromTo(word, { autoAlpha: 0, y: 40 }, { autoAlpha: 1, y: 0, duration: intro, ease: 'power3.out' }, 0);
    tl.fromTo(kicker, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.5 }, 0.2);
    // El mar "respira" dentro de la palabra durante toda la toma.
    tl.fromTo(word, { backgroundPosition: '0px 0px, 0px 0px' }, { backgroundPosition: '0px 120px, 0px 0px', duration: intro + read + z, ease: 'none' }, 0);
    tl.to(kicker, { autoAlpha: 0, duration: 0.3 }, intro + read - 0.2);
    tl.fromTo(word, { scale: 1 }, { scale: p.escalaFinal, duration: z, ease: p.ease, immediateRender: false }, intro + read);
    // Al final del zoom, la escena completa toma el relevo (la letra ya llena la pantalla).
    tl.fromTo(full, { autoAlpha: 0 }, { autoAlpha: 1, duration: z * 0.25, ease: 'none', immediateRender: false }, intro + read + z * 0.75);
    tl.fromTo(fullTitle, { autoAlpha: 0, y: 30 }, { autoAlpha: 1, y: 0, duration: 0.7, ease: 'power3.out' }, intro + read + z + 0.1);
    tl.to({}, { duration: 1.2 });
    return tl;
  },
};
