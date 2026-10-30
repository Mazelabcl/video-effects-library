// Disolvencia de paso del tiempo: MISMO encuadre (ventana, escritorio, taza)
// a dos horas distintas. Lo único que cambia es la luz: por eso la fusión lee
// como "pasaron horas" y no como "cambiamos de lugar".
import { el, layer, rng, SERIF, MONO } from '../core/kit.js';

function room(parent, night) {
  const s = layer(parent, { background: night ? '#0d0f1c' : '#e9e4da' });
  // Ventana
  const win = el('div', { position: 'absolute', left: '980px', top: '120px', width: '760px', height: '560px', overflow: 'hidden', background: night ? 'linear-gradient(180deg,#0a1030 0%,#1b1f4a 100%)' : 'linear-gradient(180deg,#9cc9ff 0%,#dcecff 100%)', border: `18px solid ${night ? '#1b1c2b' : '#f7f4ee'}` }, s);
  el('div', { position: 'absolute', left: night ? '520px' : '120px', top: night ? '70px' : '90px', width: '110px', height: '110px', borderRadius: '50%', background: night ? '#f1ecdc' : '#fff6cf', boxShadow: night ? '0 0 60px 10px rgba(240,235,220,0.25)' : '0 0 90px 30px rgba(255,240,180,0.7)' }, win);
  const r = rng(21);
  let x = -10;
  while (x < 780) {
    const w = 50 + r() * 90, h = 120 + r() * 220;
    const b = el('div', { position: 'absolute', left: `${x}px`, bottom: '0', width: `${w}px`, height: `${h}px`, background: night ? '#05060d' : '#a9b6c8' }, win);
    if (night) for (let wy = 16; wy < h - 10; wy += 26) for (let wx = 8; wx < w - 12; wx += 18) if (r() < 0.3) el('div', { position: 'absolute', left: `${wx}px`, top: `${wy}px`, width: '8px', height: '11px', background: '#ffd27a' }, b);
    x += w + 4;
  }
  el('div', { position: 'absolute', left: '50%', top: '0', bottom: '0', width: '14px', marginLeft: '-7px', background: night ? '#1b1c2b' : '#f7f4ee' }, win);
  // Escritorio y objetos
  el('div', { position: 'absolute', left: '0', right: '0', top: '760px', bottom: '0', background: night ? '#16131a' : '#c9b79c' }, s);
  el('div', { position: 'absolute', left: '1140px', top: '600px', width: '420px', height: '170px', background: night ? '#22222c' : '#5b5f6b', borderRadius: '10px 10px 0 0' }, s);
  el('div', { position: 'absolute', left: '1160px', top: '616px', width: '380px', height: '140px', background: night ? 'linear-gradient(180deg,#9fb4ff,#5b7cff)' : '#2d3038', boxShadow: night ? '0 0 120px 40px rgba(110,140,255,0.35)' : 'none' }, s);
  el('div', { position: 'absolute', left: '1090px', top: '770px', width: '520px', height: '22px', background: night ? '#2c2c38' : '#787d8a', borderRadius: '0 0 12px 12px' }, s);
  const mug = el('div', { position: 'absolute', left: '1680px', top: '660px', width: '100px', height: '110px', background: night ? '#3b2f3a' : '#f3efe7', borderRadius: '0 0 22px 22px' }, s);
  el('div', { position: 'absolute', right: '-38px', top: '22px', width: '40px', height: '50px', border: `12px solid ${night ? '#3b2f3a' : '#f3efe7'}`, borderLeft: '0', borderRadius: '0 26px 26px 0' }, mug);
  if (night) el('div', { position: 'absolute', inset: '0', background: 'radial-gradient(ellipse at 72% 70%, rgba(91,124,255,0.18), transparent 55%)' }, s);
  // Texto
  el('div', { ...MONO, position: 'absolute', left: '140px', top: '640px', color: night ? '#8b90b5' : '#7c705e' }, s, night ? 'Mismo escritorio' : 'Lunes');
  el('div', { position: 'absolute', left: '130px', top: '680px', fontFamily: '"JetBrains Mono", monospace', fontWeight: '600', fontSize: '150px', letterSpacing: '-0.04em', color: night ? '#eef0ff' : '#23201b' }, s, night ? '23:47' : '08:12');
  el('div', { ...SERIF, position: 'absolute', left: '140px', top: '870px', fontSize: '64px', color: night ? '#c9cdf0' : '#4b4338' }, s, night ? 'y seguimos aquí.' : 'Empezamos temprano…');
  return s;
}

export default {
  id: 'disolvencia-temporal',
  poster: 0.5,
  build(stage, p, { gsap }) {
    const A = room(stage, false);
    const B = room(stage, true);
    const h = p.sostener, d = p.duracion, b = p.desenfoque;
    const tl = gsap.timeline({ paused: true });
    tl.set(B, { opacity: 0, filter: `blur(${b}px)` }, 0);
    tl.set(A, { filter: 'blur(0px)' }, 0);
    tl.to(B, { opacity: 1, duration: d, ease: p.ease }, h);
    // El desenfoque sube y baja en espejo: A se "va" mientras B "llega".
    tl.to(A, { filter: `blur(${b}px)`, duration: d, ease: p.ease }, h);
    tl.to(B, { filter: 'blur(0px)', duration: d, ease: p.ease }, h);
    tl.to({}, { duration: h });
    return tl;
  },
};
