// Logo con pulso de ondas: anillos concéntricos se expanden desde el centro
// (como una señal que se emite) y, en el hueco que dejan, el isotipo aparece
// con un rebote. Después nombre y lema. Comunica alcance, "estamos al aire".
// Los anillos se desvanecen al crecer: la energía se disipa, no se acumula.
import { el, layer, DISPLAY, SERIF, tone } from '../core/kit.js';

export default {
  id: 'logo-pulso-ondas',
  poster: 0.85,
  build(stage, p, { gsap }) {
    layer(stage, { background: 'var(--s-bg)' });
    const cx = 960, cy = 440;
    const color = tone(p.color);
    const n = Math.round(p.anillos);
    const rings = Array.from({ length: n }, () => el('div', { position: 'absolute', left: `${cx - p.alcance}px`, top: `${cy - p.alcance}px`, width: `${p.alcance * 2}px`, height: `${p.alcance * 2}px`,
      borderRadius: '50%', border: `${p.grosor}px solid ${color}`, boxSizing: 'border-box' }, stage));
    const mark = el('div', { position: 'absolute', left: `${cx - 110}px`, top: `${cy - 110}px`, width: '220px', height: '220px', borderRadius: '50%', background: color, display: 'grid', placeItems: 'center' }, stage);
    el('div', { width: '80px', height: '80px', borderRadius: '50%', border: '14px solid var(--s-bg)', boxSizing: 'border-box' }, mark);
    const word = el('div', { ...DISPLAY, position: 'absolute', left: '0', right: '0', top: `${cy + 170}px`, textAlign: 'center', fontSize: '120px', color: 'var(--s-ink)' }, stage, p.marca || '');
    const lema = el('div', { ...SERIF, position: 'absolute', left: '0', right: '0', top: `${cy + 310}px`, textAlign: 'center', fontSize: '52px', color: 'var(--s-muted)' }, stage, p.lema || '');

    const t0 = 0.3;
    const tl = gsap.timeline({ paused: true });
    rings.forEach((ring, i) => {
      tl.fromTo(ring, { scale: 0.05, opacity: 0.9 }, { scale: 1, opacity: 0, duration: p.duracion, ease: 'power2.out' }, t0 + i * p.escalonado);
    });
    const tPop = t0 + p.duracion * 0.25;
    tl.fromTo(mark, { scale: 0 }, { scale: 1, duration: 0.7, ease: p.ease }, tPop);
    tl.fromTo(word, { autoAlpha: 0, y: 24 }, { autoAlpha: 1, y: 0, duration: 0.6, ease: 'power3.out' }, tPop + 0.5);
    tl.fromTo(lema, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.7, ease: 'sine.out' }, tPop + 0.9);
    tl.to({}, { duration: 1.4 });
    return tl;
  },
};
