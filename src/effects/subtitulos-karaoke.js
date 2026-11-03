// Subtítulos palabra a palabra (estilo karaoke/redes): el texto se muestra en
// grupos cortos y la palabra que "se está diciendo" se destaca. Grupos de 2-4
// palabras se leen de un vistazo con el sonido apagado (como se consume en redes).
// Formato 9:16 genera un escenario vertical real (1080x1920) para Reels/TikTok/Shorts.
import { el, layer, stageSize, tone } from '../core/kit.js';

export default {
  id: 'subtitulos-karaoke',
  poster: 0.35,
  size: (p) => stageSize(p.formato),
  build(stage, p, { gsap }) {
    const { w, h } = stageSize(p.formato);
    const vert = h > w;
    // Fondo que simula el plano de video (persona a cámara, desenfocada).
    layer(stage, { background: 'linear-gradient(160deg, var(--s-bg-2) 0%, var(--s-bg) 80%)' });
    const fig = el('div', { position: 'absolute', left: `${w / 2 - 260}px`, top: `${h * 0.18}px`, width: '520px', height: `${h}px`, filter: 'blur(18px)', opacity: '0.55' }, stage);
    el('div', { position: 'absolute', left: '150px', top: '0', width: '220px', height: '260px', borderRadius: '50%', background: 'var(--s-muted)' }, fig);
    el('div', { position: 'absolute', left: '0', top: '280px', width: '520px', height: '700px', borderRadius: '260px 260px 0 0', background: 'var(--s-muted)' }, fig);

    const words = String(p.texto || ' ').split(/\s+/).filter(Boolean);
    const per = Math.round(p.palabrasPorPantalla);
    const tw = 1 / p.velocidad;
    const fs = vert ? 92 : 80;
    const margin = vert ? 80 : 260;
    const color = tone(p.color);
    const groups = [];
    for (let i = 0; i < words.length; i += per) groups.push(words.slice(i, i + per));
    const t0 = 0.4;
    const tl = gsap.timeline({ paused: true });

    groups.forEach((g, gi) => {
      const box = el('div', { position: 'absolute', left: `${margin}px`, right: `${margin}px`, top: `${h * p.posicion}px`, transform: 'translateY(-50%)', textAlign: 'center',
        fontFamily: 'var(--s-font)', fontWeight: '900', fontSize: `${fs}px`, lineHeight: '1.25', color: '#fff', textTransform: p.mayusculas === 'si' ? 'uppercase' : 'none', letterSpacing: '-0.01em' }, stage);
      const spans = g.map((wd) => el('span', { display: 'inline-block', padding: '0.02em 0.22em', margin: '0 0.04em', borderRadius: '0.22em',
        textShadow: '0 4px 20px rgba(0,0,0,0.55), 0 0 2px rgba(0,0,0,0.8)' }, box, wd));
      const gStart = t0 + gi * per * tw;
      const gEnd = t0 + (gi + 1) * per * tw;
      tl.set(box, { autoAlpha: 0 }, 0);
      tl.set(box, { autoAlpha: 1 }, gStart);
      if (gi < groups.length - 1) tl.set(box, { autoAlpha: 0 }, gEnd);
      tl.fromTo(box, { scale: 0.92 }, { scale: 1, duration: 0.18, ease: 'back.out(2)', immediateRender: false }, gStart);
      spans.forEach((s, si) => {
        const at = gStart + si * tw;
        if (p.estilo === 'pildora') {
          tl.set(s, { background: color, color: 'var(--s-bg)', textShadow: 'none' }, at);
          tl.set(s, { background: 'transparent', color: '#fff', textShadow: '0 4px 20px rgba(0,0,0,0.55), 0 0 2px rgba(0,0,0,0.8)' }, at + tw);
        } else {
          tl.set(s, { color }, at);
          if (p.estilo === 'rebote') tl.fromTo(s, { scale: 1.25 }, { scale: 1, duration: Math.min(0.25, tw), ease: 'back.out(3)', immediateRender: false }, at);
        }
      });
    });
    tl.to({}, { duration: 0.8 }, t0 + words.length * tw);
    return tl;
  },
};
