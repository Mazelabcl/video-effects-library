// Pictograma de proporción (isotipo): una grilla de figuras humanas donde se
// encienden, una a una, las que representan la proporción ("7 de cada 10").
// Contar personas se entiende mejor que un porcentaje abstracto. El número de
// figuras encendidas y el texto se derivan del mismo contador: siempre coinciden.
import { el, layer, DISPLAY, SERIF, tone } from '../core/kit.js';

export default {
  id: 'pictograma-proporcion',
  poster: 0.92,
  build(stage, p, { gsap }) {
    const total = Math.round(p.total);
    const on = Math.round((p.proporcion / 100) * total);
    layer(stage, { background: 'var(--s-bg)' });
    const cols = total <= 10 ? total : total <= 20 ? 10 : total <= 50 ? 10 : 20;
    const rows = Math.ceil(total / cols);
    const cell = Math.min(1500 / cols, 560 / rows);
    const gridW = cell * cols;
    const grid = el('div', { position: 'absolute', left: `${(1920 - gridW) / 2}px`, top: `${300 + (560 - cell * rows) / 2}px`, width: `${gridW}px` }, stage);
    const color = tone(p.color);
    const people = Array.from({ length: total }, (_, i) => {
      const fig = el('div', { position: 'absolute', left: `${(i % cols) * cell}px`, top: `${Math.floor(i / cols) * cell}px`, width: `${cell}px`, height: `${cell}px` }, grid);
      const head = el('div', { position: 'absolute', left: '36%', width: '28%', top: '6%', height: '28%', borderRadius: '50%', background: 'var(--s-ink)', opacity: '0.18' }, fig);
      const body = el('div', { position: 'absolute', left: '24%', width: '52%', top: '38%', height: '54%', borderRadius: '40% 40% 8% 8%', background: 'var(--s-ink)', opacity: '0.18' }, fig);
      return { fig, parts: [head, body] };
    });
    const big = el('div', { ...DISPLAY, position: 'absolute', left: '0', right: '0', top: '110px', textAlign: 'center', fontSize: '120px', color: 'var(--s-ink)', fontVariantNumeric: 'tabular-nums' }, stage, `0 de cada ${total}`);
    const frase = el('div', { ...SERIF, position: 'absolute', left: '0', right: '0', top: '900px', textAlign: 'center', fontSize: '64px', color: 'var(--s-muted)' }, stage, p.frase || '');

    const st = { n: 0 };
    const render = () => {
      const n = Math.floor(st.n + 1e-6);
      people.forEach(({ parts }, i) => parts.forEach((x) => { x.style.background = i < n ? color : 'var(--s-ink)'; x.style.opacity = i < n ? '1' : '0.18'; }));
      big.textContent = `${n} de cada ${total}`;
    };
    const tl = gsap.timeline({ paused: true });
    tl.fromTo(people.map((x) => x.fig), { autoAlpha: 0, y: 14 }, { autoAlpha: 1, y: 0, duration: 0.4, ease: 'power2.out', stagger: { amount: 0.6, grid: [rows, cols], from: 'start' } }, 0.1);
    tl.fromTo(big, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.4 }, 0.3);
    tl.fromTo(st, { n: 0 }, { n: on, duration: Math.max(0.3, on * p.escalonado), ease: 'none', onUpdate: render }, 1.0);
    tl.fromTo(frase, { autoAlpha: 0, y: 20 }, { autoAlpha: 1, y: 0, duration: 0.7, ease: 'power3.out' }, 1.0 + on * p.escalonado + 0.3);
    tl.to({}, { duration: 1.6 });
    render();
    return tl;
  },
};
