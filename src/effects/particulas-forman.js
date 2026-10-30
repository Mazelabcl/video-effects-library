// Partículas que forman una palabra: los destinos se muestrean de la palabra
// dibujada en un canvas oculto. Cada partícula tiene su propio retraso (semilla)
// y una curva lateral, así la llegada se siente orgánica pero es 100% determinista:
// la posición es una función pura del progreso (sirve para render cuadro a cuadro).
import { el, layer, rng, themeColors, SERIF } from '../core/kit.js';

export default {
  id: 'particulas-forman',
  poster: 0.9,
  build(stage, p, { gsap }) {
    const c = themeColors(stage);
    layer(stage, { background: 'radial-gradient(ellipse at 50% 50%, var(--s-bg-2) 0%, var(--s-bg) 70%)' });
    const cv = el('canvas', { position: 'absolute', inset: '0', width: '1920px', height: '1080px' }, stage);
    cv.width = 1920; cv.height = 1080;
    const g = cv.getContext('2d');

    // 1) Muestreo de la palabra
    const text = (p.texto || 'JUNTOS').trim().slice(0, 12) || 'JUNTOS';
    const off = document.createElement('canvas'); off.width = 1920; off.height = 1080;
    const og = off.getContext('2d');
    const fs = Math.min(330, Math.floor(1600 / (text.length * 0.7)));
    og.font = `900 ${fs}px ${c.font}`; og.textAlign = 'center'; og.textBaseline = 'middle';
    og.fillText(text, 960, 500);
    const data = og.getImageData(0, 0, 1920, 1080).data;
    const targets = [];
    for (let y = 0; y < 1080; y += 3) for (let x = 0; x < 1920; x += 3) if (data[(y * 1920 + x) * 4 + 3] > 128) targets.push([x, y]);

    // 2) Partículas con semilla
    const r = rng(p.semilla);
    const N = Math.round(p.cantidad);
    const gauss = () => (r() + r() + r() - 1.5) / 1.5;
    const parts = Array.from({ length: N }, () => {
      const t = targets.length ? targets[Math.floor(r() * targets.length)] : [960, 500];
      const ang = r() * Math.PI * 2;
      const rad = (0.35 + Math.abs(gauss())) * 900 * p.dispersion;
      return {
        sx: 960 + Math.cos(ang) * rad * 1.3, sy: 520 + Math.sin(ang) * rad * 0.8,
        tx: t[0] + (r() - 0.5) * 1.5, ty: t[1] + (r() - 0.5) * 1.5,
        delay: r() * p.variacion * 0.55, swirl: (r() - 0.5) * 260,
        size: p.tamano * (0.6 + r() * 0.8), hot: r() < 0.14,
      };
    });
    const ease = gsap.parseEase('power3.inOut');
    const st = { t: 0 };
    const draw = () => {
      g.clearRect(0, 0, 1920, 1080);
      for (const q of parts) {
        const span = 1 - p.variacion * 0.55;
        const lt = Math.min(1, Math.max(0, (st.t - q.delay) / span));
        const e = ease(lt);
        const bend = Math.sin(Math.PI * e) * q.swirl;
        const dx = q.tx - q.sx, dy = q.ty - q.sy, len = Math.hypot(dx, dy) || 1;
        const x = q.sx + dx * e + (-dy / len) * bend;
        const y = q.sy + dy * e + (dx / len) * bend;
        g.globalAlpha = 0.35 + 0.65 * e;
        g.fillStyle = q.hot ? c.accent : c.ink;
        g.fillRect(x, y, q.size, q.size);
      }
      g.globalAlpha = 1;
    };
    const tag = el('div', { ...SERIF, position: 'absolute', left: '0', right: '0', top: '700px', textAlign: 'center', fontSize: '64px', color: 'var(--s-muted)' }, stage, 'Muchas partes, una sola voz.');

    const tl = gsap.timeline({ paused: true });
    tl.fromTo(st, { t: 0 }, { t: 1, duration: p.duracion, ease: 'none', onUpdate: draw }, 0.3);
    tl.fromTo(tag, { autoAlpha: 0, y: 20 }, { autoAlpha: 1, y: 0, duration: 0.7, ease: 'power3.out' }, 0.3 + p.duracion + 0.1);
    tl.to({}, { duration: 1.4 });
    draw();
    return tl;
  },
};
