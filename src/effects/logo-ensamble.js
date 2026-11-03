// Logo que se ensambla: las piezas del isotipo llegan desde posiciones y giros
// dispersos (semilla) y encajan en su lugar; al cerrar, un leve pulso marca el
// "clic" y el nombre sale desde detrás del isotipo. Metáfora de integración:
// muchas partes, un sistema.
import { el, layer, DISPLAY, tone } from '../core/kit.js';

const COLS = ['var(--s-accent)', 'var(--s-accent2)', 'var(--s-accent3)'];

// Piezas en coordenadas locales de un cuadro de 300x300.
function piezasDe(tipo) {
  if (tipo === 'barras') return [60, 140, 220, 160, 100].map((h, i) => ({ x: i * 62, y: 300 - h - 20, w: 46, h, r: '23px' }));
  if (tipo === 'circulo') return [[0, 0, '150px 0 0 0'], [150, 0, '0 150px 0 0'], [0, 150, '0 0 0 150px'], [150, 150, '0 0 150px 0']]
    .map(([x, y, r]) => ({ x: x + (x ? 6 : -6), y: y + (y ? 6 : -6), w: 150, h: 150, r }));
  return Array.from({ length: 9 }, (_, i) => ({ x: (i % 3) * 102, y: Math.floor(i / 3) * 102, w: 92, h: 92, r: '18px' }));
}

export default {
  id: 'logo-ensamble',
  poster: 0.9,
  build(stage, p, { gsap, rng }) {
    layer(stage, { background: 'var(--s-bg)' });
    const mark = el('div', { position: 'absolute', left: '810px', top: '300px', width: '300px', height: '300px' }, stage);
    const r = rng(p.semilla);
    const pieces = piezasDe(p.piezas).map((q, i) => {
      const node = el('div', { position: 'absolute', left: `${q.x}px`, top: `${q.y}px`, width: `${q.w}px`, height: `${q.h}px`, borderRadius: q.r,
        background: i === 0 ? tone(p.color) : COLS[i % COLS.length] }, mark);
      const a = r() * Math.PI * 2, dist = p.dispersion * (0.6 + r() * 0.6);
      return { node, x: Math.cos(a) * dist, y: Math.sin(a) * dist, rot: (r() - 0.5) * 2 * p.rotacion };
    });
    const wordWin = el('div', { position: 'absolute', left: '0', right: '0', top: '660px', textAlign: 'center', overflow: 'hidden', paddingBottom: '10px' }, stage);
    const word = el('div', { ...DISPLAY, display: 'inline-block', fontSize: '130px', color: 'var(--s-ink)' }, wordWin, p.marca || '');

    const t0 = 0.3;
    const tl = gsap.timeline({ paused: true });
    pieces.forEach(({ node, x, y, rot }, i) => {
      tl.fromTo(node, { x, y, rotate: rot, autoAlpha: 0, scale: 0.6 }, { x: 0, y: 0, rotate: 0, autoAlpha: 1, scale: 1, duration: p.duracion, ease: p.ease }, t0 + i * p.escalonado);
    });
    const tLock = t0 + (pieces.length - 1) * p.escalonado + p.duracion;
    tl.fromTo(mark, { scale: 1 }, { scale: 1.06, duration: 0.14, ease: 'power2.out', yoyo: true, repeat: 1, immediateRender: false }, tLock);
    tl.fromTo(word, { yPercent: -110 }, { yPercent: 0, duration: 0.7, ease: 'power3.out' }, tLock + 0.2);
    tl.to({}, { duration: 1.6 });
    return tl;
  },
};
