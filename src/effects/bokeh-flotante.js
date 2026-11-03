// Bokeh flotante: círculos de luz desenfocados suben lentamente a distintas
// velocidades (los grandes, más cerca, suben más rápido: parallax). La posición
// vertical usa módulo sobre la altura, así cada círculo reaparece abajo; con una
// cantidad entera de recorridos por duración, el fondo cierra en bucle.
import { el, layer, SERIF } from '../core/kit.js';

const COLS = ['var(--s-accent)', 'var(--s-accent2)', 'var(--s-accent3)', 'var(--s-ink)'];

export default {
  id: 'bokeh-flotante',
  poster: 0.5,
  build(stage, p, { gsap, rng }) {
    layer(stage, { background: 'radial-gradient(ellipse at 50% 100%, var(--s-bg-2) 0%, var(--s-bg) 70%)' });
    const field = layer(stage);
    const r = rng(p.semilla);
    const n = Math.round(p.cantidad);
    const dots = Array.from({ length: n }, () => {
      const depth = r(); // 0 = lejos, 1 = cerca
      const size = p.tamano * (0.35 + depth * 1.1);
      const node = el('div', { position: 'absolute', left: '0', top: '0', width: `${size}px`, height: `${size}px`, borderRadius: '50%',
        background: COLS[Math.floor(r() * COLS.length)], opacity: String(p.opacidad * (0.4 + depth * 0.6)), filter: `blur(${p.desenfoque * (0.4 + (1 - depth) * 0.8)}px)`,
        boxShadow: 'inset 0 0 0 2px rgba(255,255,255,0.15)' }, field);
      // Vueltas completas en la duración (entero, mínimo 1): bucle sin salto.
      const loops = Math.max(1, Math.round((p.velocidad * (0.5 + depth)) * p.duracion / (1080 + size)));
      return { node, size, x: r() * 1920, y0: r(), loops, sway: 10 + r() * 30, ph: r() * Math.PI * 2 };
    });
    const title = el('div', { ...SERIF, position: 'absolute', left: '0', right: '0', top: '450px', textAlign: 'center', fontSize: '120px', color: 'var(--s-ink)' }, stage, p.texto || '');

    const st = { t: 0 };
    const render = () => {
      for (const d of dots) {
        const span = 1080 + d.size;
        const y = ((((d.y0 - st.t * d.loops) % 1) + 1) % 1) * span - d.size;
        gsap.set(d.node, { x: d.x + Math.sin(st.t * Math.PI * 2 + d.ph) * d.sway, y });
      }
    };
    const tl = gsap.timeline({ paused: true });
    tl.fromTo(st, { t: 0 }, { t: 1, duration: p.duracion, ease: 'none', onUpdate: render }, 0);
    tl.fromTo(title, { autoAlpha: 0 }, { autoAlpha: 1, duration: 1.4, ease: 'sine.inOut' }, 0.5);
    render();
    return tl;
  },
};
