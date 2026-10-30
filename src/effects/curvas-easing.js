// Laboratorio de curvas: el MISMO desplazamiento con distintas curvas, y a la
// derecha el gráfico (tiempo → posición) de la curva elegida con un cursor que
// la recorre en vivo. Sirve para decidir la "física" del video antes de animar.
import { el, svg, layer, DISPLAY, MONO } from '../core/kit.js';

const FEEL = {
  none: 'máquina, datos, mecánico',
  'sine.inOut': 'suave, contemplativo',
  'power1.inOut': 'natural, discreto',
  'power2.out': 'natural, amable',
  'power3.out': 'editorial, preciso',
  'power3.inOut': 'transformación elegante',
  'power4.inOut': 'decidido, premium',
  'expo.out': 'rápido y seguro',
  'expo.inOut': 'enérgico, publicitario',
  'expo.in': 'acelera hacia un impacto',
  'circ.inOut': 'tenso, mecánico-orgánico',
  'back.out(1.7)': 'lúdico, con peso',
  'back.inOut(1.4)': 'juguetón',
  'elastic.out(1,0.45)': 'caricatura, resorte',
  'bounce.out': 'objeto que cae, infantil',
};
const REFS = ['none', 'power2.out', 'expo.inOut', 'back.out(1.7)', 'elastic.out(1,0.45)'];

export default {
  id: 'curvas-easing',
  poster: 0.62,
  build(stage, p, { gsap }) {
    layer(stage, { background: 'var(--s-bg)' });
    const lanes = p.comparar === 'si' ? [p.ease, ...REFS.filter((e) => e !== p.ease)] : [p.ease];
    const x0 = 140, L = 900, top = lanes.length === 1 ? 470 : 170, gap = 160;
    el('div', { ...MONO, position: 'absolute', left: `${x0}px`, top: '90px', color: 'var(--s-muted)', fontSize: '22px' }, stage, `Mismo movimiento · ${p.duracion}s`);
    const dots = lanes.map((name, i) => {
      const y = top + i * gap;
      const main = i === 0;
      el('div', { position: 'absolute', left: `${x0}px`, top: `${y + 60}px`, width: `${L + 70}px`, height: '2px', background: 'var(--s-ink)', opacity: main ? '0.35' : '0.15' }, stage);
      el('div', { ...DISPLAY, position: 'absolute', left: `${x0}px`, top: `${y}px`, fontSize: main ? '34px' : '26px', color: main ? 'var(--s-accent)' : 'var(--s-ink)', letterSpacing: '-0.01em', textTransform: 'none' }, stage, name);
      el('div', { ...MONO, position: 'absolute', left: `${x0 + 520}px`, top: `${y + 6}px`, fontSize: '18px', color: 'var(--s-muted)', textTransform: 'none', letterSpacing: '0.02em' }, stage, FEEL[name] || 'curva personalizada');
      return el('div', { position: 'absolute', left: `${x0}px`, top: `${y + 36}px`, width: '50px', height: '50px', borderRadius: 'calc(var(--s-radius) * 0.9)', background: main ? 'var(--s-accent)' : 'var(--s-ink)', opacity: main ? '1' : '0.7' }, stage);
    });

    // Gráfico de la curva principal
    const gx = 1250, gy = 220, gs = 560;
    const plot = svg('svg', { width: gs + 80, height: gs + 200, viewBox: `-40 -100 ${gs + 80} ${gs + 200}`, style: `position:absolute;left:${gx - 40}px;top:${gy - 100}px;overflow:visible` }, stage);
    svg('rect', { x: 0, y: 0, width: gs, height: gs, fill: 'none', stroke: 'currentColor', 'stroke-opacity': '0.2', 'stroke-width': 2 }, plot);
    plot.style.color = 'var(--s-ink)';
    const ease = gsap.parseEase(p.ease) || ((t) => t);
    let dPath = '';
    for (let i = 0; i <= 120; i++) { const t = i / 120; const v = ease(t); dPath += `${i ? 'L' : 'M'}${(t * gs).toFixed(1)},${(gs - v * gs).toFixed(1)}`; }
    svg('path', { d: `M0,${gs} L${gs},0`, stroke: 'currentColor', 'stroke-opacity': '0.15', 'stroke-dasharray': '6 8', fill: 'none', 'stroke-width': 2 }, plot);
    const curve = svg('path', { d: dPath, stroke: 'var(--s-accent)', fill: 'none', 'stroke-width': 6, 'stroke-linecap': 'round' }, plot);
    const len = curve.getTotalLength();
    curve.setAttribute('stroke-dasharray', `${len}`);
    const cursor = svg('circle', { r: 14, fill: 'var(--s-accent2)' }, plot);
    const guideV = svg('line', { y1: 0, y2: gs, stroke: 'var(--s-accent2)', 'stroke-opacity': '0.5', 'stroke-width': 2 }, plot);
    const lbl = (txt, x, y) => { const t = svg('text', { x, y, fill: 'currentColor', 'fill-opacity': '0.55', 'font-size': 20, 'font-family': 'JetBrains Mono, monospace' }, plot); t.textContent = txt; };
    lbl('tiempo →', gs - 110, gs + 40);
    lbl('posición ↑', 0, -20);

    const prog = { t: 0 };
    const updCursor = () => {
      const v = ease(prog.t);
      cursor.setAttribute('cx', prog.t * gs); cursor.setAttribute('cy', gs - v * gs);
      guideV.setAttribute('x1', prog.t * gs); guideV.setAttribute('x2', prog.t * gs);
    };

    const tl = gsap.timeline({ paused: true });
    tl.fromTo(curve, { attr: { 'stroke-dashoffset': len } }, { attr: { 'stroke-dashoffset': 0 }, duration: 0.8, ease: 'power2.inOut' }, 0);
    const t0 = 0.9;
    dots.forEach((d, i) => tl.fromTo(d, { x: 0 }, { x: L, duration: p.duracion, ease: lanes[i] }, t0));
    tl.fromTo(prog, { t: 0 }, { t: 1, duration: p.duracion, ease: 'none', onUpdate: updCursor }, t0);
    tl.to({}, { duration: 0.8 });
    updCursor();
    return tl;
  },
};
