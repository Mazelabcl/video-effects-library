// Viraje de color: la misma "fotografía" (escena procedural de colores
// naturales, independiente del tema) cambia de estado emocional con filtros
// CSS + una capa de tinte con modo de fusión + viñeta. Todo se interpola desde
// un único valor de progreso, igual que un keyframe de etalonaje.
import { el, layer, rng, MONO } from '../core/kit.js';

const PRESETS = {
  'frio-a-calido': {
    label: 'Frío → cálido',
    a: { sat: 0.65, hue: -12, bri: 0.95, con: 0.95, sep: 0, tint: '#3a6cff', tintOp: 0.32, blend: 'color', vig: 0.35 },
    b: { sat: 1.25, hue: 6, bri: 1.04, con: 1.06, sep: 0.1, tint: '#ff8a3d', tintOp: 0.38, blend: 'soft-light', vig: 0.25 },
  },
  'color-a-recuerdo': {
    label: 'Color → recuerdo',
    a: { sat: 1, hue: 0, bri: 1, con: 1, sep: 0, tint: '#c9a46a', tintOp: 0, blend: 'multiply', vig: 0.2 },
    b: { sat: 0.15, hue: 0, bri: 1.06, con: 0.88, sep: 0.55, tint: '#c9a46a', tintOp: 0.28, blend: 'multiply', vig: 0.7 },
  },
  'dia-a-noche': {
    label: 'Día → noche',
    a: { sat: 1.05, hue: 0, bri: 1.05, con: 1, sep: 0, tint: '#14215c', tintOp: 0, blend: 'multiply', vig: 0.15 },
    b: { sat: 0.6, hue: -22, bri: 0.5, con: 1.15, sep: 0, tint: '#14215c', tintOp: 0.55, blend: 'multiply', vig: 0.75 },
  },
  'plano-a-tension': {
    label: 'Plano → tensión',
    a: { sat: 0.8, hue: 0, bri: 1.02, con: 0.82, sep: 0, tint: '#0f3d2e', tintOp: 0, blend: 'color', vig: 0.1 },
    b: { sat: 1.1, hue: -8, bri: 0.9, con: 1.5, sep: 0, tint: '#1f6b4a', tintOp: 0.28, blend: 'color', vig: 0.85 },
  },
};

function scene(parent) {
  const s = layer(parent, { background: 'linear-gradient(180deg, #7fb2e5 0%, #c9def0 45%, #f3dcb4 60%)' });
  el('div', { position: 'absolute', left: '1240px', top: '250px', width: '200px', height: '200px', borderRadius: '50%', background: '#fff1c4', boxShadow: '0 0 120px 40px rgba(255,236,180,0.6)' }, s);
  const r = rng(77);
  // Cerros
  el('div', { position: 'absolute', left: '-200px', top: '520px', width: '1400px', height: '700px', borderRadius: '50%', background: '#7c9a63' }, s);
  el('div', { position: 'absolute', left: '800px', top: '560px', width: '1500px', height: '700px', borderRadius: '50%', background: '#6b8a52' }, s);
  // Camino en perspectiva
  el('div', { position: 'absolute', left: '0', right: '0', top: '700px', bottom: '0', background: '#5d7a45' }, s);
  el('div', { position: 'absolute', left: '960px', top: '690px', width: '0', height: '0', borderLeft: '520px solid transparent', borderRight: '520px solid transparent', borderBottom: '390px solid #b9a789', transform: 'translateX(-50%)' }, s);
  // Árboles
  for (let i = 0; i < 9; i++) {
    const x = i < 5 ? 80 + i * 140 + r() * 40 : 1180 + (i - 5) * 170 + r() * 40;
    const sz = 120 + r() * 80;
    el('div', { position: 'absolute', left: `${x + sz / 2 - 8}px`, top: `${700 - 30}px`, width: '16px', height: '90px', background: '#4b3826' }, s);
    el('div', { position: 'absolute', left: `${x}px`, top: `${700 - sz - 10}px`, width: `${sz}px`, height: `${sz}px`, borderRadius: '50%', background: i % 2 ? '#3f6b3a' : '#4f7d40' }, s);
  }
  // Figuras caminando (tonos de piel y ropa: lo que el etalonaje debe respetar)
  [[900, 1], [990, 0.92]].forEach(([x, k], i) => {
    const f = el('div', { position: 'absolute', left: `${x}px`, top: `${760 - 40 * k}px`, width: `${70 * k}px`, height: `${220 * k}px` }, s);
    el('div', { position: 'absolute', left: `${18 * k}px`, top: '0', width: `${34 * k}px`, height: `${34 * k}px`, borderRadius: '50%', background: i ? '#8a5a3c' : '#e0b08a' }, f);
    el('div', { position: 'absolute', left: '0', top: `${38 * k}px`, width: `${70 * k}px`, height: `${110 * k}px`, borderRadius: `${20 * k}px`, background: i ? '#c8413a' : '#2f5d8c' }, f);
    el('div', { position: 'absolute', left: `${12 * k}px`, top: `${146 * k}px`, width: `${46 * k}px`, height: `${74 * k}px`, background: '#2a2a33' }, f);
  });
  return s;
}

export default {
  id: 'viraje-color',
  poster: 0.75,
  build(stage, p, { gsap }) {
    const pr = PRESETS[p.viraje] || PRESETS['frio-a-calido'];
    const k = p.intensidad;
    // A intensidad 0 ambos extremos son neutros; a 1, el preset completo.
    const N = { sat: 1, hue: 0, bri: 1, con: 1, sep: 0, tintOp: 0, vig: 0.15 };
    const lerp = (x, y, t) => x + (y - x) * t;
    const A = Object.fromEntries(Object.keys(N).map((key) => [key, lerp(N[key], pr.a[key], k)]));
    const B = Object.fromEntries(Object.keys(N).map((key) => [key, lerp(N[key], pr.b[key], k)]));

    const pic = scene(stage);
    const tintA = layer(stage, { background: pr.a.tint, mixBlendMode: pr.a.blend, pointerEvents: 'none' });
    const tintB = layer(stage, { background: pr.b.tint, mixBlendMode: pr.b.blend, pointerEvents: 'none' });
    const vig = layer(stage, { background: 'radial-gradient(ellipse at center, rgba(0,0,0,0) 40%, rgba(0,0,0,0.85) 100%)', pointerEvents: 'none' });

    // HUD de etalonaje
    const hud = el('div', { position: 'absolute', left: '80px', bottom: '70px', display: 'flex', alignItems: 'center', gap: '24px', color: '#fff', mixBlendMode: 'difference' }, stage);
    el('div', { ...MONO, fontSize: '22px' }, hud, `Grade · ${pr.label}`);
    const bar = el('div', { position: 'relative', width: '360px', height: '6px', background: 'rgba(255,255,255,0.35)' }, hud);
    const head = el('div', { position: 'absolute', top: '-9px', width: '4px', height: '24px', background: '#fff' }, bar);

    const st = { t: 0 };
    const apply = () => {
      const t = st.t;
      const v = Object.fromEntries(Object.keys(N).map((key) => [key, lerp(A[key], B[key], t)]));
      pic.style.filter = `saturate(${v.sat}) hue-rotate(${v.hue}deg) brightness(${v.bri}) contrast(${v.con}) sepia(${v.sep})`;
      tintA.style.opacity = String(lerp(A.tintOp, 0, t));
      tintB.style.opacity = String(lerp(0, B.tintOp, t));
      vig.style.opacity = String(v.vig);
      head.style.left = `${t * 356}px`;
    };
    const tl = gsap.timeline({ paused: true });
    tl.fromTo(st, { t: 0 }, { t: 1, duration: p.duracion, ease: p.ease, onUpdate: apply }, 0.8);
    tl.to({}, { duration: 1.2 });
    apply();
    return tl;
  },
};
