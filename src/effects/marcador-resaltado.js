// Marcador resaltado: la frase se lee primero completa y DESPUÉS un trazo de
// color barre detrás de la parte clave (marcada con *asteriscos* en el texto).
// El orden importa: primero contexto, luego énfasis. El trazo va detrás del texto
// (z-index en un contexto aislado), nunca encima, para no perder legibilidad.
import { el, layer, splitText, DISPLAY, MONO, tone } from '../core/kit.js';

export default {
  id: 'marcador-resaltado',
  poster: 0.85,
  build(stage, p, { gsap }) {
    layer(stage, { background: 'var(--s-bg)' });
    el('div', { ...MONO, position: 'absolute', left: '160px', top: '310px', color: 'var(--s-muted)' }, stage, 'Por qué elegirnos');
    const box = el('div', { ...DISPLAY, position: 'absolute', left: '150px', top: '360px', width: '1620px', fontSize: '130px', lineHeight: '1.12', color: 'var(--s-ink)' }, stage);

    // Segmentos: texto normal / *resaltado*
    const parts = String(p.texto || ' ').split('*');
    const words = [];
    const marks = [];
    parts.forEach((seg, i) => {
      if (!seg) return;
      if (i % 2 === 1) {
        const hl = el('span', { position: 'relative', display: 'inline-block', whiteSpace: 'nowrap', isolation: 'isolate', padding: '0 0.08em' }, box);
        const geo = p.estilo === 'caja' ? { top: '0.02em', bottom: '-0.02em' } : p.estilo === 'subrayado' ? { bottom: '0.1em', height: '0.1em' } : { bottom: '0.18em', height: '0.4em' };
        const mark = el('span', { position: 'absolute', left: '0', right: '0', ...geo, background: tone(p.color), zIndex: '-1', transformOrigin: '0 50%',
          transform: p.estilo === 'marcador' ? 'skewX(-8deg) rotate(-1deg)' : 'none', borderRadius: p.estilo === 'marcador' ? '0.08em' : '0' }, hl);
        const txt = el('span', {}, hl);
        words.push(...splitText(txt, seg.trim(), 'palabra'));
        marks.push({ mark, hl });
      } else {
        const txt = el('span', {}, box);
        words.push(...splitText(txt, seg, 'palabra'));
      }
      el('span', { display: 'inline-block', width: '0.28em' }, box);
    });

    const tl = gsap.timeline({ paused: true });
    tl.fromTo(words, { yPercent: 105 }, { yPercent: 0, duration: 0.7, stagger: 0.06, ease: 'power3.out' }, 0.2);
    const tMark = 0.2 + 0.7 + words.length * 0.06 + 0.5; // pausa de lectura antes del énfasis
    marks.forEach(({ mark, hl }, i) => {
      tl.fromTo(mark, { scaleX: 0 }, { scaleX: 1, duration: p.duracion, ease: p.ease }, tMark + i * (p.duracion * 0.7));
      // En estilo caja el texto invierte su color cuando el bloque ya lo cubre.
      if (p.estilo === 'caja') tl.set(hl, { color: 'var(--s-bg)' }, tMark + i * (p.duracion * 0.7) + p.duracion * 0.5);
    });
    tl.to({}, { duration: 1.6 });
    return tl;
  },
};
