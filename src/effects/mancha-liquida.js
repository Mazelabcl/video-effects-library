// Mancha líquida: una masa de color sube desde abajo con bordes de gotas que se
// funden entre sí (filtro "goo": desenfoque + umbral de alfa), tapa la escena A
// y sigue subiendo hasta destapar la B. Posiciones y retrasos de cada gota salen
// de la semilla: mismo resultado en cada render.
import { el, svg, layer, splitText, nextId, DISPLAY, MONO, tone } from '../core/kit.js';

function escenaLiquida(parent, num, title, bg, ink) {
  const s = layer(parent, { background: bg, color: ink });
  el('div', { ...MONO, position: 'absolute', left: '140px', top: '400px', opacity: '0.7' }, s, num);
  const t = el('div', { ...DISPLAY, position: 'absolute', left: '130px', top: '450px', fontSize: '170px', width: '1600px' }, s);
  return { s, words: splitText(t, title, 'palabra') };
}

export default {
  id: 'mancha-liquida',
  poster: 0.5,
  build(stage, p, { gsap, rng }) {
    const A = escenaLiquida(stage, 'Producto', 'Sabor original', 'var(--s-bg)', 'var(--s-ink)');
    const B = escenaLiquida(stage, 'Novedad', 'Edición frutal', 'var(--s-bg-2)', 'var(--s-ink)');

    // Filtro goo propio (id único: pueden convivir varias tarjetas en la galería).
    const fid = nextId('goo');
    const defs = svg('svg', { width: '0', height: '0', style: 'position:absolute' }, stage);
    const f = svg('filter', { id: fid, x: '-20%', y: '-20%', width: '140%', height: '140%' }, defs);
    svg('feGaussianBlur', { in: 'SourceGraphic', stdDeviation: String(p.viscosidad) }, f);
    svg('feColorMatrix', { values: '1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 28 -11' }, f);

    const goo = layer(stage, { filter: `url(#${fid})`, overflow: 'visible', pointerEvents: 'none' });
    const color = tone(p.color);
    const rectH = 1080 + 700;
    const rect = el('div', { position: 'absolute', left: '-100px', width: '2120px', top: '0', height: `${rectH}px`, background: color }, goo);
    const r = rng(p.semilla);
    const n = Math.round(p.manchas);
    const drops = [];
    for (let i = 0; i < n * 2; i++) {
      const top = i < n; // la mitad en el borde superior, la otra en el inferior
      const size = 160 + r() * 220;
      const x = ((i % n) + 0.5) * (1920 / n) + (r() - 0.5) * (1920 / n) * 0.6;
      const d = el('div', { position: 'absolute', left: `${x - size / 2}px`, width: `${size}px`, height: `${size}px`, borderRadius: '50%', background: color,
        top: `${top ? -size * 0.45 : rectH - size * 0.55}px` }, goo);
      drops.push({ d, lag: (r() - 0.5) * 0.12 });
    }

    const hold = 1.0, d = p.duracion;
    const y0 = 1080 + 260, y1 = -rectH - 260; // recorrido completo de abajo hacia arriba
    const tl = gsap.timeline({ paused: true });
    tl.set(B.s, { autoAlpha: 0 }, 0);
    tl.fromTo(A.words, { yPercent: 105 }, { yPercent: 0, duration: 0.7, stagger: 0.07, ease: 'power3.out' }, 0.05);
    tl.fromTo(rect, { y: y0 }, { y: y1, duration: d, ease: p.ease }, hold);
    drops.forEach(({ d: node, lag }) => tl.fromTo(node, { y: y0 }, { y: y1, duration: d, ease: p.ease }, hold + lag * d));
    // Corte cuando la masa está en el centro del recorrido (progreso 0,5) y cubre
    // toda la pantalla. Con curvas asimétricas ese instante no es la mitad del
    // tiempo: se busca invirtiendo la curva (búsqueda binaria).
    const ez = gsap.parseEase(p.ease);
    let lo = 0, hi = 1;
    for (let k = 0; k < 30; k++) { const m = (lo + hi) / 2; if (ez(m) < 0.5) lo = m; else hi = m; }
    const cut = hold + d * lo;
    tl.set(A.s, { autoAlpha: 0 }, cut);
    tl.set(B.s, { autoAlpha: 1 }, cut);
    tl.fromTo(B.words, { yPercent: 105 }, { yPercent: 0, duration: 0.7, stagger: 0.07, ease: 'power3.out', immediateRender: false }, cut + d * 0.15);
    tl.to({}, { duration: 1.0 });
    return tl;
  },
};
