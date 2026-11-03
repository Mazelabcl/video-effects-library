// Logo dibujado a trazo: el contorno del isotipo se dibuja como con un lápiz
// (stroke-dashoffset), luego el relleno aparece dentro y el nombre de marca se
// destapa de izquierda a derecha. Orden: forma → masa → nombre. Comunica
// "hecho a mano, con oficio". El largo real del trazo se mide con getTotalLength.
import { el, svg, layer, DISPLAY, SERIF, tone } from '../core/kit.js';

function formaPath(forma, cx, cy, r) {
  if (forma === 'circulo') return `M${cx} ${cy - r} A${r} ${r} 0 1 1 ${cx - 0.01} ${cy - r} Z`;
  const n = forma === 'rombo' ? 4 : 6;
  const pts = Array.from({ length: n }, (_, i) => { const a = (i / n) * Math.PI * 2 - Math.PI / 2; return `${(cx + Math.cos(a) * r).toFixed(1)} ${(cy + Math.sin(a) * r).toFixed(1)}`; });
  return `M${pts.join(' L')} Z`;
}

export default {
  id: 'logo-trazo',
  poster: 0.9,
  build(stage, p, { gsap }) {
    layer(stage, { background: 'var(--s-bg)' });
    const color = tone(p.color);
    const cx = 960, cy = 420, r = 170;
    const s = svg('svg', { width: '1920', height: '1080', viewBox: '0 0 1920 1080', style: 'position:absolute;inset:0' }, stage);
    const fill = svg('path', { d: formaPath(p.forma, cx, cy, r), fill: color, opacity: '0' }, s);
    const outline = svg('path', { d: formaPath(p.forma, cx, cy, r), fill: 'none', stroke: color, 'stroke-width': String(p.grosor), 'stroke-linejoin': 'round', 'stroke-linecap': 'round' }, s);
    const L = outline.getTotalLength();
    outline.setAttribute('stroke-dasharray', `${L} ${L}`);
    const initials = String(p.marca || ' ').trim().slice(0, 2).toUpperCase();
    const ini = el('div', { ...DISPLAY, position: 'absolute', left: `${cx - r}px`, width: `${r * 2}px`, top: `${cy - 75}px`, textAlign: 'center', fontSize: '150px', lineHeight: '150px', color: 'var(--s-bg)', textTransform: 'uppercase' }, stage, initials);
    const wordWin = el('div', { position: 'absolute', left: '0', right: '0', top: `${cy + r + 70}px`, textAlign: 'center' }, stage);
    const word = el('div', { ...DISPLAY, display: 'inline-block', fontSize: '120px', color: 'var(--s-ink)', letterSpacing: '0.08em', textTransform: 'uppercase' }, wordWin, p.marca || '');
    const lema = el('div', { ...SERIF, position: 'absolute', left: '0', right: '0', top: `${cy + r + 220}px`, textAlign: 'center', fontSize: '52px', color: 'var(--s-muted)' }, stage, p.lema || '');

    const t0 = 0.3, d = p.duracion;
    const tl = gsap.timeline({ paused: true });
    tl.fromTo(outline, { attr: { 'stroke-dashoffset': L } }, { attr: { 'stroke-dashoffset': 0 }, duration: d, ease: p.ease }, t0);
    tl.fromTo(fill, { opacity: 0, scale: 0.85, svgOrigin: `${cx} ${cy}` }, { opacity: 1, scale: 1, duration: 0.6, ease: 'power3.out' }, t0 + d - 0.1);
    tl.fromTo(ini, { autoAlpha: 0, y: 16 }, { autoAlpha: 1, y: 0, duration: 0.5, ease: 'power3.out' }, t0 + d + 0.2);
    tl.fromTo(word, { clipPath: 'inset(0% 100% 0% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 0.8, ease: 'power3.inOut' }, t0 + d + 0.35);
    tl.fromTo(lema, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.7, ease: 'sine.out' }, t0 + d + 1.0);
    tl.to({}, { duration: 1.6 });
    return tl;
  },
};
