// Anillo de progreso hacia una meta: el anillo se llena y el porcentaje cuenta
// con la MISMA curva (el número siempre describe lo que se ve). Una marca fija
// indica la meta; si se supera, el anillo cambia de color justo al cruzarla y
// aparece la etiqueta "Meta superada": el clímax es el cruce, no el final.
import { el, svg, layer, DISPLAY, MONO, tone } from '../core/kit.js';

export default {
  id: 'anillo-progreso',
  poster: 0.92,
  build(stage, p, { gsap }) {
    layer(stage, { background: 'var(--s-bg)' });
    const R = 300, cx = 960, cy = 520, C = 2 * Math.PI * R, sw = 46;
    const s = svg('svg', { width: '1920', height: '1080', viewBox: '0 0 1920 1080', style: 'position:absolute;inset:0' }, stage);
    svg('circle', { cx, cy, r: R, fill: 'none', stroke: 'var(--s-ink)', 'stroke-opacity': '0.1', 'stroke-width': String(sw) }, s);
    const ring = svg('circle', { cx, cy, r: R, fill: 'none', stroke: tone(p.color), 'stroke-width': String(sw), 'stroke-linecap': 'round',
      'stroke-dasharray': `0 ${C}`, transform: `rotate(-90 ${cx} ${cy})` }, s);
    // Marca de la meta
    const a = ((p.meta / 100) * 360 - 90) * (Math.PI / 180);
    svg('line', { x1: cx + Math.cos(a) * (R - 44), y1: cy + Math.sin(a) * (R - 44), x2: cx + Math.cos(a) * (R + 44), y2: cy + Math.sin(a) * (R + 44), stroke: 'var(--s-ink)', 'stroke-width': '6' }, s);
    const metaLab = el('div', { ...MONO, position: 'absolute', left: `${cx + Math.cos(a) * (R + 80) - 100}px`, top: `${cy + Math.sin(a) * (R + 80) - 16}px`, width: '200px', textAlign: 'center', fontSize: '22px', color: 'var(--s-muted)' }, stage, `Meta ${p.meta}%`);
    const num = el('div', { ...DISPLAY, position: 'absolute', left: `${cx - 300}px`, width: '600px', top: `${cy - 110}px`, textAlign: 'center', fontSize: '200px', color: 'var(--s-ink)', fontVariantNumeric: 'tabular-nums' }, stage, '0%');
    el('div', { ...MONO, position: 'absolute', left: `${cx - 300}px`, width: '600px', top: `${cy + 100}px`, textAlign: 'center', color: 'var(--s-muted)' }, stage, p.etiqueta || '');
    const badge = el('div', { ...MONO, position: 'absolute', left: '0', right: '0', top: '900px', textAlign: 'center' }, stage);
    const pill = el('span', { display: 'inline-block', padding: '14px 28px', borderRadius: '999px', background: 'var(--s-accent2)', color: 'var(--s-bg)', fontWeight: '600' }, badge, 'Meta superada');

    const c = { v: 0 };
    const t0 = 0.4;
    const tl = gsap.timeline({ paused: true });
    tl.fromTo(metaLab, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.4 }, 0.1);
    tl.fromTo(c, { v: 0 }, { v: p.porcentaje, duration: p.duracion, ease: p.ease, onUpdate: () => {
      ring.setAttribute('stroke-dasharray', `${(c.v / 100) * C} ${C}`);
      num.textContent = `${Math.round(c.v)}%`;
      // Cambio de color exactamente al cruzar la meta (estado, no interpolación).
      ring.setAttribute('stroke', p.porcentaje >= p.meta && c.v >= p.meta ? 'var(--s-accent2)' : tone(p.color));
    } }, t0);
    if (p.porcentaje >= p.meta) {
      // Instante del cruce: se invierte la curva para ubicar la etiqueta ahí.
      const ez = gsap.parseEase(p.ease);
      let lo = 0, hi = 1;
      for (let k = 0; k < 30; k++) { const m = (lo + hi) / 2; if (ez(m) * p.porcentaje < p.meta) lo = m; else hi = m; }
      tl.fromTo(pill, { autoAlpha: 0, y: 20 }, { autoAlpha: 1, y: 0, duration: 0.5, ease: 'back.out(2)' }, t0 + lo * p.duracion);
    } else tl.set(pill, { autoAlpha: 0 }, 0);
    tl.to({}, { duration: 1.6 });
    return tl;
  },
};
