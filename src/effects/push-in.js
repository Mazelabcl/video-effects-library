// Push-in lento: la "cámara" (todo el decorado) escala hacia el punto de foco.
// El texto va FUERA de la cámara: así se mantiene legible y estable mientras
// el mundo se acerca. La velocidad no debe notarse en el primer fotograma.
import { el, layer, rng, SERIF, MONO } from '../core/kit.js';

export default {
  id: 'push-in',
  poster: 0.8,
  build(stage, p, { gsap }) {
    const fx = (p.focoX / 100) * 1920, fy = (p.focoY / 100) * 1080;
    const cam = layer(stage, { transformOrigin: `${fx}px ${fy}px`, background: 'linear-gradient(180deg, #2a2f45 0%, #6b5f7a 46%, #d9a38a 62%, #3b3242 62.2%, #1c1822 100%)' });
    // Sol bajo, montes lejanos y el suelo
    el('div', { position: 'absolute', left: '1120px', top: '520px', width: '260px', height: '260px', borderRadius: '50%', background: 'radial-gradient(circle, #ffd8a8 0%, #f39c7a 60%, rgba(243,156,122,0) 72%)' }, cam);
    const r = rng(5);
    for (let i = 0; i < 7; i++) {
      const w = 300 + r() * 500;
      el('div', { position: 'absolute', left: `${r() * 1920 - 150}px`, top: `${590 - r() * 90}px`, width: `${w}px`, height: `${w}px`, background: '#4b4152', transform: 'rotate(45deg)', transformOrigin: '0 0', opacity: '0.6' }, cam);
    }
    el('div', { position: 'absolute', left: '0', right: '0', top: '670px', bottom: '0', background: 'linear-gradient(180deg,#2b2430 0%, #141117 100%)' }, cam);
    // Sujeto: figura solitaria con sombra larga, ubicada en el foco.
    const fig = el('div', { position: 'absolute', left: `${fx - 22}px`, top: `${fy - 150}px`, width: '44px', height: '150px' }, cam);
    el('div', { position: 'absolute', left: '9px', top: '0', width: '26px', height: '26px', borderRadius: '50%', background: '#0c0a0e' }, fig);
    el('div', { position: 'absolute', left: '0', top: '30px', width: '44px', height: '120px', borderRadius: '20px 20px 6px 6px', background: '#0c0a0e' }, fig);
    el('div', { position: 'absolute', left: '22px', top: '146px', width: '420px', height: '10px', background: 'linear-gradient(90deg, rgba(0,0,0,0.6), rgba(0,0,0,0))', transform: 'skewX(-60deg)', transformOrigin: '0 0' }, fig);
    el('div', { position: 'absolute', left: '-6px', top: '28px', width: '56px', height: '6px', background: 'var(--s-accent2)', opacity: '0.85' }, fig); // detalle de color: bufanda

    // Texto fijo (fuera de la cámara)
    const txt = el('div', { position: 'absolute', left: '140px', top: '760px', width: '900px', color: '#f4ede4' }, stage);
    el('div', { ...MONO, color: '#c9b2a8', marginBottom: '18px' }, txt, 'Testimonio · Camila, 34');
    el('div', { ...SERIF, fontSize: '86px', lineHeight: '1.02' }, txt, '«Todo empezó con una pregunta.»');
    const vignette = layer(stage, { background: 'radial-gradient(ellipse at center, rgba(0,0,0,0) 45%, rgba(0,0,0,0.55) 100%)', pointerEvents: 'none' });

    const tl = gsap.timeline({ paused: true });
    tl.fromTo(cam, { scale: 1 }, { scale: p.escalaFinal, duration: p.duracion, ease: p.ease }, 0);
    tl.fromTo(vignette, { opacity: 0.4 }, { opacity: 1, duration: p.duracion, ease: p.ease }, 0);
    tl.fromTo(txt, { autoAlpha: 0, y: 24 }, { autoAlpha: 1, y: 0, duration: 1, ease: 'power2.out' }, Math.min(1.2, p.duracion * 0.25));
    tl.to({}, { duration: 0.6 });
    return tl;
  },
};
