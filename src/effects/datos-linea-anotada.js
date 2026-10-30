// Línea que se dibuja con anotación: el trazado avanza por stroke-dashoffset;
// el área bajo la curva y el punto que la recorre se sincronizan con la punta
// de la línea. La anotación aparece EXACTAMENTE cuando la punta llega al punto
// clave: se invierte la curva de easing numéricamente para calcular ese instante.
import { el, svg, layer, rng, nextId, DISPLAY, MONO } from '../core/kit.js';

export default {
  id: 'datos-linea-anotada',
  poster: 0.95,
  build(stage, p, { gsap }) {
    layer(stage, { background: 'var(--s-bg)' });
    const head = el('div', { position: 'absolute', left: '140px', top: '90px' }, stage);
    el('div', { ...MONO, color: 'var(--s-muted)', marginBottom: '14px' }, head, 'Usuarios activos · 36 semanas');
    el('div', { ...DISPLAY, fontSize: '76px', color: 'var(--s-ink)' }, head, 'El punto de quiebre');

    // Datos con semilla: caminata aleatoria + salto en la semana 22
    const r = rng(p.semilla);
    const N = 36, jump = 22;
    let v = 30;
    const vals = Array.from({ length: N }, (_, i) => { v += (r() - 0.45) * 6 + (i === jump ? 22 : 0) + (i > jump ? 1.6 : 0); return Math.max(5, v); });
    const max = Math.max(...vals) * 1.1;
    const X0 = 160, X1 = 1760, Y0 = 930, Y1 = 330;
    const pts = vals.map((val, i) => [X0 + ((X1 - X0) * i) / (N - 1), Y0 - ((Y0 - Y1) * val) / max]);

    let d = `M${pts[0][0]},${pts[0][1]}`;
    if (p.suavizado === 'si') {
      for (let i = 0; i < pts.length - 1; i++) { // Catmull-Rom → Bézier
        const p0 = pts[i - 1] || pts[i], p1 = pts[i], p2 = pts[i + 1], p3 = pts[i + 2] || p2;
        const c1 = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6];
        const c2 = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6];
        d += ` C${c1[0].toFixed(1)},${c1[1].toFixed(1)} ${c2[0].toFixed(1)},${c2[1].toFixed(1)} ${p2[0]},${p2[1]}`;
      }
    } else d += pts.slice(1).map((q) => ` L${q[0]},${q[1]}`).join('');

    const s = svg('svg', { width: 1920, height: 1080, viewBox: '0 0 1920 1080', style: 'position:absolute;left:0;top:0;overflow:visible' }, stage);
    [0.25, 0.5, 0.75, 1].forEach((f) => svg('line', { x1: X0, x2: X1, y1: Y0 - (Y0 - Y1) * f, y2: Y0 - (Y0 - Y1) * f, stroke: 'var(--s-ink)', 'stroke-opacity': 0.1 }, s));
    svg('line', { x1: X0, x2: X1, y1: Y0, y2: Y0, stroke: 'var(--s-ink)', 'stroke-opacity': 0.5, 'stroke-width': 3 }, s);
    const cid = nextId('clip');
    const clipRect = svg('rect', { x: X0, y: 0, width: 0, height: 1080 }, svg('clipPath', { id: cid }, svg('defs', {}, s)));
    const gid = nextId('grad');
    const grad = svg('linearGradient', { id: gid, x1: 0, x2: 0, y1: 0, y2: 1 }, s.querySelector('defs'));
    svg('stop', { offset: '0%', 'stop-color': 'var(--s-accent)', 'stop-opacity': 0.35 }, grad);
    svg('stop', { offset: '100%', 'stop-color': 'var(--s-accent)', 'stop-opacity': 0 }, grad);
    svg('path', { d: `${d} L${X1},${Y0} L${X0},${Y0} Z`, fill: `url(#${gid})`, 'clip-path': `url(#${cid})` }, s);
    const line = svg('path', { d, fill: 'none', stroke: 'var(--s-accent)', 'stroke-width': 7, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, s);
    const dot = svg('circle', { r: 13, fill: 'var(--s-ink)', stroke: 'var(--s-bg)', 'stroke-width': 5 }, s);
    const len = line.getTotalLength();
    line.setAttribute('stroke-dasharray', `${len} ${len}`);

    // Fracción de largo donde está el salto (búsqueda binaria por x)
    const xj = pts[jump][0];
    let lo = 0, hi = len;
    for (let k = 0; k < 30; k++) { const m = (lo + hi) / 2; if (line.getPointAtLength(m).x < xj) lo = m; else hi = m; }
    const frac = lo / len;
    // Invertir el easing: ¿en qué momento la punta llega a 'frac'?
    const ease = gsap.parseEase(p.ease) || ((t) => t);
    let a = 0, b = 1;
    for (let k = 0; k < 30; k++) { const m = (a + b) / 2; if (ease(m) < frac) a = m; else b = m; }
    const tJump = a * p.duracion;

    // Anotación
    const [jx, jy] = pts[jump];
    const vline = svg('line', { x1: jx, x2: jx, y1: Y0, y2: jy, stroke: 'var(--s-accent2)', 'stroke-width': 3, 'stroke-dasharray': '8 8' }, s);
    const note = el('div', { position: 'absolute', left: `${jx - 470}px`, top: `${jy - 150}px`, width: '440px', textAlign: 'right' }, stage);
    el('div', { ...MONO, fontSize: '20px', color: 'var(--s-accent2)', marginBottom: '8px' }, note, `Semana ${jump + 1}`);
    el('div', { ...DISPLAY, fontSize: '42px', color: 'var(--s-ink)', lineHeight: '1.05', letterSpacing: '-0.015em' }, note, p.anotacion || '');

    const st = { t: 0 };
    const apply = () => {
      const l = len * st.t;
      line.setAttribute('stroke-dashoffset', `${len - l}`);
      const q = line.getPointAtLength(l);
      dot.setAttribute('cx', q.x); dot.setAttribute('cy', q.y);
      clipRect.setAttribute('width', Math.max(0, q.x - X0));
    };
    const T0 = 0.5;
    const tl = gsap.timeline({ paused: true });
    tl.fromTo(st, { t: 0 }, { t: 1, duration: p.duracion, ease: p.ease, onUpdate: apply }, T0);
    tl.fromTo(vline, { opacity: 0 }, { opacity: 1, duration: 0.3 }, T0 + tJump);
    tl.fromTo(note, { autoAlpha: 0, y: 16 }, { autoAlpha: 1, y: 0, duration: 0.5, ease: 'power3.out' }, T0 + tJump + 0.05);
    tl.to({}, { duration: 1.6 });
    apply();
    return tl;
  },
};
