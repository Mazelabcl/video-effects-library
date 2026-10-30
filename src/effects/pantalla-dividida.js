// Pantalla dividida: los paneles se abren como rendijas desde su eje y luego
// muestran una ACCIÓN PARALELA: los mismos 12 bloques se comportan distinto en
// cada panel (plan ordenado / realidad caótica / ajuste). La etiqueta de cada
// panel dice qué se compara (si no, el split no comunica).
import { el, layer, rng, DISPLAY, MONO } from '../core/kit.js';

const PANELS = [
  { tag: 'El plan', big: 'Así lo pensamos', mode: 'grid' },
  { tag: 'La realidad', big: 'Así pasó', mode: 'chaos' },
  { tag: 'El ajuste', big: 'Así lo resolvimos', mode: 'bars' },
];

export default {
  id: 'pantalla-dividida',
  poster: 0.85,
  build(stage, p, { gsap }) {
    const n = Math.round(p.paneles);
    const vertical = p.orientacion === 'vertical';
    const wrap = layer(stage, { display: 'flex', flexDirection: vertical ? 'row' : 'column', gap: `${p.divisor}px`, background: 'var(--s-accent)' });
    const r = rng(8);
    const panels = PANELS.slice(0, n).map((cfg, i) => {
      const pn = el('div', { position: 'relative', flex: '1', overflow: 'hidden', background: i === 1 ? 'var(--s-bg-2)' : 'var(--s-bg)' }, wrap);
      const pw = vertical ? (1920 - p.divisor * (n - 1)) / n : 1920;
      const ph = vertical ? 1080 : (1080 - p.divisor * (n - 1)) / n;
      const sc = Math.min(1, vertical ? pw / 900 : ph / 520);
      el('div', { ...MONO, position: 'absolute', left: `${60 * sc + 20}px`, top: `${60 * sc + 10}px`, color: i === 1 ? 'var(--s-accent2)' : 'var(--s-accent)', fontSize: `${Math.max(16, 26 * sc)}px` }, pn, cfg.tag);
      el('div', { ...DISPLAY, position: 'absolute', left: `${60 * sc + 18}px`, top: `${110 * sc + 16}px`, fontSize: `${Math.max(34, 92 * sc)}px`, color: 'var(--s-ink)', width: `${pw - 120}px` }, pn, cfg.big);
      const field = el('div', { position: 'absolute', left: '50%', top: vertical ? '62%' : '60%', width: '0', height: '0', transform: `scale(${sc})` }, pn);
      const blocks = Array.from({ length: 12 }, (_, k) => el('div', { position: 'absolute', left: '-35px', top: '-35px', width: '70px', height: '70px', borderRadius: 'calc(var(--s-radius) * 0.35)', background: k % 4 === 0 ? (i === 1 ? 'var(--s-accent2)' : 'var(--s-accent)') : 'var(--s-ink)', opacity: '0.9' }, field));
      const targets = blocks.map((_, k) => {
        if (cfg.mode === 'grid') return { x: ((k % 4) - 1.5) * 95, y: (Math.floor(k / 4) - 1) * 95, rotate: 0 };
        if (cfg.mode === 'chaos') return { x: (r() - 0.5) * 520, y: (r() - 0.5) * 300, rotate: (r() - 0.5) * 120 };
        const col = k % 6, row = Math.floor(k / 6);
        return { x: (col - 2.5) * 85, y: 120 - row * 85 - (col % 3) * 85 * (row ? 1 : 0), rotate: 0 };
      });
      return { pn, blocks, targets };
    });

    const tl = gsap.timeline({ paused: true });
    // 1) El divisor (color de fondo) aparece primero: el "corte" en dos.
    panels.forEach(({ pn }, i) => {
      tl.fromTo(pn, { clipPath: vertical ? 'inset(50% 0% 50% 0%)' : 'inset(0% 50% 0% 50%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: p.duracion, ease: p.ease }, 0.3 + i * p.escalonado);
    });
    // 2) Acción paralela: todos los bloques parten del centro AL MISMO TIEMPO.
    const t2 = 0.3 + p.duracion * 0.7 + (n - 1) * p.escalonado;
    panels.forEach(({ blocks, targets }, i) => {
      blocks.forEach((b, k) => {
        tl.fromTo(b, { x: 0, y: 0, rotate: 0, scale: 0.2 }, { ...targets[k], scale: 1, duration: 1.1, ease: i === 1 ? 'power2.out' : 'power3.inOut', delay: k * 0.03 }, t2);
      });
    });
    tl.to({}, { duration: 1.3 });
    return tl;
  },
};
