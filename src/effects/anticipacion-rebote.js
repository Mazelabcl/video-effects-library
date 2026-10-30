// Anticipación y follow-through: el botón se "carga" (se encoge) antes de
// disparar la tarjeta; la tarjeta se pasa del objetivo y se asienta; los
// elementos internos llegan un instante después (acción superpuesta).
import { el, svg, layer, DISPLAY, MONO } from '../core/kit.js';

export default {
  id: 'anticipacion-rebote',
  poster: 0.85,
  build(stage, p, { gsap }) {
    layer(stage, { background: 'radial-gradient(ellipse at 50% 60%, var(--s-bg-2) 0%, var(--s-bg) 70%)' });
    const R = 'calc(var(--s-radius) * 1.2)';
    const btn = el('div', { ...DISPLAY, position: 'absolute', left: '660px', top: '780px', width: '600px', height: '120px', borderRadius: '999px', background: 'var(--s-accent)', color: 'var(--s-bg)', fontSize: '44px', display: 'grid', placeItems: 'center', letterSpacing: '-0.01em' }, stage, 'Confirmar pedido');
    if (getComputedStyle(stage).getPropertyValue('--s-radius').trim() === '0px') btn.style.borderRadius = '0';

    const card = el('div', { position: 'absolute', left: '560px', top: '230px', width: '800px', height: '500px', borderRadius: R, background: 'var(--s-ink)', color: 'var(--s-bg)', boxShadow: '0 40px 80px rgba(0,0,0,0.35)', transformOrigin: '50% 100%' }, stage);
    const icon = el('div', { position: 'absolute', left: '64px', top: '64px', width: '120px', height: '120px', borderRadius: '50%', background: 'var(--s-accent)', display: 'grid', placeItems: 'center' }, card);
    const s = svg('svg', { width: 70, height: 70, viewBox: '0 0 70 70' }, icon);
    const check = svg('path', { d: 'M14 37 L29 51 L57 20', fill: 'none', stroke: 'currentColor', 'stroke-width': 9, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, s);
    icon.style.color = 'var(--s-bg)';
    const title = el('div', { ...DISPLAY, position: 'absolute', left: '64px', top: '230px', fontSize: '76px' }, card, 'Pedido confirmado');
    const sub = el('div', { position: 'absolute', left: '66px', top: '330px', fontSize: '34px', opacity: '0.7' }, card, 'Llega mañana entre 10:00 y 12:00');
    const chips = ['N.º 20418', '3 productos', 'Despacho gratis'].map((t, i) => el('div', { ...MONO, position: 'absolute', left: `${66 + i * 230}px`, top: '410px', fontSize: '20px', padding: '10px 16px', borderRadius: '999px', border: '2px solid currentColor', opacity: '0.85' }, card, t));

    const L = 64; // largo aproximado del trazo del check (62.3 px)
    check.setAttribute('stroke-dasharray', `${L}`);
    const a = p.anticipacion, d = p.duracion, lag = p.retraso;
    const out = p.sobrepaso > 0 ? `back.out(${p.sobrepaso})` : 'power3.out';
    const T = 0.9; // disparo

    const tl = gsap.timeline({ paused: true });
    tl.set(card, { autoAlpha: 0 }, 0);
    tl.fromTo(btn, { scale: 1, y: 0 }, { scale: 1 - a, y: a * 60, duration: 0.22, ease: 'power2.in' }, T - 0.22); // anticipación
    tl.to(btn, { scale: 1.04, y: 0, autoAlpha: 0, duration: 0.25, ease: 'power2.out' }, T);
    tl.fromTo(card, { autoAlpha: 0, y: 260, scale: 0.6 }, { autoAlpha: 1, y: 0, scale: 1, duration: d, ease: out }, T);
    // Follow-through: cada capa interna llega con retraso y su propio rebote
    tl.fromTo(icon, { scale: 0 }, { scale: 1, duration: d * 0.9, ease: out }, T + lag);
    tl.fromTo(check, { attr: { 'stroke-dashoffset': L } }, { attr: { 'stroke-dashoffset': 0 }, duration: 0.35, ease: 'power2.out' }, T + lag + d * 0.4);
    tl.fromTo(title, { y: 40, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: d * 0.8, ease: out }, T + lag * 2);
    tl.fromTo(sub, { y: 30, autoAlpha: 0 }, { y: 0, autoAlpha: 0.7, duration: d * 0.8, ease: out }, T + lag * 3);
    tl.fromTo(chips, { y: 24, autoAlpha: 0 }, { y: 0, autoAlpha: 0.85, duration: d * 0.7, ease: out, stagger: lag * 0.6 }, T + lag * 4);
    tl.to({}, { duration: 1.3 });
    return tl;
  },
};
