// Llamada a la acción (CTA): titular, botón y dirección web. Un cursor viaja al
// botón y lo "presiona" (hundimiento + onda): enseña al espectador QUÉ hacer, no
// solo lo dice. Luego el botón late unas pocas veces y todo queda quieto, con la
// dirección legible hasta el final (la quietud antes del cierre es parte del CTA).
import { el, svg, layer, splitText, stageSize, DISPLAY, MONO, tone } from '../core/kit.js';

export default {
  id: 'llamada-accion',
  poster: 0.8,
  size: (p) => stageSize(p.formato),
  build(stage, p, { gsap }) {
    const { w, h } = stageSize(p.formato);
    const vert = h > w;
    const color = tone(p.color);
    layer(stage, { background: 'radial-gradient(ellipse at 50% 60%, var(--s-bg-2) 0%, var(--s-bg) 70%)' });
    const cy = h / 2;
    const title = el('div', { ...DISPLAY, position: 'absolute', left: `${vert ? 70 : 160}px`, right: `${vert ? 70 : 160}px`, top: `${cy - (vert ? 420 : 300)}px`, textAlign: 'center', fontSize: `${vert ? 120 : 130}px`, color: 'var(--s-ink)' }, stage);
    const words = splitText(title, p.titular || ' ', 'palabra');
    const btnWrap = el('div', { position: 'absolute', left: '0', right: '0', top: `${cy + (vert ? 40 : 10)}px`, display: 'flex', justifyContent: 'center' }, stage);
    const btn = el('div', { position: 'relative', padding: `${vert ? 40 : 34}px ${vert ? 80 : 70}px`, borderRadius: '999px', background: color, color: 'var(--s-bg)',
      fontFamily: 'var(--s-font)', fontWeight: '800', fontSize: `${vert ? 64 : 56}px`, whiteSpace: 'nowrap', boxShadow: '0 20px 60px rgba(0,0,0,0.35)' }, btnWrap, p.boton || '');
    // Anillo de pulso (fuera del botón) y onda del clic (recortada a la forma del botón).
    const pulse = el('div', { position: 'absolute', inset: '0', borderRadius: '999px', border: `6px solid ${color}`, pointerEvents: 'none' }, btn);
    const rippleClip = el('div', { position: 'absolute', inset: '0', borderRadius: '999px', overflow: 'hidden', pointerEvents: 'none' }, btn);
    const ripple = el('div', { position: 'absolute', left: '50%', top: '50%', width: '40px', height: '40px', margin: '-20px 0 0 -20px', borderRadius: '50%', background: 'rgba(255,255,255,0.55)' }, rippleClip);
    const sub = el('div', { ...MONO, position: 'absolute', left: '0', right: '0', top: `${cy + (vert ? 260 : 200)}px`, textAlign: 'center', color: 'var(--s-muted)', fontSize: `${vert ? 34 : 30}px` }, stage, p.subtexto || '');
    const cur = svg('svg', { width: '64', height: '64', viewBox: '0 0 24 24', style: 'position:absolute;left:0;top:0;overflow:visible' }, stage);
    svg('path', { d: 'M3 2 L3 19 L8 14.5 L11.5 22 L14.5 20.7 L11 13.3 L17.5 13.3 Z', fill: '#fff', stroke: '#000', 'stroke-width': '1.4', 'stroke-linejoin': 'round' }, cur);

    const d = p.duracion;
    const tl = gsap.timeline({ paused: true });
    tl.fromTo(words, { yPercent: 105 }, { yPercent: 0, duration: d, stagger: 0.07, ease: 'power3.out' }, 0.2);
    const tBtn = 0.2 + d * 0.6 + words.length * 0.07;
    tl.fromTo(btn, { scale: 0, autoAlpha: 0 }, { scale: 1, autoAlpha: 1, duration: d, ease: p.ease }, tBtn);
    tl.fromTo(sub, { autoAlpha: 0, y: 12 }, { autoAlpha: 1, y: 0, duration: 0.5, ease: 'power2.out' }, tBtn + d * 0.6);
    tl.set(pulse, { autoAlpha: 0 }, 0);
    tl.set(ripple, { autoAlpha: 0 }, 0);
    let tEnd = tBtn + d + 0.3;
    if (p.cursor === 'si') {
      // Destino: un poco a la derecha del centro del botón, medido tras el layout
      // (offsets en coordenadas del escenario: no los afecta la escala de la galería).
      const bx = btn.offsetLeft + btn.offsetWidth * 0.6, by = btnWrap.offsetTop + btn.offsetTop + btn.offsetHeight * 0.55;
      tl.fromTo(cur, { x: w * 0.85, y: h * 0.95, autoAlpha: 0 }, { x: bx, y: by, autoAlpha: 1, duration: 0.9, ease: 'power2.inOut' }, tEnd);
      const tClick = tEnd + 0.95;
      tl.fromTo(cur, { scale: 1 }, { scale: 0.85, duration: 0.08, yoyo: true, repeat: 1, ease: 'power1.inOut', immediateRender: false, transformOrigin: '5% 5%' }, tClick);
      tl.fromTo(btn, { scale: 1 }, { scale: 0.94, duration: 0.08, yoyo: true, repeat: 1, ease: 'power1.inOut', immediateRender: false }, tClick);
      tl.fromTo(ripple, { scale: 0, autoAlpha: 0.9 }, { scale: 18, autoAlpha: 0, duration: 0.6, ease: 'power2.out', immediateRender: false }, tClick);
      tl.to(cur, { autoAlpha: 0, duration: 0.3 }, tClick + 0.5);
      tEnd = tClick + 0.5;
    } else tl.set(cur, { autoAlpha: 0 }, 0);
    for (let i = 0; i < Math.round(p.pulsos); i++) {
      tl.fromTo(pulse, { scale: 1, autoAlpha: 0.8 }, { scale: 1.35, autoAlpha: 0, duration: 0.9, ease: 'power2.out', immediateRender: false }, tEnd + 0.2 + i * 1.0);
    }
    tl.to({}, { duration: 1.5 });
    return tl;
  },
};
