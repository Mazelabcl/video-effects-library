// Revelado tipográfico escalonado: cada unidad (letra/palabra/línea) sube
// desde detrás de una línea de máscara invisible, en orden de lectura.
// Después del texto, una barra de acento "subraya" la idea y todo se queda quieto.
import { el, layer, splitText, DISPLAY, MONO } from '../core/kit.js';

export default {
  id: 'revelado-letras',
  poster: 0.85,
  build(stage, p, { gsap }) {
    const bg = layer(stage, { background: 'var(--s-bg)' });
    // Retícula sutil: da sensación de diseño editorial sin competir.
    for (let x = 160; x < 1920; x += 200) el('div', { position: 'absolute', left: `${x}px`, top: '0', bottom: '0', width: '1px', background: 'var(--s-ink)', opacity: '0.05' }, bg);

    const label = el('div', { ...MONO, position: 'absolute', left: '160px', top: '300px', color: 'var(--s-accent)' }, stage, 'Manifiesto · 03');
    const box = el('div', { ...DISPLAY, position: 'absolute', left: '150px', top: '350px', width: '1620px', fontSize: '168px', color: 'var(--s-ink)' }, stage);
    const units = splitText(box, p.texto || ' ', p.unidad);
    const bar = el('div', { position: 'absolute', left: '160px', top: '820px', width: '520px', height: '14px', background: 'var(--s-accent)', transformOrigin: '0 50%' }, stage);

    const tl = gsap.timeline({ paused: true });
    tl.fromTo(label, { autoAlpha: 0, x: -20 }, { autoAlpha: 1, x: 0, duration: 0.5, ease: 'power2.out' }, 0);
    tl.fromTo(units, { yPercent: p.distancia, rotate: p.unidad === 'letra' ? 6 : 0 }, { yPercent: 0, rotate: 0, duration: p.duracion, stagger: p.escalonado, ease: p.ease }, 0.2);
    tl.fromTo(bar, { scaleX: 0 }, { scaleX: 1, duration: 0.7, ease: 'power3.inOut' }, '>-0.25');
    tl.to({}, { duration: 1.4 }); // pausa legible
    return tl;
  },
};
