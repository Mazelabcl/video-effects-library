// Barrido látigo (whip pan): las dos escenas viven en una "tira" continua.
// La tira se desplaza muy rápido y un desenfoque DIRECCIONAL (solo en el eje
// del movimiento) esconde el cambio. El desenfoque llega a su máximo a mitad
// del barrido, como en una cámara real.
import { el, svg, layer, rng, nextId, DISPLAY, MONO } from '../core/kit.js';

function skyline(parent, seed, { color, window: win, lit }) {
  const r = rng(seed);
  let x = -20;
  while (x < 1940) {
    const w = 80 + r() * 150, h = 160 + r() * 420;
    const b = el('div', { position: 'absolute', left: `${x}px`, bottom: '0', width: `${w}px`, height: `${h}px`, background: color }, parent);
    if (win) {
      for (let wy = 30; wy < h - 30; wy += 46) {
        for (let wx = 16; wx < w - 24; wx += 34) {
          if (r() < lit) el('div', { position: 'absolute', left: `${wx}px`, top: `${wy}px`, width: '14px', height: '20px', background: win, opacity: String(0.5 + r() * 0.5) }, b);
        }
      }
    }
    x += w + 6;
  }
}

const VEC = { izquierda: [1, 0], derecha: [-1, 0], arriba: [0, 1], abajo: [0, -1] };

export default {
  id: 'barrido-latigo',
  poster: 0.42,
  build(stage, p, { gsap }) {
    const [vx, vy] = VEC[p.direccion] || VEC.izquierda;
    const fid = nextId('whip');
    const defs = svg('svg', { width: '0', height: '0', style: 'position:absolute' }, stage);
    const filter = svg('filter', { id: fid, filterUnits: 'userSpaceOnUse', x: '-2400', y: '-1400', width: '6720', height: '3880' }, svg('defs', {}, defs));
    const blur = svg('feGaussianBlur', { in: 'SourceGraphic', stdDeviation: '0 0' }, filter);

    const strip = layer(stage, { overflow: 'visible', filter: `url(#${fid})` });

    // Escena A: Santiago, mañana.
    const A = layer(strip, { background: 'linear-gradient(180deg, var(--s-accent3) 0%, var(--s-accent2) 100%)' });
    el('div', { position: 'absolute', left: '1280px', top: '170px', width: '300px', height: '300px', borderRadius: '50%', background: '#fff3d1', opacity: '0.9' }, A);
    const skyA = el('div', { position: 'absolute', left: '0', right: '0', bottom: '0', height: '620px' }, A);
    skyline(skyA, 4, { color: 'rgba(40,20,30,0.82)', window: null, lit: 0 });
    el('div', { ...MONO, position: 'absolute', left: '140px', top: '150px', color: '#2a1612' }, A, '08:00 — Reunión con el cliente');
    el('div', { ...DISPLAY, position: 'absolute', left: '130px', top: '200px', fontSize: '200px', color: '#2a1612' }, A, 'Santiago');

    // Escena B: Tokio, noche. Se ubica "al lado" en la dirección del barrido.
    const B = layer(strip, { background: 'linear-gradient(180deg, #0b0f2a 0%, #1d1240 100%)', transform: `translate(${vx * 1920}px, ${vy * 1080}px)` });
    const skyB = el('div', { position: 'absolute', left: '0', right: '0', bottom: '0', height: '680px' }, B);
    skyline(skyB, 12, { color: '#080a18', window: 'var(--s-accent)', lit: 0.35 });
    el('div', { ...MONO, position: 'absolute', left: '140px', top: '150px', color: 'var(--s-accent)' }, B, '21:00 — El mismo archivo, otra mesa');
    el('div', { ...DISPLAY, position: 'absolute', left: '130px', top: '200px', fontSize: '200px', color: '#f4f1ff' }, B, 'Tokio');

    const dur = p.duracion;
    const hold = 1.0;
    const blurState = { v: 0 };
    const applyBlur = () => blur.setAttribute('stdDeviation', vx ? `${blurState.v} 0` : `0 ${blurState.v}`);

    const tl = gsap.timeline({ paused: true });
    tl.set(strip, { x: 0, y: 0 }, 0);
    // Pequeña deriva previa: la cámara "busca" antes de girar.
    tl.to(strip, { x: -vx * 14, y: -vy * 14, duration: hold, ease: 'sine.inOut' }, 0);
    tl.to(strip, { x: -vx * 1920, y: -vy * 1080, duration: dur, ease: p.ease }, hold);
    tl.fromTo(blurState, { v: 0 }, { v: p.desenfoque, duration: dur / 2, ease: 'power2.in', onUpdate: applyBlur, immediateRender: false }, hold);
    tl.to(blurState, { v: 0, duration: dur / 2, ease: 'power2.out', onUpdate: applyBlur }, hold + dur / 2);
    // Asentamiento: la cámara se pasa unos píxeles y vuelve (inercia).
    tl.to(strip, { x: -vx * 1920 - vx * 10, y: -vy * 1080 - vy * 10, duration: 0.25, ease: 'sine.out' }, hold + dur);
    tl.to(strip, { x: -vx * 1920, y: -vy * 1080, duration: 0.5, ease: 'sine.inOut' }, hold + dur + 0.25);
    tl.to({}, { duration: 0.7 });
    applyBlur();
    return tl;
  },
};
