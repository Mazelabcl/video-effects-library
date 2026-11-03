// Reseña con estrellas: las estrellas se llenan de izquierda a derecha hasta el
// puntaje real (admite fracciones: 4,8 deja la última al 80 %) y la nota cuenta
// en sincronía. Después la cita aparece palabra a palabra y al final el autor:
// prueba social en el orden "cuánto → qué dicen → quién lo dice".
import { el, svg, layer, splitText, stageSize, nextId, fmtNum, SERIF, MONO, DISPLAY, tone } from '../core/kit.js';

const STAR = 'M12 1.8 L14.9 8.6 L22.2 9.2 L16.6 14 L18.3 21.2 L12 17.4 L5.7 21.2 L7.4 14 L1.8 9.2 L9.1 8.6 Z';

export default {
  id: 'resena-estrellas',
  poster: 0.9,
  size: (p) => stageSize(p.formato),
  build(stage, p, { gsap }) {
    const { w, h } = stageSize(p.formato);
    const vert = h > w;
    const color = tone(p.color);
    layer(stage, { background: 'var(--s-bg)' });
    const cardW = vert ? 920 : 1300;
    const card = el('div', { position: 'absolute', left: `${(w - cardW) / 2}px`, width: `${cardW}px`, top: `${h / 2 - (vert ? 520 : 360)}px`, padding: '70px 80px', boxSizing: 'border-box',
      background: 'var(--s-bg-2)', borderRadius: 'calc(var(--s-radius) * 1.4)', boxShadow: '0 30px 90px rgba(0,0,0,0.35)' }, stage);
    const top = el('div', { display: 'flex', alignItems: 'center', gap: '30px', marginBottom: '44px' }, card);
    const starSize = vert ? 92 : 86;
    const stars = Array.from({ length: 5 }, () => {
      const id = nextId('star');
      const s = svg('svg', { width: String(starSize), height: String(starSize), viewBox: '0 0 24 24' }, top);
      const cp = svg('clipPath', { id }, s);
      const rect = svg('rect', { x: '0', y: '0', width: '0', height: '24' }, cp);
      svg('path', { d: STAR, fill: 'var(--s-ink)', opacity: '0.14' }, s);
      svg('path', { d: STAR, fill: color, 'clip-path': `url(#${id})` }, s);
      return { s, rect };
    });
    const score = el('div', { ...DISPLAY, fontSize: `${vert ? 96 : 90}px`, color: 'var(--s-ink)', marginLeft: '20px', fontVariantNumeric: 'tabular-nums' }, top, '0,0');
    const quote = el('div', { ...SERIF, fontSize: `${vert ? 70 : 64}px`, lineHeight: '1.18', color: 'var(--s-ink)' }, card);
    const qWords = splitText(quote, `“${p.cita || ''}”`, 'palabra');
    const who = el('div', { display: 'flex', alignItems: 'center', gap: '22px', marginTop: '46px' }, card);
    el('div', { ...DISPLAY, width: '76px', height: '76px', borderRadius: '50%', background: color, color: 'var(--s-bg)', display: 'grid', placeItems: 'center', fontSize: '38px' }, who, String(p.autor || ' ').trim().slice(0, 1).toUpperCase());
    el('div', { ...MONO, color: 'var(--s-muted)', fontSize: '28px' }, who, p.autor || '');

    const st = { v: 0 };
    const render = () => {
      stars.forEach(({ rect }, i) => rect.setAttribute('width', String(24 * Math.min(1, Math.max(0, st.v - i)))));
      score.textContent = fmtNum(st.v, 1);
    };
    const tl = gsap.timeline({ paused: true });
    tl.fromTo(card, { autoAlpha: 0, y: 40 }, { autoAlpha: 1, y: 0, duration: 0.7, ease: 'power3.out' }, 0.1);
    tl.fromTo(stars.map((x) => x.s), { scale: 0.5 }, { scale: 1, duration: 0.5, ease: 'back.out(2.5)', stagger: 0.06 }, 0.4);
    // Llenado lineal: cada estrella toma el mismo tiempo (no se "acelera" la nota).
    tl.fromTo(st, { v: 0 }, { v: p.puntaje, duration: p.duracion, ease: 'none', onUpdate: render }, 0.7);
    const tq = 0.7 + p.duracion + 0.3;
    tl.fromTo(qWords, { yPercent: 105 }, { yPercent: 0, duration: 0.6, stagger: p.escalonado, ease: 'power3.out' }, tq);
    tl.fromTo(who, { autoAlpha: 0, x: -20 }, { autoAlpha: 1, x: 0, duration: 0.6, ease: 'power3.out' }, tq + qWords.length * p.escalonado + 0.3);
    tl.to({}, { duration: 1.8 });
    render();
    return tl;
  },
};
