// Puntos en onda: una retícula de puntos (trama de medio tono) late con una
// onda que nace en un origen y se expande. El tamaño de cada punto es función
// de su distancia al origen y del tiempo; se dibuja en canvas (miles de puntos).
// La fase avanza ciclos enteros en la duración: bucle sin salto.
import { el, layer, themeColors, toneHex, DISPLAY } from '../core/kit.js';

const ORIGENES = { centro: [960, 540], esquina: [0, 1080], izquierda: [0, 540] };

export default {
  id: 'puntos-onda',
  poster: 0.35,
  build(stage, p, { gsap }) {
    const c = themeColors(stage);
    layer(stage, { background: 'var(--s-bg)' });
    const cv = el('canvas', { position: 'absolute', inset: '0', width: '1920px', height: '1080px' }, stage);
    cv.width = 1920; cv.height = 1080;
    const g = cv.getContext('2d');
    const [ox, oy] = ORIGENES[p.origen] || ORIGENES.centro;
    const gap = p.espaciado;
    const pts = [];
    for (let y = gap / 2; y < 1080; y += gap) for (let x = gap / 2; x < 1920; x += gap) pts.push([x, y, Math.hypot(x - ox, y - oy)]);
    const hot = toneHex(c, p.color);
    const title = el('div', { ...DISPLAY, position: 'absolute', left: '0', right: '0', top: '450px', textAlign: 'center', fontSize: '140px', color: 'var(--s-ink)', textShadow: '0 0 40px var(--s-bg), 0 0 80px var(--s-bg)' }, stage, p.texto || '');

    const st = { t: 0 };
    const cyc = Math.round(p.ciclos);
    const render = () => {
      g.clearRect(0, 0, 1920, 1080);
      const phase = st.t * Math.PI * 2 * cyc;
      for (const [x, y, d] of pts) {
        const w = Math.sin((d / p.longitudOnda) * Math.PI * 2 - phase); // -1..1
        const k = 0.5 + 0.5 * w;
        const rad = (gap * 0.12) + (gap * 0.32) * (1 - p.amplitud + p.amplitud * k);
        g.globalAlpha = 0.25 + 0.75 * k;
        g.fillStyle = k > 0.85 ? hot : c.muted;
        g.beginPath(); g.arc(x, y, rad, 0, Math.PI * 2); g.fill();
      }
      g.globalAlpha = 1;
    };
    const tl = gsap.timeline({ paused: true });
    tl.fromTo(st, { t: 0 }, { t: 1, duration: p.duracion, ease: 'none', onUpdate: render }, 0);
    tl.fromTo(title, { autoAlpha: 0, y: 24 }, { autoAlpha: 1, y: 0, duration: 1, ease: 'power3.out' }, 0.5);
    render();
    return tl;
  },
};
