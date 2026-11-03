// Mosaico de cuadros: una cuadrícula de baldosas crece y tapa la escena A
// (en el orden elegido: desde el centro, bordes, etc.), se hace el cambio
// mientras todo está cubierto y las baldosas se encogen destapando la B.
// El escalonado usa la opción grid de GSAP: el orden es espacial, no por índice.
import { el, layer, splitText, DISPLAY, MONO, tone } from '../core/kit.js';

const FROM = { inicio: 'start', centro: 'center', final: 'end', bordes: 'edges' };

function escenaMosaico(parent, num, title, bg, ink) {
  const s = layer(parent, { background: bg, color: ink });
  el('div', { ...MONO, position: 'absolute', left: '140px', top: '400px', opacity: '0.7' }, s, num);
  const t = el('div', { ...DISPLAY, position: 'absolute', left: '130px', top: '450px', fontSize: '170px', width: '1600px' }, s);
  return { s, words: splitText(t, title, 'palabra') };
}

export default {
  id: 'mosaico-cuadros',
  poster: 0.45,
  build(stage, p, { gsap }) {
    const A = escenaMosaico(stage, 'Paso 1', 'Diagnóstico', 'var(--s-bg)', 'var(--s-ink)');
    const B = escenaMosaico(stage, 'Paso 2', 'Estrategia', 'var(--s-bg-2)', 'var(--s-ink)');
    const cols = Math.round(p.columnas);
    const rows = Math.max(1, Math.round((cols * 9) / 16));
    const cw = 1920 / cols, ch = 1080 / rows;
    const grid = layer(stage, { pointerEvents: 'none' });
    const tiles = [];
    for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) {
      tiles.push(el('div', { position: 'absolute', left: `${c * cw - 1}px`, top: `${r * ch - 1}px`, width: `${cw + 2}px`, height: `${ch + 2}px`, background: tone(p.color) }, grid));
    }
    const stagger = { grid: [rows, cols], from: FROM[p.origen] || 'center', amount: p.barrido };
    const hold = 1.0;
    const covered = hold + p.duracion + p.barrido;

    const tl = gsap.timeline({ paused: true });
    tl.set(B.s, { autoAlpha: 0 }, 0);
    tl.fromTo(A.words, { yPercent: 105 }, { yPercent: 0, duration: 0.7, stagger: 0.07, ease: 'power3.out' }, 0.05);
    tl.fromTo(tiles, { scale: 0 }, { scale: 1, duration: p.duracion, ease: p.ease, stagger }, hold);
    tl.set(A.s, { autoAlpha: 0 }, covered);
    tl.set(B.s, { autoAlpha: 1 }, covered);
    tl.fromTo(tiles, { scale: 1 }, { scale: 0, duration: p.duracion, ease: p.ease, stagger, immediateRender: false }, covered + 0.05);
    tl.fromTo(B.words, { yPercent: 105 }, { yPercent: 0, duration: 0.7, stagger: 0.07, ease: 'power3.out', immediateRender: false }, covered + p.duracion * 0.6);
    tl.to({}, { duration: 1.0 });
    return tl;
  },
};
