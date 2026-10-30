// Revelado por máscara (iris): la escena B se abre desde un punto que el
// espectador YA estaba mirando (el indicador "Nuevo"), no desde el centro por
// defecto. Un anillo de acento acompaña el borde de la máscara.
import { el, layer, DISPLAY, SERIF, MONO } from '../core/kit.js';

export default {
  id: 'revelado-iris',
  poster: 0.55,
  build(stage, p, { gsap }) {
    const ox = (p.origenX / 100) * 1920, oy = (p.origenY / 100) * 1080;
    // Escena A: una interfaz tranquila con un punto de interés.
    const A = layer(stage, { background: 'var(--s-bg)' });
    for (let i = 0; i < 6; i++) el('div', { position: 'absolute', left: `${140 + (i % 3) * 560}px`, top: `${190 + Math.floor(i / 3) * 380}px`, width: '500px', height: '320px', borderRadius: 'var(--s-radius)', background: 'var(--s-bg-2)', opacity: '0.9' }, A);
    el('div', { ...MONO, position: 'absolute', left: '140px', top: '110px', color: 'var(--s-muted)' }, A, 'Catálogo');
    const marker = el('div', { position: 'absolute', left: `${ox - 60}px`, top: `${oy - 60}px`, width: '120px', height: '120px', borderRadius: '50%', background: 'var(--s-accent)', display: 'grid', placeItems: 'center' }, A);
    el('div', { width: '0', height: '0', borderLeft: '38px solid var(--s-bg)', borderTop: '24px solid transparent', borderBottom: '24px solid transparent', marginLeft: '10px' }, marker);
    const badge = el('div', { ...MONO, position: 'absolute', left: `${ox + 76}px`, top: `${oy - 18}px`, fontSize: '22px', color: 'var(--s-accent)' }, A, 'Nuevo');

    // Escena B: lo que se abre.
    const B = layer(stage, { background: 'linear-gradient(135deg, var(--s-accent) 0%, var(--s-accent2) 100%)', color: 'var(--s-bg)' });
    el('div', { position: 'absolute', right: '-160px', top: '-160px', width: '900px', height: '900px', borderRadius: '50%', border: '70px solid currentColor', opacity: '0.12' }, B);
    el('div', { position: 'absolute', left: '-120px', bottom: '-240px', width: '700px', height: '700px', background: 'currentColor', opacity: '0.08', transform: 'rotate(18deg)' }, B);
    const bTitle = el('div', { position: 'absolute', left: '150px', top: '340px' }, B);
    el('div', { ...MONO, marginBottom: '20px' }, bTitle, 'Estreno');
    el('div', { ...DISPLAY, fontSize: '220px' }, bTitle, 'Temporada 2');
    el('div', { ...SERIF, fontSize: '90px', marginTop: '10px' }, bTitle, 'ya disponible.');

    const ring = el('div', { position: 'absolute', left: '0', top: '0', border: `${p.borde}px solid var(--s-ink)`, pointerEvents: 'none', boxSizing: 'border-box' }, stage);
    const maxR = Math.max(...[[0, 0], [1920, 0], [0, 1080], [1920, 1080]].map(([x, y]) => Math.hypot(x - ox, y - oy))) + p.borde + 10;
    const st = { r: 0 };
    const apply = () => {
      const r = st.r;
      if (p.forma === 'circulo') {
        B.style.clipPath = `circle(${r}px at ${ox}px ${oy}px)`;
        Object.assign(ring.style, { left: `${ox - r}px`, top: `${oy - r}px`, width: `${2 * r}px`, height: `${2 * r}px`, borderRadius: '50%', transform: 'none' });
      } else if (p.forma === 'rectangulo') {
        const w = r * 1.4, h = r * 0.8;
        B.style.clipPath = `inset(${oy - h}px ${1920 - ox - w}px ${1080 - oy - h}px ${ox - w}px)`;
        Object.assign(ring.style, { left: `${ox - w}px`, top: `${oy - h}px`, width: `${2 * w}px`, height: `${2 * h}px`, borderRadius: '0', transform: 'none' });
      } else {
        const k = r * 1.42;
        B.style.clipPath = `polygon(${ox}px ${oy - k}px, ${ox + k}px ${oy}px, ${ox}px ${oy + k}px, ${ox - k}px ${oy}px)`;
        Object.assign(ring.style, { left: `${ox - r}px`, top: `${oy - r}px`, width: `${2 * r}px`, height: `${2 * r}px`, borderRadius: '0', transform: 'rotate(45deg)' });
      }
      ring.style.opacity = r > 1 && p.borde > 0 ? String(Math.max(0, 1 - r / maxR)) : '0';
    };
    const endR = p.forma === 'rectangulo' ? maxR / 0.8 : maxR;

    const T = 1.2;
    const tl = gsap.timeline({ paused: true });
    // Anticipación: el punto de interés late dos veces antes de abrirse.
    tl.fromTo(marker, { scale: 1 }, { scale: 1.18, duration: 0.25, yoyo: true, repeat: 3, ease: 'sine.inOut' }, 0.1);
    tl.fromTo(badge, { autoAlpha: 0, x: -10 }, { autoAlpha: 1, x: 0, duration: 0.4 }, 0.1);
    tl.fromTo(st, { r: 0 }, { r: endR, duration: p.duracion, ease: p.ease, onUpdate: apply }, T);
    tl.fromTo(bTitle, { autoAlpha: 0, y: 40 }, { autoAlpha: 1, y: 0, duration: 0.8, ease: 'power3.out' }, T + p.duracion * 0.55);
    tl.to({}, { duration: 1.2 });
    apply();
    return tl;
  },
};
