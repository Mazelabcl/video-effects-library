// Zoom que atraviesa: la cámara "vuela" hacia adelante. La escena A crece y se
// desenfoca hasta desaparecer; la B llega desde lejos (pequeña) y se enfoca.
// Ambas CRECEN durante todo el movimiento: así se lee como un solo avance
// continuo y no como un zoom-in seguido de un zoom-out.
import { el, layer, splitText, DISPLAY, MONO } from '../core/kit.js';

function escenaZoom(parent, num, title, bg, ink) {
  const s = layer(parent, { background: bg, color: ink });
  el('div', { ...MONO, position: 'absolute', left: '0', right: '0', top: '380px', textAlign: 'center', opacity: '0.7' }, s, num);
  const t = el('div', { ...DISPLAY, position: 'absolute', left: '0', right: '0', top: '430px', textAlign: 'center', fontSize: '180px' }, s);
  splitText(t, title, 'palabra');
  for (let i = 0; i < 4; i++) el('div', { position: 'absolute', left: `${200 + i * 460}px`, top: '820px', width: '60px', height: '60px', borderRadius: '50%', border: `6px solid ${ink}`, opacity: '0.25' }, s);
  return s;
}

export default {
  id: 'zoom-atravesar',
  poster: 0.42,
  build(stage, p, { gsap }) {
    const B = escenaZoom(stage, 'Después', 'Todo en un lugar', 'var(--s-accent)', 'var(--s-bg)');
    const A = escenaZoom(stage, 'Antes', 'Diez herramientas', 'var(--s-bg)', 'var(--s-ink)');
    const st = { t: 0 };
    const k = p.intensidad;
    const render = () => {
      const t = st.t;
      if (t < 0.5) {
        const a = t / 0.5;
        gsap.set(A, { autoAlpha: 1, scale: 1 + (k - 1) * a * a, filter: `blur(${p.desenfoque * a}px)` });
        gsap.set(B, { autoAlpha: 0 });
      } else {
        const b = (t - 0.5) / 0.5;
        gsap.set(A, { autoAlpha: 0 });
        gsap.set(B, { autoAlpha: 1, scale: 1 / k + (1 - 1 / k) * (1 - (1 - b) * (1 - b)), filter: `blur(${p.desenfoque * (1 - b)}px)` });
      }
    };
    const hold = 1.0;
    const tl = gsap.timeline({ paused: true });
    tl.fromTo(st, { t: 0 }, { t: 1, duration: p.duracion, ease: p.ease, onUpdate: render }, hold);
    tl.to({}, { duration: 1.2 });
    render();
    return tl;
  },
};
