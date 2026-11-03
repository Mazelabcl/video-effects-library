// Lista escalonada: los puntos de una lista aparecen de a uno, cada uno con su
// marca (check dibujado, número o punto). El escalonado da tiempo de leer cada
// ítem antes del siguiente; el check se "dibuja" con stroke-dashoffset.
import { el, svg, layer, DISPLAY, MONO, tone } from '../core/kit.js';

export default {
  id: 'lista-escalonada',
  poster: 0.9,
  build(stage, p, { gsap }) {
    const items = String(p.items || ' ').split('\n').map((s) => s.trim()).filter(Boolean).slice(0, 6);
    layer(stage, { background: 'var(--s-bg)' });
    const title = el('div', { ...DISPLAY, position: 'absolute', left: '160px', top: '150px', fontSize: '96px', color: 'var(--s-ink)' }, stage, p.titulo || '');
    const rowH = Math.min(130, 640 / Math.max(1, items.length));
    const rows = items.map((txt, i) => {
      const row = el('div', { position: 'absolute', left: '160px', top: `${330 + i * rowH}px`, display: 'flex', alignItems: 'center', gap: '36px' }, stage);
      const badge = el('div', { width: '72px', height: '72px', flex: '0 0 72px', borderRadius: p.icono === 'punto' ? '50%' : 'calc(var(--s-radius) * 0.5)', display: 'grid', placeItems: 'center',
        background: p.icono === 'check' ? 'transparent' : tone(p.color), border: p.icono === 'check' ? `5px solid ${tone(p.color)}` : 'none', boxSizing: 'border-box' }, row);
      let path = null;
      if (p.icono === 'check') {
        const s = svg('svg', { viewBox: '0 0 40 40', width: '44', height: '44' }, badge);
        path = svg('path', { d: 'M8 21 L17 29 L33 11', fill: 'none', stroke: tone(p.color), 'stroke-width': '5', 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'stroke-dasharray': '42', 'stroke-dashoffset': '42' }, s);
      } else if (p.icono === 'numero') {
        el('div', { ...MONO, fontSize: '30px', color: 'var(--s-bg)', fontWeight: '600' }, badge, String(i + 1).padStart(2, '0'));
      }
      el('div', { ...DISPLAY, fontSize: '64px', color: 'var(--s-ink)', fontWeight: '600', letterSpacing: '-0.02em', textTransform: 'none' }, row, txt);
      return { row, badge, path };
    });

    const tl = gsap.timeline({ paused: true });
    tl.fromTo(title, { autoAlpha: 0, y: 24 }, { autoAlpha: 1, y: 0, duration: 0.6, ease: 'power3.out' }, 0.1);
    rows.forEach(({ row, badge, path }, i) => {
      const at = 0.7 + i * p.escalonado;
      tl.fromTo(row, { autoAlpha: 0, x: -40 }, { autoAlpha: 1, x: 0, duration: p.duracion, ease: p.ease }, at);
      tl.fromTo(badge, { scale: 0.4 }, { scale: 1, duration: p.duracion, ease: 'back.out(2)' }, at);
      if (path) tl.fromTo(path, { attr: { 'stroke-dashoffset': 42 } }, { attr: { 'stroke-dashoffset': 0 }, duration: p.duracion * 0.8, ease: 'power2.out' }, at + p.duracion * 0.4);
    });
    tl.to({}, { duration: 1.6 });
    return tl;
  },
};
