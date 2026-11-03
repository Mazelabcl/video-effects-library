// Enfoque con tracking: las letras llegan desenfocadas y muy separadas y se
// "aprietan" hasta el espaciado normal mientras ganan nitidez. Es el lenguaje de
// los tráileres premium: la palabra se materializa en lugar de entrar.
// Cada letra es un span propio (sin máscara) para que el desenfoque no se recorte.
import { el, layer, DISPLAY, SERIF } from '../core/kit.js';

export default {
  id: 'enfoque-tracking',
  poster: 0.7,
  build(stage, p, { gsap }) {
    layer(stage, { background: 'radial-gradient(ellipse at 50% 55%, var(--s-bg-2) 0%, var(--s-bg) 70%)' });
    const box = el('div', { ...DISPLAY, position: 'absolute', left: '0', right: '0', top: '400px', textAlign: 'center', fontSize: '200px', color: 'var(--s-ink)', whiteSpace: 'nowrap' }, stage);
    const letters = [...String(p.texto || ' ')].map((ch) => el('span', { display: 'inline-block', whiteSpace: 'pre' }, box, ch === ' ' ? '&nbsp;' : ch));
    const sub = el('div', { ...SERIF, position: 'absolute', left: '0', right: '0', top: '660px', textAlign: 'center', fontSize: '58px', color: 'var(--s-muted)' }, stage, 'Disponible desde el 12 de marzo');

    const tl = gsap.timeline({ paused: true });
    tl.fromTo(box, { letterSpacing: `${p.tracking}em`, scale: 1.06 }, { letterSpacing: '-0.02em', scale: 1, duration: p.duracion, ease: p.ease }, 0.2);
    tl.fromTo(letters, { autoAlpha: 0, filter: `blur(${p.desenfoque}px)` },
      { autoAlpha: 1, filter: 'blur(0px)', duration: p.duracion * 0.8, ease: p.ease, stagger: { amount: p.duracion * 0.35, from: 'center' } }, 0.2);
    tl.fromTo(sub, { autoAlpha: 0, filter: 'blur(8px)' }, { autoAlpha: 1, filter: 'blur(0px)', duration: 0.8, ease: 'sine.out' }, 0.2 + p.duracion + 0.1);
    tl.to({}, { duration: 1.4 });
    return tl;
  },
};
