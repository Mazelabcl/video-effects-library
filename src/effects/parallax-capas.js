// Parallax de capas: cordilleras generadas con semilla a distintas
// profundidades. Cada capa se desplaza en proporción a su cercanía: las lejanas
// casi no se mueven, las cercanas mucho. El título vive ENTRE capas, lo que le
// da un lugar físico dentro del paisaje.
import { el, svg, layer, rng, mix, themeColors, SERIF, MONO } from '../core/kit.js';

function ridge(r, w, base, amp, rough) {
  const pts = [];
  let y = base;
  for (let x = 0; x <= w; x += 40) {
    y += (r() - 0.5) * rough;
    y = Math.max(base - amp, Math.min(base + amp * 0.4, y));
    pts.push(`${x},${y.toFixed(1)}`);
  }
  return `0,1080 ${pts.join(' ')} ${w},1080`;
}

export default {
  id: 'parallax-capas',
  poster: 0.5,
  build(stage, p, { gsap }) {
    const c = themeColors(stage);
    const n = Math.round(p.capas);
    const r = rng(p.semilla);
    const sky = mix(c.accent2, '#ffffff', 0.25);
    const far = mix(c.accent, sky, 0.55);
    const near = mix(c.bg, '#000000', 0.3);
    layer(stage, { background: `linear-gradient(180deg, ${mix(c.bg, c.accent, 0.35)} 0%, ${sky} 70%)` });
    const sun = el('div', { position: 'absolute', left: '1180px', top: '300px', width: '220px', height: '220px', borderRadius: '50%', background: mix(c.accent3, '#ffffff', 0.35) }, stage);

    const W = 3600, left = -(W - 1920) / 2;
    const layers = [];
    const factorOf = (i) => 0.08 + (i / Math.max(1, n - 1)) * p.profundidad;
    for (let i = 0; i < n; i++) {
      const t = i / Math.max(1, n - 1);
      const holder = el('div', { position: 'absolute', left: `${left}px`, top: '0', width: `${W}px`, height: '1080px' }, stage);
      const s = svg('svg', { width: W, height: 1080, viewBox: `0 0 ${W} 1080` }, holder);
      svg('polygon', { points: ridge(r, W, 520 + t * 380, 150 - t * 40, 70 + t * 40), fill: mix(far, near, t) }, s);
      layers.push({ node: holder, f: factorOf(i) });
      if (i === Math.floor(n / 2) - 1) {
        // Título entre capas (profundidad intermedia)
        const title = el('div', { position: 'absolute', left: '0', top: '0', width: '1920px', height: '1080px' }, stage);
        el('div', { ...MONO, position: 'absolute', left: '160px', top: '210px', color: mix(c.bg, '#000000', 0.2) }, title, '−49.33, −72.88');
        el('div', { ...SERIF, position: 'absolute', left: '150px', top: '250px', fontSize: '150px', lineHeight: '1', color: mix(c.bg, '#000000', 0.15) }, title, 'Patagonia, 5:40 a. m.');
        layers.push({ node: title, f: factorOf(i) + 0.08 * p.profundidad });
      }
    }
    layers.unshift({ node: sun, f: 0.03 });

    const d = p.desplazamiento;
    const tl = gsap.timeline({ paused: true });
    layers.forEach(({ node, f }) => {
      tl.fromTo(node, { x: (d * f) / 2 }, { x: (-d * f) / 2, duration: p.duracion, ease: p.ease }, 0);
    });
    // Leve subida del sol: refuerza que el tiempo corre (acción secundaria)
    tl.fromTo(sun, { y: 40 }, { y: -10, duration: p.duracion, ease: 'sine.inOut' }, 0);
    return tl;
  },
};
