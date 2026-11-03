// Volteo 3D de letras: cada letra gira sobre su eje (como una paleta de
// aeropuerto) hasta quedar de frente. La perspectiva vive en el contenedor y el
// orden del escalonado decide dónde mira primero el espectador (inicio, centro…).
import { el, layer, DISPLAY, MONO } from '../core/kit.js';

const FROM = { inicio: 'start', centro: 'center', final: 'end', bordes: 'edges' };

export default {
  id: 'volteo-3d-letras',
  poster: 0.75,
  build(stage, p, { gsap }) {
    layer(stage, { background: 'var(--s-bg)' });
    const kicker = el('div', { ...MONO, position: 'absolute', left: '0', right: '0', top: '330px', textAlign: 'center', color: 'var(--s-accent)' }, stage, 'Nueva temporada');
    const box = el('div', { ...DISPLAY, position: 'absolute', left: '0', right: '0', top: '390px', textAlign: 'center', fontSize: '220px', color: 'var(--s-ink)', whiteSpace: 'nowrap', perspective: `${p.profundidad}px` }, stage);
    const letters = [...String(p.texto || ' ')].map((ch) => el('span', { display: 'inline-block', whiteSpace: 'pre', transformOrigin: p.eje === 'X' ? '50% 50% -0.3em' : '50% 50%', backfaceVisibility: 'hidden' }, box, ch === ' ' ? '&nbsp;' : ch));

    const from = p.eje === 'X' ? { rotationX: -95, autoAlpha: 0 } : { rotationY: 95, autoAlpha: 0 };
    const to = p.eje === 'X' ? { rotationX: 0 } : { rotationY: 0 };
    const tl = gsap.timeline({ paused: true });
    tl.fromTo(kicker, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.4 }, 0.1);
    tl.fromTo(letters, from, { ...to, autoAlpha: 1, duration: p.duracion, ease: p.ease, stagger: { each: p.escalonado, from: FROM[p.orden] || 'start' } }, 0.3);
    tl.to({}, { duration: 1.5 });
    return tl;
  },
};
