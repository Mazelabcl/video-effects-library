// Pila de palabras justificada: cada línea se escala para medir EXACTAMENTE el
// mismo ancho, formando un bloque compacto tipo afiche. Las líneas entran desde
// lados alternos, en orden de lectura. Se mide con la fuente ya cargada.
import { el, layer, DISPLAY } from '../core/kit.js';

export default {
  id: 'pila-palabras',
  poster: 0.85,
  build(stage, p, { gsap }) {
    const lines = String(p.texto || ' ').split('\n').map((l) => l.trim()).filter(Boolean).slice(0, 6);
    if (!lines.length) lines.push('…');
    layer(stage, { background: 'var(--s-bg)' });
    const block = el('div', { position: 'absolute', left: `${(1920 - p.ancho) / 2}px`, width: `${p.ancho}px`, top: '0' }, stage);
    const rows = lines.map((l, i) => {
      const win = el('div', { overflow: 'hidden' }, block);
      const row = el('div', { ...DISPLAY, display: 'inline-block', whiteSpace: 'nowrap', fontSize: '100px', lineHeight: '0.9', color: i % 2 ? 'var(--s-accent)' : 'var(--s-ink)' }, win, l);
      const fs = (100 * p.ancho) / (row.offsetWidth || 1);
      row.style.fontSize = `${fs}px`;
      return { win, row };
    });
    // Centrado vertical con la altura real del bloque.
    block.style.top = `${(1080 - block.offsetHeight) / 2}px`;

    const tl = gsap.timeline({ paused: true });
    rows.forEach(({ row }, i) => {
      const dir = p.alternar === 'si' && i % 2 ? 1 : -1;
      tl.fromTo(row, { xPercent: 105 * dir }, { xPercent: 0, duration: p.duracion, ease: p.ease }, 0.2 + i * p.escalonado);
    });
    tl.to({}, { duration: 1.6 });
    return tl;
  },
};
