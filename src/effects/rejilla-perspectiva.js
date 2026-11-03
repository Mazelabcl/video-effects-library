// Rejilla en perspectiva: un piso de líneas inclinado hacia el horizonte avanza
// hacia la cámara (estética retro/tech). El avance es un desplazamiento del
// patrón en múltiplos EXACTOS del tamaño de celda: el bucle no tiene salto.
// Un resplandor en el horizonte y un fundido lejano dan profundidad.
import { el, layer, DISPLAY, tone } from '../core/kit.js';

export default {
  id: 'rejilla-perspectiva',
  poster: 0.4,
  build(stage, p, { gsap }) {
    const c = tone(p.color);
    layer(stage, { background: 'linear-gradient(180deg, var(--s-bg) 0%, var(--s-bg-2) 48%, var(--s-bg) 100%)' });
    const glow = el('div', { position: 'absolute', left: '-10%', right: '-10%', top: '380px', height: '300px', background: `radial-gradient(ellipse 50% 50% at 50% 50%, ${c} 0%, transparent 70%)`, filter: 'blur(30px)', opacity: String(p.resplandor) }, stage);
    const viewport = el('div', { position: 'absolute', left: '0', right: '0', top: '540px', bottom: '0', perspective: '600px', perspectiveOrigin: '50% 0%', overflow: 'hidden' }, stage);
    const cell = p.celda;
    const floor = el('div', { position: 'absolute', left: '-150%', width: '400%', top: '0', height: '2400px', transformOrigin: '50% 0%', transform: `rotateX(${p.inclinacion}deg)`,
      backgroundImage: `linear-gradient(${c} 0 3px, transparent 3px), linear-gradient(90deg, ${c} 0 3px, transparent 3px)`, backgroundSize: `${cell}px ${cell}px`,
      WebkitMaskImage: 'linear-gradient(180deg, transparent 0%, #000 35%)', maskImage: 'linear-gradient(180deg, transparent 0%, #000 35%)' }, viewport);
    const title = el('div', { ...DISPLAY, position: 'absolute', left: '0', right: '0', top: '300px', textAlign: 'center', fontSize: '150px', color: 'var(--s-ink)' }, stage, p.texto || '');

    // Celdas recorridas en toda la duración: entero para que el bucle cierre.
    const cells = Math.max(1, Math.round(p.velocidad * p.duracion));
    const tl = gsap.timeline({ paused: true });
    tl.fromTo(floor, { backgroundPosition: '0px 0px' }, { backgroundPosition: `0px ${cells * cell}px`, duration: p.duracion, ease: 'none' }, 0);
    tl.fromTo(glow, { scaleX: 0.9 }, { scaleX: 1.05, duration: p.duracion / 2, ease: 'sine.inOut', yoyo: true, repeat: 1 }, 0);
    tl.fromTo(title, { autoAlpha: 0, y: 30 }, { autoAlpha: 1, y: 0, duration: 1, ease: 'power3.out' }, 0.4);
    return tl;
  },
};
