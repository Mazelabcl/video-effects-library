// Barras con conteo y foco: cada barra y su contador comparten EXACTAMENTE la
// misma curva y duración, así el número que se lee siempre corresponde a la
// altura visible (no se muestran valores falsos). Al final, foco en el insight.
import { el, layer, DISPLAY, MONO } from '../core/kit.js';

function parse(s) {
  const out = String(s || '').split(',').map((kv) => kv.split(':')).filter((x) => x.length === 2 && x[0].trim() && Number.isFinite(Number(x[1])))
    .map(([k, v]) => ({ k: k.trim().slice(0, 8), v: Math.max(0, Number(v)) })).slice(0, 8);
  return out.length ? out : [{ k: 'A', v: 1 }];
}

export default {
  id: 'datos-barras-conteo',
  poster: 0.95,
  build(stage, p, { gsap }) {
    const data = parse(p.datos);
    const max = Math.max(...data.map((d) => d.v)) || 1;
    const iMax = data.findIndex((d) => d.v === max);
    layer(stage, { background: 'var(--s-bg)' });
    const head = el('div', { position: 'absolute', left: '140px', top: '90px' }, stage);
    el('div', { ...MONO, color: 'var(--s-muted)', marginBottom: '14px' }, head, 'Leads mensuales · 2026');
    el('div', { ...DISPLAY, fontSize: '76px', color: 'var(--s-ink)' }, head, 'Junio rompió el techo');

    const x0 = 160, x1 = 1760, base = 900, top = 330, plotH = base - top;
    const slot = (x1 - x0) / data.length, bw = Math.min(170, slot * 0.62);
    // Líneas de referencia
    [0.25, 0.5, 0.75, 1].forEach((f) => {
      el('div', { position: 'absolute', left: `${x0}px`, width: `${x1 - x0}px`, top: `${base - plotH * f}px`, height: '1px', background: 'var(--s-ink)', opacity: '0.1' }, stage);
      el('div', { ...MONO, position: 'absolute', left: `${x0 - 90}px`, top: `${base - plotH * f - 14}px`, fontSize: '18px', color: 'var(--s-muted)' }, stage, String(Math.round(max * f)));
    });
    el('div', { position: 'absolute', left: `${x0}px`, width: `${x1 - x0}px`, top: `${base}px`, height: '3px', background: 'var(--s-ink)', opacity: '0.6' }, stage);

    const bars = data.map((d, i) => {
      const cx = x0 + slot * i + slot / 2;
      const bar = el('div', { position: 'absolute', left: `${cx - bw / 2}px`, top: `${base - plotH * (d.v / max)}px`, width: `${bw}px`, height: `${plotH * (d.v / max)}px`, background: 'var(--s-accent)', transformOrigin: '50% 100%', borderRadius: 'calc(var(--s-radius) * 0.25) calc(var(--s-radius) * 0.25) 0 0' }, stage);
      const num = el('div', { ...DISPLAY, position: 'absolute', left: `${cx - 120}px`, width: '240px', textAlign: 'center', top: `${base - plotH * (d.v / max) - 70}px`, fontSize: '50px', color: 'var(--s-ink)', letterSpacing: '-0.02em' }, stage, '0');
      el('div', { ...MONO, position: 'absolute', left: `${cx - 100}px`, width: '200px', textAlign: 'center', top: `${base + 24}px`, fontSize: '22px', color: 'var(--s-muted)' }, stage, d.k);
      return { bar, num, d };
    });
    const prev = data[iMax - 1];
    const pct = prev && prev.v ? Math.round(((max - prev.v) / prev.v) * 100) : null;
    const cx = x0 + slot * iMax + slot / 2;
    // Si no cabe a la derecha de la barra, la nota va a la izquierda (alineada a la derecha).
    const fitsRight = cx + bw / 2 + 24 + 360 < 1880;
    const noteTop = top + 40;
    const note = el('div', { ...MONO, position: 'absolute', left: `${fitsRight ? cx + bw / 2 + 24 : cx - bw / 2 - 24 - 360}px`, textAlign: fitsRight ? 'left' : 'right', top: `${noteTop}px`, fontSize: '26px', color: 'var(--s-accent2)', textTransform: 'none', letterSpacing: '0.02em', width: '360px' }, stage, pct != null ? `+${pct}% vs. ${prev.k}` : 'Máximo del período');

    const tl = gsap.timeline({ paused: true });
    const t0 = 0.4;
    bars.forEach(({ bar, num, d }, i) => {
      const at = t0 + i * p.escalonado;
      const c = { v: 0 };
      tl.fromTo(bar, { scaleY: 0 }, { scaleY: 1, duration: p.duracion, ease: p.ease }, at);
      tl.fromTo(num, { y: plotH * (d.v / max) }, { y: 0, duration: p.duracion, ease: p.ease }, at);
      tl.fromTo(c, { v: 0 }, { v: d.v, duration: p.duracion, ease: p.ease, onUpdate: () => { num.textContent = String(Math.round(c.v)); } }, at);
    });
    const tEnd = t0 + (bars.length - 1) * p.escalonado + p.duracion + 0.3;
    if (p.resaltar === 'si') {
      bars.forEach(({ bar, num }, i) => {
        // Las variables CSS no se interpolan: cambio de color en seco + leve pulso.
        if (i === iMax) { tl.set(bar, { background: 'var(--s-accent2)' }, tEnd); tl.fromTo(bar, { scaleX: 1 }, { scaleX: 1.08, duration: 0.18, yoyo: true, repeat: 1, ease: 'power2.out', immediateRender: false }, tEnd); }
        else tl.to([bar, num], { opacity: 0.25, duration: 0.5, ease: 'power2.out' }, tEnd);
      });
      tl.fromTo(note, { autoAlpha: 0, x: -16 }, { autoAlpha: 1, x: 0, duration: 0.5, ease: 'power3.out' }, tEnd + 0.2);
    } else tl.set(note, { autoAlpha: 0 }, 0);
    tl.to({}, { duration: 1.5 });
    return tl;
  },
};
