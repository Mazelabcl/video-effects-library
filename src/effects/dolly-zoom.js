// Dolly zoom (vértigo): se dibuja un pasillo en perspectiva. La escala de cada
// marco del pasillo es s = d / (d + z), donde d es la distancia cámara-sujeto y
// z la profundidad del marco detrás del sujeto. El sujeto (z = 0) siempre mide
// lo mismo; el fondo se estira o se comprime. Esa es la física real del efecto.
import { el, layer, themeColors, mix, DISPLAY } from '../core/kit.js';

export default {
  id: 'dolly-zoom',
  poster: 0.8,
  build(stage, p, { gsap }) {
    const c = themeColors(stage);
    const cv = el('canvas', { position: 'absolute', inset: '0', width: '1920px', height: '1080px' }, stage);
    cv.width = 1920; cv.height = 1080;
    const g = cv.getContext('2d');
    const depths = Array.from({ length: 16 }, (_, i) => 0.25 + i * 0.42);
    const wall = mix(c.bg, c.ink, 0.12), floor = mix(c.bg, c.ink, 0.06), ceil = mix(c.bg, '#000000', 0.2);
    const state = { k: 0 };
    const k = p.intensidad;
    const dist = (t) => (p.direccion === 'fondo-se-aleja' ? 1 - 0.75 * Math.min(1, k / 2.5) * t : 1 + 2.2 * k * t);
    const cx = 960, cy = 520;

    const draw = () => {
      const d = dist(state.k);
      g.fillStyle = mix(c.bg, '#000000', 0.4);
      g.fillRect(0, 0, 1920, 1080);
      const rects = [{ hw: 980 * 1.05, hh: 600 * 1.05 }].concat(depths.map((z) => { const s = d / (d + z); return { hw: 980 * s, hh: 600 * s }; }));
      for (let i = 0; i < rects.length - 1; i++) {
        const a = rects[i], b = rects[i + 1];
        const shade = i % 2 ? 1 : 0.86;
        const quad = (pts, col) => { g.beginPath(); g.moveTo(pts[0][0], pts[0][1]); for (const q of pts.slice(1)) g.lineTo(q[0], q[1]); g.closePath(); g.fillStyle = col; g.fill(); };
        quad([[cx - a.hw, cy + a.hh], [cx + a.hw, cy + a.hh], [cx + b.hw, cy + b.hh], [cx - b.hw, cy + b.hh]], mix(floor, '#000000', 1 - shade));
        quad([[cx - a.hw, cy - a.hh], [cx + a.hw, cy - a.hh], [cx + b.hw, cy - b.hh], [cx - b.hw, cy - b.hh]], mix(ceil, '#000000', 1 - shade));
        quad([[cx - a.hw, cy - a.hh], [cx - b.hw, cy - b.hh], [cx - b.hw, cy + b.hh], [cx - a.hw, cy + a.hh]], mix(wall, '#000000', 1 - shade));
        quad([[cx + a.hw, cy - a.hh], [cx + b.hw, cy - b.hh], [cx + b.hw, cy + b.hh], [cx + a.hw, cy + a.hh]], mix(wall, '#000000', 1 - shade));
        if (i % 3 === 1) { // puertas de acento en la pared derecha
          const m = (u, v) => [cx + (a.hw + (b.hw - a.hw) * u), cy + (a.hh + (b.hh - a.hh) * u) * v];
          quad([m(0.25, -0.1), m(0.75, -0.1), m(0.75, 1), m(0.25, 1)], i % 2 ? c.accent : c.accent2);
        }
        // Luz cenital
        const l = (b.hw + a.hw) / 2;
        g.fillStyle = 'rgba(255,255,255,0.10)';
        g.fillRect(cx - l * 0.15, cy - (a.hh + b.hh) / 2 - 2, l * 0.3, 4);
      }
      const end = rects[rects.length - 1];
      g.fillStyle = mix(c.accent3, '#ffffff', 0.4);
      g.fillRect(cx - end.hw, cy - end.hh, end.hw * 2, end.hh * 2);
    };

    // Sujeto: tamaño constante, siempre al centro.
    const subj = el('div', { position: 'absolute', left: '910px', top: '600px', width: '100px', height: '420px' }, stage);
    el('div', { position: 'absolute', left: '22px', top: '0', width: '56px', height: '64px', borderRadius: '50%', background: '#0a0a0c' }, subj);
    el('div', { position: 'absolute', left: '0', top: '70px', width: '100px', height: '350px', borderRadius: '44px 44px 8px 8px', background: '#0a0a0c', boxShadow: `0 0 0 3px ${c.accent}` }, subj);
    const q = el('div', { ...DISPLAY, position: 'absolute', left: '0', right: '0', top: '120px', textAlign: 'center', fontSize: '96px', color: c.ink, textShadow: '0 4px 30px rgba(0,0,0,0.6)' }, stage, '¿Y si nos equivocamos?');
    const vig = layer(stage, { background: 'radial-gradient(ellipse at center, rgba(0,0,0,0) 40%, rgba(0,0,0,0.6) 100%)' });

    const tl = gsap.timeline({ paused: true });
    tl.fromTo(state, { k: 0 }, { k: 1, duration: p.duracion, ease: p.ease, onUpdate: draw }, 0.4);
    tl.fromTo(vig, { opacity: 0.3 }, { opacity: 1, duration: p.duracion, ease: p.ease }, 0.4);
    tl.fromTo(q, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.6, ease: 'power2.out' }, 0.4 + p.duracion * 0.7);
    tl.to({}, { duration: 1.2 });
    draw();
    return tl;
  },
};
