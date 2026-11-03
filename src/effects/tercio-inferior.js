// Tercio inferior (lower third): nombre y cargo de quien habla. Entra en capas
// (barra de acento → nombre → cargo), se queda quieto el tiempo de lectura y sale
// en orden inverso más rápido. Nunca tapa la cara: va en el tercio inferior y,
// en 9:16, por encima de la zona que ocupan los botones de la app.
import { el, layer, stageSize, DISPLAY, MONO, tone } from '../core/kit.js';

export default {
  id: 'tercio-inferior',
  poster: 0.45,
  size: (p) => stageSize(p.formato),
  build(stage, p, { gsap }) {
    const { w, h } = stageSize(p.formato);
    const vert = h > w;
    const right = p.lado === 'derecha';
    // Fondo que simula una entrevista (persona desenfocada a un lado).
    layer(stage, { background: 'linear-gradient(120deg, var(--s-bg-2) 0%, var(--s-bg) 70%)' });
    const fig = el('div', { position: 'absolute', [right ? 'left' : 'right']: `${vert ? 140 : 360}px`, top: `${h * 0.16}px`, width: '520px', height: `${h}px`, filter: 'blur(14px)', opacity: '0.5' }, stage);
    el('div', { position: 'absolute', left: '150px', top: '0', width: '220px', height: '260px', borderRadius: '50%', background: 'var(--s-muted)' }, fig);
    el('div', { position: 'absolute', left: '0', top: '280px', width: '520px', height: '800px', borderRadius: '260px 260px 0 0', background: 'var(--s-muted)' }, fig);

    const color = tone(p.color);
    const fs = vert ? 72 : 64;
    const block = el('div', { position: 'absolute', [right ? 'right' : 'left']: `${vert ? 70 : 120}px`, bottom: `${vert ? 420 : 130}px`, display: 'flex', flexDirection: right ? 'row-reverse' : 'row', alignItems: 'stretch', gap: '22px' }, stage);
    const bar = el('div', { width: '12px', background: color, transformOrigin: '50% 100%' }, block);
    const col = el('div', { display: 'flex', flexDirection: 'column', alignItems: right ? 'flex-end' : 'flex-start', gap: '10px' }, block);
    const nameWin = el('div', { overflow: 'hidden' }, col);
    const caja = p.estilo === 'caja';
    const name = el('div', { ...DISPLAY, fontSize: `${fs}px`, lineHeight: '1.1', whiteSpace: 'nowrap', textTransform: 'none',
      color: caja ? 'var(--s-bg)' : 'var(--s-ink)', background: caja ? 'var(--s-ink)' : 'transparent', padding: caja ? '6px 22px' : '0' }, nameWin, p.nombre || '');
    const roleWin = el('div', { overflow: 'hidden' }, col);
    const role = el('div', { ...MONO, fontSize: `${vert ? 30 : 26}px`, whiteSpace: 'nowrap', color: caja ? 'var(--s-bg)' : 'var(--s-ink)', background: caja ? color : 'transparent', padding: caja ? '8px 22px' : '0', opacity: caja ? '1' : '0.75' }, roleWin, p.cargo || '');
    if (p.estilo !== 'barra') bar.style.display = 'none';
    const rule = el('div', { height: '3px', width: '100%', background: color, transformOrigin: right ? '100% 50%' : '0 50%', display: p.estilo === 'minimal' ? 'block' : 'none' }, col);
    col.insertBefore(rule, roleWin);

    const d = p.duracion, t0 = 0.6;
    const sx = right ? 1 : -1;
    const tOut = t0 + d * 1.4 + p.permanencia;
    const tl = gsap.timeline({ paused: true });
    tl.fromTo(bar, { scaleY: 0 }, { scaleY: 1, duration: d * 0.6, ease: p.ease }, t0);
    tl.fromTo(rule, { scaleX: 0 }, { scaleX: 1, duration: d, ease: p.ease }, t0);
    tl.fromTo(name, { xPercent: 105 * sx }, { xPercent: 0, duration: d, ease: p.ease }, t0 + d * 0.2);
    tl.fromTo(role, { yPercent: -110 }, { yPercent: 0, duration: d * 0.8, ease: p.ease }, t0 + d * 0.6);
    // Salida: inversa y más rápida (lo que se va importa menos que lo que llega).
    tl.to(role, { yPercent: -110, duration: d * 0.5, ease: 'power2.in' }, tOut);
    tl.to(name, { xPercent: 105 * sx, duration: d * 0.6, ease: 'power2.in' }, tOut + d * 0.15);
    tl.to(rule, { scaleX: 0, duration: d * 0.5, ease: 'power2.in' }, tOut + d * 0.2);
    tl.to(bar, { scaleY: 0, duration: d * 0.4, ease: 'power2.in' }, tOut + d * 0.5);
    tl.to({}, { duration: 0.6 });
    return tl;
  },
};
