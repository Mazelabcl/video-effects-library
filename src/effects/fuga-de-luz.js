// Fuga de luz (light leak): una mancha de luz cálida cruza el cuadro en modo
// "screen" (solo aclara, nunca oscurece). En su punto más brillante se hace el
// corte de A a B: el destello esconde el cambio. Es la transición "película
// analógica": suave, emocional, nostálgica.
import { el, layer, splitText, DISPLAY, SERIF } from '../core/kit.js';

const TONOS_LUZ = {
  calido: ['#ffb347', '#ff6a3d', '#ffe29a'],
  frio: ['#7fd4ff', '#7a7dff', '#d9f6ff'],
  marca: ['var(--s-accent3)', 'var(--s-accent2)', 'var(--s-accent)'],
};

function escenaLuz(parent, title, sub, bg) {
  const s = layer(parent, { background: bg });
  const t = el('div', { ...DISPLAY, position: 'absolute', left: '0', right: '0', top: '420px', textAlign: 'center', fontSize: '160px', color: 'var(--s-ink)' }, s);
  el('div', { ...SERIF, position: 'absolute', left: '0', right: '0', top: '620px', textAlign: 'center', fontSize: '60px', color: 'var(--s-muted)' }, s, sub);
  splitText(t, title, 'palabra');
  return s;
}

export default {
  id: 'fuga-de-luz',
  poster: 0.42,
  build(stage, p, { gsap }) {
    const A = escenaLuz(stage, 'El verano', 'en que empezamos', 'var(--s-bg)');
    const B = escenaLuz(stage, 'Diez años', 'después', 'var(--s-bg-2)');
    const [c1, c2, c3] = TONOS_LUZ[p.tono] || TONOS_LUZ.calido;
    const leak = el('div', { position: 'absolute', top: '-300px', left: '0', width: '2600px', height: '1680px', mixBlendMode: 'screen', pointerEvents: 'none', filter: 'blur(40px)',
      background: `radial-gradient(ellipse 30% 45% at 40% 50%, ${c3} 0%, transparent 70%), radial-gradient(ellipse 45% 60% at 55% 45%, ${c1} 0%, transparent 70%), radial-gradient(ellipse 50% 50% at 70% 60%, ${c2} 0%, transparent 72%)` }, stage);
    const wash = layer(stage, { background: c3, mixBlendMode: 'screen', opacity: '0', pointerEvents: 'none' });

    const dir = p.direccion === 'derecha' ? -1 : 1; // derecha = la luz viaja hacia la izquierda
    const hold = 1.0, d = p.duracion;
    const tl = gsap.timeline({ paused: true });
    tl.set(B, { autoAlpha: 0 }, 0);
    tl.fromTo(leak, { x: dir > 0 ? -2700 : 2000, autoAlpha: 0 }, { x: dir > 0 ? 2000 : -2700, duration: d, ease: p.ease }, hold);
    tl.fromTo(leak, { autoAlpha: 0 }, { autoAlpha: p.intensidad, duration: d * 0.35, ease: 'sine.out', immediateRender: false }, hold);
    tl.to(leak, { autoAlpha: 0, duration: d * 0.35, ease: 'sine.in' }, hold + d * 0.65);
    // Pico de luz: el corte ocurre escondido dentro del destello.
    tl.fromTo(wash, { opacity: 0 }, { opacity: p.intensidad * 0.9, duration: d * 0.18, ease: 'sine.in', immediateRender: false }, hold + d * 0.32);
    tl.set(A, { autoAlpha: 0 }, hold + d * 0.5);
    tl.set(B, { autoAlpha: 1 }, hold + d * 0.5);
    tl.to(wash, { opacity: 0, duration: d * 0.3, ease: 'sine.out' }, hold + d * 0.5);
    tl.to({}, { duration: 1.2 });
    return tl;
  },
};
