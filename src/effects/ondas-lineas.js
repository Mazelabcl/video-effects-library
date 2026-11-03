// Ondas de líneas: un campo de líneas horizontales ondula como un mapa
// topográfico en movimiento. Cada línea es la suma de dos senos con fase propia;
// la fase avanza un número entero de ciclos en la duración (bucle perfecto).
// Las líneas centrales tienen más amplitud: el ojo se va al centro, donde va el texto.
import { el, svg, layer, DISPLAY, tone } from '../core/kit.js';

export default {
  id: 'ondas-lineas',
  poster: 0.3,
  build(stage, p, { gsap }) {
    layer(stage, { background: 'var(--s-bg)' });
    const s = svg('svg', { width: '1920', height: '1080', viewBox: '0 0 1920 1080', style: 'position:absolute;inset:0' }, stage);
    const n = Math.round(p.lineas);
    const paths = Array.from({ length: n }, (_, i) => svg('path', { fill: 'none', stroke: i % 5 === 2 ? tone(p.color) : 'var(--s-ink)', 'stroke-width': String(p.grosor),
      opacity: i % 5 === 2 ? '0.9' : '0.22' }, s));
    const title = el('div', { ...DISPLAY, position: 'absolute', left: '0', right: '0', top: '450px', textAlign: 'center', fontSize: '140px', color: 'var(--s-ink)' }, stage, p.texto || '');

    const st = { t: 0 };
    const cyc = Math.round(p.ciclos);
    const STEPS = 64;
    const render = () => {
      const a = st.t * Math.PI * 2 * cyc;
      paths.forEach((path, i) => {
        const y0 = 80 + (i + 0.5) * (920 / n);
        const center = 1 - Math.abs(i / Math.max(1, n - 1) - 0.5) * 1.4; // más amplitud al centro
        let d = '';
        for (let k = 0; k <= STEPS; k++) {
          const x = (k / STEPS) * 1920, u = (k / STEPS) * Math.PI * 2 * p.frecuencia;
          const y = y0 + p.amplitud * Math.max(0.15, center) * (Math.sin(u + a + i * 0.35) * 0.7 + Math.sin(u * 0.5 - a + i * 0.2) * 0.3);
          d += `${k ? 'L' : 'M'}${x.toFixed(1)} ${y.toFixed(1)}`;
        }
        path.setAttribute('d', d);
      });
    };
    const tl = gsap.timeline({ paused: true });
    tl.fromTo(st, { t: 0 }, { t: 1, duration: p.duracion, ease: 'none', onUpdate: render }, 0);
    tl.fromTo(title, { autoAlpha: 0, y: 24 }, { autoAlpha: 1, y: 0, duration: 1, ease: 'power3.out' }, 0.5);
    render();
    return tl;
  },
};
