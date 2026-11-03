// Ranking de barras horizontales: los ítems se ordenan de mayor a menor y las
// barras crecen desde el mismo eje (base cero: comparación honesta). El valor de
// cada barra viaja pegado a su punta con la MISMA curva. El ítem destacado
// (p. ej. la marca del cliente) lleva el color de acento; el resto, neutro.
import { el, layer, DISPLAY, MONO, fmtNum, tone } from '../core/kit.js';

function parseRanking(s) {
  const out = String(s || '').split(',').map((kv) => kv.split(':')).filter((x) => x.length === 2 && x[0].trim() && Number.isFinite(Number(x[1])))
    .map(([k, v]) => ({ k: k.trim().slice(0, 18), v: Math.max(0, Number(v)) })).slice(0, 7);
  return out.length ? out : [{ k: 'A', v: 1 }];
}

export default {
  id: 'ranking-barras',
  poster: 0.92,
  build(stage, p, { gsap }) {
    const data = parseRanking(p.datos);
    if (p.ordenar === 'si') data.sort((a, b) => b.v - a.v);
    const max = Math.max(...data.map((d) => d.v)) || 1;
    layer(stage, { background: 'var(--s-bg)' });
    const head = el('div', { position: 'absolute', left: '140px', top: '100px' }, stage);
    el('div', { ...MONO, color: 'var(--s-muted)', marginBottom: '14px' }, head, 'Satisfacción de clientes · índice 0-100');
    el('div', { ...DISPLAY, fontSize: '72px', color: 'var(--s-ink)' }, head, 'Lideramos la categoría');

    const x0 = 560, x1 = 1640, top = 300, rowH = Math.min(110, 680 / data.length), bh = rowH * 0.62;
    const hi = String(p.destacar || '').trim().toLowerCase();
    const rows = data.map((d, i) => {
      const y = top + i * rowH;
      const mine = d.k.toLowerCase() === hi;
      const lab = el('div', { ...DISPLAY, position: 'absolute', left: '140px', width: `${x0 - 180}px`, top: `${y}px`, height: `${bh}px`, lineHeight: `${bh}px`, textAlign: 'right', fontSize: '40px', fontWeight: mine ? '800' : '500', textTransform: 'none', color: mine ? 'var(--s-ink)' : 'var(--s-muted)' }, stage, d.k);
      const w = (x1 - x0) * (d.v / max);
      const bar = el('div', { position: 'absolute', left: `${x0}px`, top: `${y}px`, width: `${w}px`, height: `${bh}px`, background: mine ? tone(p.color) : 'var(--s-ink)', opacity: mine ? '1' : '0.28', transformOrigin: '0 50%', borderRadius: `0 calc(var(--s-radius) * 0.3) calc(var(--s-radius) * 0.3) 0` }, stage);
      const num = el('div', { ...MONO, position: 'absolute', left: `${x0 + w + 20}px`, top: `${y}px`, height: `${bh}px`, lineHeight: `${bh}px`, fontSize: '34px', color: mine ? tone(p.color) : 'var(--s-muted)', fontWeight: '600' }, stage, '0');
      return { lab, bar, num, d, w };
    });
    el('div', { position: 'absolute', left: `${x0 - 2}px`, top: `${top - 20}px`, width: '3px', height: `${rows.length * rowH}px`, background: 'var(--s-ink)', opacity: '0.5' }, stage);

    const tl = gsap.timeline({ paused: true });
    tl.fromTo(head, { autoAlpha: 0, y: 20 }, { autoAlpha: 1, y: 0, duration: 0.6, ease: 'power3.out' }, 0);
    rows.forEach(({ lab, bar, num, d, w }, i) => {
      const at = 0.5 + i * p.escalonado;
      const c = { v: 0 };
      tl.fromTo(lab, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.3 }, at);
      tl.fromTo(bar, { scaleX: 0 }, { scaleX: 1, duration: p.duracion, ease: p.ease }, at);
      tl.fromTo(num, { x: -w }, { x: 0, duration: p.duracion, ease: p.ease }, at);
      tl.fromTo(c, { v: 0 }, { v: d.v, duration: p.duracion, ease: p.ease, onUpdate: () => { num.textContent = fmtNum(c.v); } }, at);
    });
    tl.to({}, { duration: 1.6 });
    return tl;
  },
};
