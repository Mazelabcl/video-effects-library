// Logo con destello: el logo aparece con calma y después una franja de luz
// diagonal lo recorre (como un reflejo en metal o vidrio). El brillo vive DENTRO
// del logo: en el nombre via background-clip:text y en el isotipo con una capa
// recortada a su forma. Sugiere premium y "recién terminado".
import { el, layer, DISPLAY, SERIF } from '../core/kit.js';

export default {
  id: 'logo-brillo',
  poster: 0.62,
  build(stage, p, { gsap }) {
    layer(stage, { background: 'radial-gradient(ellipse at 50% 45%, var(--s-bg-2) 0%, var(--s-bg) 65%)' });
    const group = el('div', { position: 'absolute', left: '0', right: '0', top: '360px', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '48px' }, stage);
    const mark = el('div', { position: 'relative', width: '220px', height: '220px', borderRadius: 'calc(var(--s-radius) * 1.6 + 20px)', background: 'var(--s-accent)', overflow: 'hidden', flex: '0 0 220px' }, group);
    el('div', { ...DISPLAY, position: 'absolute', inset: '0', display: 'grid', placeItems: 'center', fontSize: '130px', color: 'var(--s-bg)' }, mark, String(p.marca || ' ').trim().slice(0, 1).toUpperCase());
    const w = p.anchoBrillo, a = 90 + p.angulo;
    const band = (alpha) => `linear-gradient(${a}deg, transparent ${50 - w / 2}%, rgba(255,255,255,${alpha}) 50%, transparent ${50 + w / 2}%)`;
    const markShine = el('div', { position: 'absolute', inset: '0', backgroundImage: band(p.intensidad), backgroundSize: '300% 100%', backgroundRepeat: 'no-repeat', mixBlendMode: 'screen' }, mark);
    // Nombre: tinta sólida + brillo recortado al texto, superpuestos.
    const wordBox = el('div', { position: 'relative' }, group);
    el('div', { ...DISPLAY, fontSize: '200px', color: 'var(--s-ink)', whiteSpace: 'nowrap' }, wordBox, p.marca || '');
    const wordShine = el('div', { ...DISPLAY, position: 'absolute', inset: '0', fontSize: '200px', whiteSpace: 'nowrap', color: 'transparent',
      backgroundImage: band(p.intensidad), backgroundSize: '300% 100%', backgroundRepeat: 'no-repeat', WebkitBackgroundClip: 'text', backgroundClip: 'text' }, wordBox, p.marca || '');
    const lema = el('div', { ...SERIF, position: 'absolute', left: '0', right: '0', top: '640px', textAlign: 'center', fontSize: '56px', color: 'var(--s-muted)' }, stage, 'Diseñado para durar');

    const tl = gsap.timeline({ paused: true });
    tl.fromTo(group, { autoAlpha: 0, scale: 0.96 }, { autoAlpha: 1, scale: 1, duration: 0.9, ease: 'power3.out' }, 0.2);
    const n = Math.round(p.repeticiones);
    for (let i = 0; i < n; i++) {
      const at = 1.2 + i * (p.duracion + 0.5);
      // Con background-size 300%, la posición 100%→0% hace cruzar la franja de izquierda a derecha.
      tl.fromTo([markShine, wordShine], { backgroundPosition: '100% 0%' }, { backgroundPosition: '0% 0%', duration: p.duracion, ease: p.ease, immediateRender: i === 0 }, at);
    }
    tl.fromTo(lema, { autoAlpha: 0, y: 16 }, { autoAlpha: 1, y: 0, duration: 0.7, ease: 'power3.out' }, 1.2 + p.duracion * 0.5);
    tl.to({}, { duration: 1.4 });
    return tl;
  },
};
