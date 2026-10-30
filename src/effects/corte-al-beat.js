// Corte al beat: la grilla temporal se deriva del BPM (1 beat = 60/BPM s).
// Se corta cada N beats y el primer tiempo de cada compás (4/4) lleva un pulso
// de escala. Abajo, un metrónomo visual muestra dónde cae cada corte.
import { el, layer, DISPLAY, MONO } from '../core/kit.js';

const SHOTS = [
  { w: 'Ritmo', bg: 'var(--s-accent)', ink: 'var(--s-bg)', shape: 'circle' },
  { w: 'Pulso', bg: 'var(--s-bg)', ink: 'var(--s-ink)', shape: 'stripes' },
  { w: 'Calor', bg: 'var(--s-accent2)', ink: 'var(--s-bg)', shape: 'ring' },
  { w: 'Noche', bg: 'var(--s-bg-2)', ink: 'var(--s-accent3)', shape: 'grid' },
  { w: 'Volumen', bg: 'var(--s-accent3)', ink: 'var(--s-bg)', shape: 'bars' },
  { w: 'Fuego', bg: 'var(--s-ink)', ink: 'var(--s-accent2)', shape: 'circle' },
  { w: 'Ahora', bg: 'var(--s-bg)', ink: 'var(--s-accent)', shape: 'ring' },
  { w: 'Otra vez', bg: 'var(--s-accent)', ink: 'var(--s-bg)', shape: 'stripes' },
];

function shape(parent, kind, ink, i) {
  const base = { position: 'absolute', opacity: '0.9' };
  if (kind === 'circle') el('div', { ...base, right: `${120 + (i % 3) * 60}px`, top: '180px', width: '520px', height: '520px', borderRadius: '50%', background: ink, opacity: '0.18' }, parent);
  if (kind === 'ring') el('div', { ...base, right: '160px', top: '160px', width: '560px', height: '560px', borderRadius: '50%', border: `40px solid ${ink}`, opacity: '0.35' }, parent);
  if (kind === 'stripes') for (let k = 0; k < 7; k++) el('div', { ...base, right: `${100 + k * 80}px`, top: '0', bottom: '0', width: '34px', background: ink, opacity: '0.16' }, parent);
  if (kind === 'grid') for (let k = 0; k < 16; k++) el('div', { ...base, right: `${160 + (k % 4) * 140}px`, top: `${160 + Math.floor(k / 4) * 140}px`, width: '90px', height: '90px', background: ink, opacity: '0.3', borderRadius: 'calc(var(--s-radius) * 0.4)' }, parent);
  if (kind === 'bars') for (let k = 0; k < 6; k++) el('div', { ...base, right: `${160 + k * 100}px`, bottom: '200px', width: '70px', height: `${120 + ((k * 137) % 400)}px`, background: ink, opacity: '0.25' }, parent);
}

export default {
  id: 'corte-al-beat',
  poster: 0.4,
  build(stage, p, { gsap }) {
    const beat = 60 / p.bpm;
    const every = Number(p.cortarCada) || 2;
    const total = Math.round(p.compases) * 4;
    const cam = layer(stage, {});
    const shots = SHOTS.map((s, i) => {
      const L = layer(cam, { background: s.bg, color: s.ink, visibility: 'hidden' });
      shape(L, s.shape, s.ink, i);
      el('div', { ...DISPLAY, position: 'absolute', left: '140px', top: '330px', fontSize: '260px', fontWeight: '900' }, L, s.w);
      el('div', { ...MONO, position: 'absolute', left: '150px', top: '260px', opacity: '0.7' }, L, `Plano ${String(i + 1).padStart(2, '0')}`);
      return L;
    });

    // Metrónomo visual
    const hud = el('div', { position: 'absolute', left: '140px', right: '140px', bottom: '70px', display: 'flex', gap: '10px', alignItems: 'flex-end' }, stage);
    const ticks = Array.from({ length: total }, (_, b) => el('div', { flex: '1', height: b % 4 === 0 ? '26px' : '14px', background: '#ffffff', mixBlendMode: 'difference', opacity: '0.25', outline: b % every === 0 ? '3px solid #ffffff' : 'none', outlineOffset: '4px' }, hud));
    el('div', { ...MONO, position: 'absolute', right: '140px', top: '70px', fontSize: '22px', color: '#ffffff', mixBlendMode: 'difference' }, stage, `${p.bpm} BPM · corte cada ${every}`);

    const tl = gsap.timeline({ paused: true });
    let shot = -1;
    for (let b = 0; b < total; b++) {
      const t = b * beat;
      if (b % every === 0) {
        if (shot >= 0) tl.set(shots[shot % shots.length], { visibility: 'hidden' }, t);
        shot++;
        tl.set(shots[shot % shots.length], { visibility: 'visible' }, t);
      }
      tl.fromTo(ticks[b], { opacity: 1 }, { opacity: 0.25, duration: beat * 0.9, ease: 'power2.out', immediateRender: false }, t);
      if (b % 4 === 0 && p.pulso > 0) tl.fromTo(cam, { scale: 1 + p.pulso }, { scale: 1, duration: beat * 0.8, ease: 'power3.out', immediateRender: false }, t);
    }
    tl.to({}, { duration: beat }, total * beat - beat);
    return tl;
  },
};
