// Golpe tipográfico: contexto tranquilo → anticipación (la cámara retrocede
// apenas) → la palabra cae acelerando (ease .in: llega a máxima velocidad en el
// impacto) → destello + sacudida con ruido suave que DECAE → quietud total.
import { el, layer, smoothNoise, DISPLAY, SERIF, MONO } from '../core/kit.js';

export default {
  id: 'golpe-tipografico',
  poster: 0.75,
  build(stage, p, { gsap }) {
    const cam = layer(stage, { background: 'var(--s-bg)' });
    const pre = el('div', { ...MONO, position: 'absolute', left: '0', right: '0', top: '500px', textAlign: 'center', color: 'var(--s-muted)', fontSize: '30px' }, cam, 'Tres años diciendo «el próximo trimestre».');
    const word = el('div', { ...DISPLAY, position: 'absolute', left: '0', right: '0', top: '330px', textAlign: 'center', fontSize: '330px', color: 'var(--s-ink)', fontWeight: '900' }, cam, p.texto || ' ');
    const tag = el('div', { ...SERIF, position: 'absolute', left: '0', right: '0', top: '720px', textAlign: 'center', fontSize: '76px', color: 'var(--s-accent)' }, cam, 'Hagámoslo este.');
    const flash = layer(stage, { background: 'var(--s-accent)', opacity: '0', pointerEvents: 'none' });

    const nx = smoothNoise(p.semilla), ny = smoothNoise(p.semilla + 101), nr = smoothNoise(p.semilla + 202);
    const shake = { t: 1 };
    const decay = 0.75;
    const applyShake = () => {
      const k = Math.pow(1 - shake.t, 2); // decaimiento cuadrático
      const f = shake.t * 26;
      gsap.set(cam, { x: nx(f) * p.sacudida * k, y: ny(f) * p.sacudida * k, rotate: nr(f) * p.sacudida * 0.06 * k });
    };

    const T = 1.6; // instante del impacto
    const tl = gsap.timeline({ paused: true });
    tl.fromTo(pre, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.4 }, 0.1);
    tl.to(pre, { autoAlpha: 0, duration: 0.25 }, T - 0.5);
    tl.fromTo(cam, { scale: 1 }, { scale: 0.965, duration: 0.3, ease: 'power2.out' }, T - p.duracion - 0.3); // anticipación
    tl.fromTo(word, { scale: p.escalaInicial, autoAlpha: 0 }, { scale: 1, autoAlpha: 1, duration: p.duracion, ease: 'power4.in' }, T - p.duracion);
    tl.to(cam, { scale: 1, duration: 0.05 }, T);
    if (p.flash === 'si') tl.fromTo(flash, { opacity: 0.85 }, { opacity: 0, duration: 0.28, ease: 'power2.out', immediateRender: false }, T);
    tl.fromTo(shake, { t: 0 }, { t: 1, duration: decay, ease: 'none', onUpdate: applyShake, immediateRender: false }, T);
    tl.fromTo(tag, { autoAlpha: 0, y: 20 }, { autoAlpha: 1, y: 0, duration: 0.5, ease: 'power3.out' }, T + 0.9);
    tl.to({}, { duration: 1.6 });
    return tl;
  },
};
