// Barrido de reloj (clock wipe): la escena B se revela con una máscara cónica
// que gira como la aguja de un reloj. Significa tiempo que pasa sin decir
// "tiempo después". La máscara se recalcula en cada fotograma desde un ángulo
// (función pura del progreso); un borde suave evita el serrucho del corte.
import { el, layer, splitText, DISPLAY, MONO } from '../core/kit.js';

function escenaReloj(parent, label, title, bg, ink) {
  const s = layer(parent, { background: bg, color: ink });
  el('div', { ...MONO, position: 'absolute', left: '0', right: '0', top: '400px', textAlign: 'center', opacity: '0.7' }, s, label);
  const t = el('div', { ...DISPLAY, position: 'absolute', left: '0', right: '0', top: '450px', textAlign: 'center', fontSize: '170px' }, s);
  splitText(t, title, 'palabra');
  return s;
}

export default {
  id: 'barrido-reloj',
  poster: 0.45,
  build(stage, p, { gsap }) {
    escenaReloj(stage, 'Enero', 'Primera versión', 'var(--s-bg)', 'var(--s-ink)');
    const B = escenaReloj(stage, 'Diciembre', '10.000 usuarios', 'var(--s-accent)', 'var(--s-bg)');
    const hand = el('div', { position: 'absolute', left: '958px', top: '-660px', width: '4px', height: '1200px', background: 'var(--s-ink)', transformOrigin: '50% 100%', opacity: '0' }, stage);
    const dir = p.sentido === 'antihorario' ? -1 : 1;
    const st = { a: 0 };
    const render = () => {
      const a = Math.max(0, st.a), f = p.borde;
      // Horario: visible de 0° a a°. Antihorario: visible de (360-a)° a 360°.
      const grad = dir > 0
        ? `conic-gradient(from ${p.inicio}deg, #000 0deg, #000 ${a}deg, transparent ${a + f}deg, transparent 360deg)`
        : `conic-gradient(from ${p.inicio}deg, transparent 0deg, transparent ${360 - a - f}deg, #000 ${360 - a}deg, #000 360deg)`;
      B.style.webkitMaskImage = grad; B.style.maskImage = grad;
      gsap.set(hand, { rotate: p.inicio + dir * a, opacity: a > 0 && a < 360 ? 0.8 : 0 });
    };
    const hold = 1.0;
    const tl = gsap.timeline({ paused: true });
    tl.fromTo(st, { a: 0 }, { a: 360 + p.borde, duration: p.duracion, ease: p.ease, onUpdate: render }, hold);
    tl.to({}, { duration: 1.2 });
    render();
    return tl;
  },
};
