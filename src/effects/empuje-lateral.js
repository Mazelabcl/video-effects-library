// Empuje lateral (push): la escena B entra y empuja a la A fuera de cuadro,
// como pasar una diapositiva física. Con "cubrir" en 1 la A queda quieta y la B
// se desliza encima (cover); valores intermedios dan un parallax entre ambas.
// La A se oscurece un poco al irse: refuerza que la B es lo nuevo.
import { el, layer, splitText, DISPLAY, MONO, tone } from '../core/kit.js';

const VEC = { izquierda: [-1, 0], derecha: [1, 0], arriba: [0, -1], abajo: [0, 1] };

function escenaEmpuje(parent, label, title, bg) {
  const s = layer(parent, { background: bg });
  el('div', { ...MONO, position: 'absolute', left: '140px', top: '400px', color: 'var(--s-muted)' }, s, label);
  const t = el('div', { ...DISPLAY, position: 'absolute', left: '130px', top: '450px', fontSize: '170px', color: 'var(--s-ink)', width: '1600px' }, s);
  splitText(t, title, 'palabra');
  return s;
}

export default {
  id: 'empuje-lateral',
  poster: 0.5,
  build(stage, p, { gsap }) {
    const A = escenaEmpuje(stage, 'Hoy', 'Procesos manuales', 'var(--s-bg)');
    const dim = layer(A, { background: '#000', opacity: '0' });
    const B = escenaEmpuje(stage, 'Con nosotros', 'Todo automático', 'var(--s-bg-2)');
    const [vx, vy] = VEC[p.direccion] || VEC.izquierda;
    // Borde de acento en el lado de B que entra primero.
    const edge = el('div', { position: 'absolute', background: tone(p.color),
      ...(vx ? { top: '0', bottom: '0', width: `${p.separador}px`, [vx < 0 ? 'left' : 'right']: `-${p.separador}px` } : { left: '0', right: '0', height: `${p.separador}px`, [vy < 0 ? 'top' : 'bottom']: `-${p.separador}px` }) }, B);
    B.style.overflow = 'visible';

    const hold = 1.0;
    const tl = gsap.timeline({ paused: true });
    // B entra desde el lado opuesto al de la dirección del movimiento.
    tl.fromTo(B, { xPercent: -vx * 100, yPercent: -vy * 100 }, { xPercent: 0, yPercent: 0, duration: p.duracion, ease: p.ease }, hold);
    tl.fromTo(A, { xPercent: 0, yPercent: 0 }, { xPercent: vx * 100 * (1 - p.cubrir), yPercent: vy * 100 * (1 - p.cubrir), duration: p.duracion, ease: p.ease }, hold);
    tl.fromTo(dim, { opacity: 0 }, { opacity: 0.5, duration: p.duracion, ease: p.ease }, hold);
    tl.set(edge, { autoAlpha: 0 }, hold + p.duracion);
    tl.to({}, { duration: 1.2 });
    return tl;
  },
};
