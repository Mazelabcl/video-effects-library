// Rotador de palabras: frase fija + hueco con palabras que rotan en vertical.
// El bloque de acento cambia de ancho EN SINCRONÍA con la palabra, así el
// layout nunca "salta" (error típico de este recurso).
import { el, layer, DISPLAY } from '../core/kit.js';

export default {
  id: 'rotador-palabras',
  poster: 0.3,
  build(stage, p, { gsap }) {
    const words = String(p.palabras || '').split(',').map((w) => w.trim()).filter(Boolean).slice(0, 6);
    if (!words.length) words.push('…');
    layer(stage, { background: 'var(--s-bg)' });
    const fs = 140, lh = fs * 1.18, padX = 34;
    const wrap = el('div', { ...DISPLAY, position: 'absolute', left: '160px', top: '330px', fontSize: `${fs}px`, lineHeight: `${lh}px`, color: 'var(--s-ink)' }, stage);
    el('div', {}, wrap, 'Hacemos marcas');
    const row = el('div', { display: 'flex', alignItems: 'center', gap: '36px', whiteSpace: 'nowrap' }, wrap);
    el('span', {}, row, 'que');
    const slot = el('span', { position: 'relative', display: 'inline-block', height: `${lh}px`, overflow: 'hidden', background: 'var(--s-accent)', borderRadius: 'calc(var(--s-radius) * 0.6)', color: 'var(--s-bg)' }, row);
    const col = el('span', { position: 'absolute', left: `${padX}px`, top: '0', display: 'block' }, slot);
    const all = [...words, words[0]]; // la primera se repite al final para un bucle continuo
    const spans = all.map((w) => el('span', { display: 'block', whiteSpace: 'nowrap', height: `${lh}px` }, col, w));
    // Medición: anchos reales con la fuente ya cargada.
    const widths = spans.map((s) => { s.style.display = 'inline-block'; const w = s.offsetWidth; s.style.display = 'block'; return w + padX * 2; });
    slot.style.width = `${widths[0]}px`;

    const tl = gsap.timeline({ paused: true });
    tl.fromTo(wrap, { autoAlpha: 0, y: 40 }, { autoAlpha: 1, y: 0, duration: 0.6, ease: 'power3.out' }, 0);
    let t = 0.6 + p.permanencia;
    for (let i = 1; i < all.length; i++) {
      tl.to(col, { y: -lh * i, duration: p.transicion, ease: p.ease }, t);
      tl.to(slot, { width: widths[i], duration: p.transicion, ease: p.ease }, t);
      t += p.transicion + p.permanencia;
    }
    tl.to({}, { duration: 0.01 }, t - 0.01);
    return tl;
  },
};
