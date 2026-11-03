// Contador de cifra (KPI): un número grande sube desde 0 hasta el valor con
// formato local (miles con punto), prefijo y sufijo. Usa cifras tabulares para
// que el ancho no "baile" mientras cuenta. Al terminar, una etiqueta de
// variación confirma el logro: primero el número, después la interpretación.
import { el, layer, DISPLAY, MONO, fmtNum, tone } from '../core/kit.js';

export default {
  id: 'contador-cifra',
  poster: 0.9,
  build(stage, p, { gsap }) {
    layer(stage, { background: 'var(--s-bg)' });
    const label = el('div', { ...MONO, position: 'absolute', left: '0', right: '0', top: '300px', textAlign: 'center', color: 'var(--s-muted)' }, stage, p.etiqueta || '');
    const row = el('div', { ...DISPLAY, position: 'absolute', left: '0', right: '0', top: '360px', textAlign: 'center', fontSize: '260px', color: 'var(--s-ink)', fontVariantNumeric: 'tabular-nums', whiteSpace: 'nowrap' }, stage);
    el('span', { color: tone(p.color) }, row, p.prefijo || '');
    const num = el('span', {}, row, fmtNum(0, p.decimales));
    el('span', { color: tone(p.color), fontSize: '0.45em', marginLeft: '0.1em' }, row, p.sufijo || '');
    const badge = el('div', { position: 'absolute', left: '0', right: '0', top: '700px', textAlign: 'center' }, stage);
    const pill = el('span', { ...MONO, display: 'inline-block', padding: '14px 26px', borderRadius: '999px', background: tone(p.color), color: 'var(--s-bg)', textTransform: 'none', fontWeight: '600' }, badge, p.variacion || '');
    if (!p.variacion) badge.style.display = 'none';

    const c = { v: 0 };
    const dec = Math.round(p.decimales);
    const tl = gsap.timeline({ paused: true });
    tl.fromTo(label, { autoAlpha: 0, y: 16 }, { autoAlpha: 1, y: 0, duration: 0.5, ease: 'power2.out' }, 0.1);
    tl.fromTo(row, { autoAlpha: 0, y: 30 }, { autoAlpha: 1, y: 0, duration: 0.5, ease: 'power3.out' }, 0.2);
    tl.fromTo(c, { v: 0 }, { v: p.valor, duration: p.duracion, ease: p.ease, onUpdate: () => { num.textContent = fmtNum(c.v, dec); } }, 0.3);
    tl.fromTo(pill, { autoAlpha: 0, scale: 0.6 }, { autoAlpha: 1, scale: 1, duration: 0.5, ease: 'back.out(2)' }, 0.3 + p.duracion + 0.2);
    tl.to({}, { duration: 1.6 });
    return tl;
  },
};
