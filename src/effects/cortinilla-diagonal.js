// Cortinilla de bandas diagonales: N bandas de la paleta cruzan la pantalla
// escalonadas, tapan la escena A y al seguir su camino destapan la B.
// El contenedor rotado se dimensiona para cubrir toda la pantalla a cualquier ángulo.
import { el, layer, splitText, DISPLAY, MONO } from '../core/kit.js';

export default {
  id: 'cortinilla-diagonal',
  poster: 0.5,
  build(stage, p, { gsap }) {
    const n = Math.round(p.bandas);
    const a = (p.angulo * Math.PI) / 180;
    const cw = 1920 * Math.abs(Math.cos(a)) + 1080 * Math.abs(Math.sin(a)) + 40;
    const ch = 1920 * Math.abs(Math.sin(a)) + 1080 * Math.abs(Math.cos(a)) + 40;

    const chapter = (parent, num, title, bg, ink) => {
      const s = layer(parent, { background: bg, color: ink });
      el('div', { ...MONO, position: 'absolute', left: '140px', top: '380px', opacity: '0.7' }, s, `Capítulo ${num}`);
      const t = el('div', { ...DISPLAY, position: 'absolute', left: '130px', top: '430px', fontSize: '190px', width: '1600px' }, s);
      el('div', { position: 'absolute', right: '140px', bottom: '120px', width: '180px', height: '180px', border: `14px solid ${ink}`, borderRadius: num === '01' ? '50%' : 'var(--s-radius)', opacity: '0.25' }, s);
      return { s, letters: splitText(t, title, 'palabra') };
    };
    const A = chapter(stage, '01', 'El contexto', 'var(--s-bg)', 'var(--s-ink)');
    const B = chapter(stage, '02', 'El problema', 'var(--s-ink)', 'var(--s-bg)');

    const box = el('div', {
      position: 'absolute', left: `${(1920 - cw) / 2}px`, top: `${(1080 - ch) / 2}px`, width: `${cw}px`, height: `${ch}px`,
      transform: `rotate(${p.angulo}deg)`, pointerEvents: 'none',
    }, stage);
    const colors = ['var(--s-accent)', 'var(--s-accent2)', 'var(--s-accent3)', 'var(--s-muted)'];
    const bands = Array.from({ length: n }, (_, i) => el('div', {
      position: 'absolute', left: '0', top: `${(i * ch) / n}px`, width: '100%', height: `${ch / n + 2}px`, background: colors[i % colors.length],
    }, box));

    const hold = 0.9;
    const coverEnd = hold + p.duracion + p.escalonado * (n - 1);
    const tl = gsap.timeline({ paused: true });
    tl.set(B.s, { autoAlpha: 0 }, 0);
    tl.fromTo(A.letters, { yPercent: 105 }, { yPercent: 0, duration: 0.7, stagger: 0.06, ease: 'power3.out' }, 0.05);
    tl.fromTo(bands, { xPercent: -101 }, { xPercent: 0, duration: p.duracion, stagger: p.escalonado, ease: p.ease }, hold);
    tl.set(A.s, { autoAlpha: 0 }, coverEnd);
    tl.set(B.s, { autoAlpha: 1 }, coverEnd);
    tl.fromTo(bands, { xPercent: 0 }, { xPercent: 101, duration: p.duracion, stagger: p.escalonado, ease: p.ease, immediateRender: false }, coverEnd + 0.05);
    tl.fromTo(B.letters, { yPercent: 105 }, { yPercent: 0, duration: 0.7, stagger: 0.06, ease: 'power3.out', immediateRender: false }, coverEnd + p.duracion * 0.45);
    tl.to({}, { duration: 1.0 });
    return tl;
  },
};
