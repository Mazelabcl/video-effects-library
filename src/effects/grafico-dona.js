// Gráfico de dona: los segmentos se dibujan en secuencia como un solo trazo
// continuo a velocidad constante (el ángulo recorrido es proporcional al tiempo:
// no se exagera ningún segmento). La leyenda muestra cada porcentaje cuando su
// segmento termina. Opcionalmente se destaca el mayor al final.
import { el, svg, layer, DISPLAY, MONO } from '../core/kit.js';

const COLS = ['var(--s-accent)', 'var(--s-accent2)', 'var(--s-accent3)', 'var(--s-ink)', 'var(--s-muted)', 'var(--s-accent)'];

function parseDona(s) {
  const out = String(s || '').split(',').map((kv) => kv.split(':')).filter((x) => x.length === 2 && x[0].trim() && Number(x[1]) > 0)
    .map(([k, v]) => ({ k: k.trim().slice(0, 14), v: Number(v) })).slice(0, 6);
  return out.length ? out : [{ k: 'Total', v: 1 }];
}

export default {
  id: 'grafico-dona',
  poster: 0.92,
  build(stage, p, { gsap }) {
    const data = parseDona(p.datos);
    const sum = data.reduce((a, d) => a + d.v, 0);
    layer(stage, { background: 'var(--s-bg)' });
    const head = el('div', { position: 'absolute', left: '140px', top: '110px' }, stage);
    el('div', { ...MONO, color: 'var(--s-muted)', marginBottom: '14px' }, head, 'Origen de las ventas · 2026');
    el('div', { ...DISPLAY, fontSize: '72px', color: 'var(--s-ink)' }, head, 'De dónde vienen los clientes');

    const R = 270, cx = 620, cy = 610, C = 2 * Math.PI * R;
    const s = svg('svg', { width: '1920', height: '1080', viewBox: '0 0 1920 1080', style: 'position:absolute;inset:0' }, stage);
    svg('circle', { cx, cy, r: R, fill: 'none', stroke: 'var(--s-ink)', 'stroke-opacity': '0.08', 'stroke-width': String(p.grosor) }, s);
    let acc = 0;
    const gapPx = data.length > 1 ? 6 : 0;
    const segs = data.map((d, i) => {
      const len = (d.v / sum) * C;
      const c = svg('circle', { cx, cy, r: R, fill: 'none', stroke: COLS[i % COLS.length], 'stroke-width': String(p.grosor),
        'stroke-dasharray': `0 ${C}`, transform: `rotate(${-90 + (acc / C) * 360} ${cx} ${cy})` }, s);
      const seg = { c, len: Math.max(0, len - gapPx), start: acc / C, end: (acc + len) / C, d, i };
      acc += len;
      return seg;
    });
    const iMax = data.reduce((m, d, i) => (d.v > data[m].v ? i : m), 0);
    const center = el('div', { ...DISPLAY, position: 'absolute', left: `${cx - 220}px`, width: '440px', top: `${cy - 70}px`, textAlign: 'center', fontSize: '120px', color: 'var(--s-ink)', fontVariantNumeric: 'tabular-nums' }, stage, '0%');
    const legend = data.map((d, i) => {
      const row = el('div', { position: 'absolute', left: '1080px', top: `${360 + i * 96}px`, display: 'flex', alignItems: 'center', gap: '24px' }, stage);
      el('div', { width: '28px', height: '28px', borderRadius: '50%', background: COLS[i % COLS.length] }, row);
      el('div', { ...DISPLAY, fontSize: '52px', color: 'var(--s-ink)', fontWeight: '600', textTransform: 'none', width: '420px' }, row, d.k);
      el('div', { ...MONO, fontSize: '34px', color: 'var(--s-muted)' }, row, `${Math.round((d.v / sum) * 100)}%`);
      return row;
    });

    const st = { t: 0 };
    const render = () => {
      for (const g of segs) {
        const f = Math.min(1, Math.max(0, (st.t - g.start) / (g.end - g.start)));
        g.c.setAttribute('stroke-dasharray', `${g.len * f} ${C}`);
      }
      center.textContent = `${Math.round(st.t * 100)}%`;
    };
    const t0 = 0.5;
    const tl = gsap.timeline({ paused: true });
    tl.fromTo(head, { autoAlpha: 0, y: 20 }, { autoAlpha: 1, y: 0, duration: 0.6, ease: 'power3.out' }, 0);
    tl.fromTo(st, { t: 0 }, { t: 1, duration: p.duracion, ease: p.ease, onUpdate: render }, t0);
    // Cada fila de la leyenda aparece cuando empieza su segmento (aprox. con curva lineal).
    legend.forEach((row, i) => tl.fromTo(row, { autoAlpha: 0, x: -20 }, { autoAlpha: 1, x: 0, duration: 0.4, ease: 'power2.out' }, t0 + segs[i].start * p.duracion));
    const tEnd = t0 + p.duracion + 0.3;
    if (p.resaltar === 'si') {
      segs.forEach((g, i) => { if (i !== iMax) tl.to([g.c, legend[i]], { opacity: 0.25, duration: 0.5 }, tEnd); });
      // El centro pasa de "100%" al porcentaje del mayor (proxy: funciona al retroceder).
      const sw = { k: 0 };
      tl.fromTo(sw, { k: 0 }, { k: 1, duration: 0.01, immediateRender: false, onUpdate: () => { center.textContent = sw.k >= 1 ? `${Math.round((data[iMax].v / sum) * 100)}%` : '100%'; } }, tEnd);
      tl.fromTo(center, { scale: 0.8 }, { scale: 1, duration: 0.5, ease: 'back.out(2)', immediateRender: false }, tEnd);
    }
    tl.to({}, { duration: 1.5 });
    render();
    return tl;
  },
};
