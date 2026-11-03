// Gradiente de malla: 5 manchas de color muy desenfocadas derivan en órbitas
// lentas (Lissajous) y se mezclan entre sí. La posición es función pura del
// tiempo y cada órbita da un número ENTERO de vueltas en la duración: el fondo
// cierra en bucle perfecto. Pensado como fondo bajo un titular, no como protagonista.
import { el, layer, DISPLAY } from '../core/kit.js';

const PALETAS = {
  tema: ['var(--s-accent)', 'var(--s-accent2)', 'var(--s-accent3)', 'var(--s-accent)', 'var(--s-bg-2)'],
  calida: ['#ff6a3d', '#ffb347', '#ff3d7f', '#ffd27a', '#7a2b52'],
  fria: ['#3a6bff', '#00c2ff', '#7a5cff', '#00e0b0', '#12305e'],
};

export default {
  id: 'gradiente-malla',
  poster: 0.3,
  build(stage, p, { gsap, rng }) {
    layer(stage, { background: 'var(--s-bg)' });
    const field = layer(stage, { filter: `blur(${p.desenfoque}px) saturate(1.15)`, opacity: String(p.intensidad) });
    const r = rng(p.semilla);
    const cols = PALETAS[p.paleta] || PALETAS.tema;
    const blobs = cols.map((c) => {
      const size = 700 + r() * 600;
      const node = el('div', { position: 'absolute', left: '0', top: '0', width: `${size}px`, height: `${size}px`, borderRadius: '50%', background: c }, field);
      return { node, size, cx: 300 + r() * 1320, cy: 200 + r() * 680, ax: 220 + r() * 380, ay: 140 + r() * 260,
        kx: 1 + Math.floor(r() * 2), ky: 1 + Math.floor(r() * 2), ph: r() * Math.PI * 2 };
    });
    // Grano sutil encima: evita el "banding" de los degradados en el MP4.
    layer(stage, { opacity: '0.06', backgroundImage: 'repeating-radial-gradient(circle at 30% 30%, #fff 0 1px, transparent 1px 3px)' });
    const title = el('div', { ...DISPLAY, position: 'absolute', left: '0', right: '0', top: '440px', textAlign: 'center', fontSize: '150px', color: 'var(--s-ink)' }, stage, p.texto || '');

    const st = { t: 0 };
    const cyc = Math.round(p.ciclos);
    const render = () => {
      const a = st.t * Math.PI * 2 * cyc;
      for (const b of blobs) {
        gsap.set(b.node, { x: b.cx + Math.sin(a * b.kx + b.ph) * b.ax - b.size / 2, y: b.cy + Math.cos(a * b.ky + b.ph) * b.ay - b.size / 2 });
      }
    };
    const tl = gsap.timeline({ paused: true });
    tl.fromTo(st, { t: 0 }, { t: 1, duration: p.duracion, ease: 'none', onUpdate: render }, 0);
    tl.fromTo(title, { autoAlpha: 0, y: 30 }, { autoAlpha: 1, y: 0, duration: 1.2, ease: 'sine.out' }, 0.4);
    render();
    return tl;
  },
};
