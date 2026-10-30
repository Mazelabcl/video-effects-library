// Corte por forma (match cut): la luna de la escena A y la naranja de la
// escena B ocupan exactamente el mismo lugar y tamaño en pantalla.
// Clave del efecto: el empuje de cámara CONTINÚA después del corte, así el ojo
// no percibe salto de movimiento, solo cambio de significado.
import { el, layer, rng, DISPLAY, SERIF, MONO } from '../core/kit.js';

export default {
  id: 'match-cut-forma',
  poster: 0.6,
  build(stage, p, { gsap }) {
    const D = p.duracionEscena;
    const e = p.empuje;
    const cx = 1240, cy = 450, size = 340;
    const radius = p.forma === 'circulo' ? '50%' : 'var(--s-radius)';
    const origin = `${cx}px ${cy}px`;

    // ---- Escena A: noche, insomnio ----
    const A = layer(stage, { background: 'radial-gradient(ellipse at 65% 40%, #1b2340 0%, var(--s-bg) 70%)', transformOrigin: origin });
    const r = rng(9);
    for (let i = 0; i < 90; i++) {
      const s = r() * 3 + 1;
      el('div', { position: 'absolute', left: `${r() * 1920}px`, top: `${r() * 1080}px`, width: `${s}px`, height: `${s}px`, borderRadius: '50%', background: 'var(--s-ink)', opacity: String(0.2 + r() * 0.6) }, A);
    }
    el('div', {
      position: 'absolute', left: `${cx - size / 2}px`, top: `${cy - size / 2}px`, width: `${size}px`, height: `${size}px`, borderRadius: radius,
      background: 'radial-gradient(circle at 38% 35%, #fffaf0 0%, #e9e2d3 55%, #b9b2a4 100%)',
      boxShadow: '0 0 120px 20px rgba(255,250,235,0.18)',
    }, A);
    const aText = el('div', { position: 'absolute', left: '150px', top: '640px', width: '760px', zIndex: '2' }, stage); // fuera de la cámara: no se recorta con el empuje
    el('div', { ...MONO, color: 'var(--s-muted)', marginBottom: '22px' }, aText, '03:12 · Insomnio');
    el('div', { ...SERIF, fontSize: '92px', lineHeight: '1.02', color: 'var(--s-ink)' }, aText, 'No podía dormir pensando en eso.');

    // ---- Escena B: mañana, la idea ----
    const B = layer(stage, { background: 'linear-gradient(180deg, #f6efe2 0%, #efe3cc 100%)', transformOrigin: origin });
    el('div', { position: 'absolute', left: '0', right: '0', top: '640px', height: '440px', background: '#e3d3b6' }, B);
    el('div', {
      position: 'absolute', left: `${cx - size / 2}px`, top: `${cy - size / 2}px`, width: `${size}px`, height: `${size}px`, borderRadius: radius,
      background: 'radial-gradient(circle at 36% 32%, #ffc46b 0%, var(--s-accent2) 55%, #c2421f 100%)',
      boxShadow: '30px 40px 0 -10px rgba(120,70,20,0.18)',
    }, B);
    el('div', { position: 'absolute', left: `${cx - 10}px`, top: `${cy - size / 2 - 38}px`, width: '20px', height: '50px', background: '#4a6b2a', borderRadius: '10px', transform: 'rotate(18deg)' }, B);
    const bText = el('div', { position: 'absolute', left: '150px', top: '660px', width: '820px', color: '#1d1a16', zIndex: '2' }, stage);
    el('div', { ...MONO, color: '#8a7a5e', marginBottom: '22px' }, bText, '08:30 · Desayuno');
    el('div', { ...DISPLAY, fontSize: '104px' }, bText, 'La idea llegó con el desayuno.');

    const tl = gsap.timeline({ paused: true });
    tl.set(B, { autoAlpha: 0 }, 0);
    // Empuje continuo A -> B (misma velocidad aparente a ambos lados del corte).
    tl.fromTo(A, { scale: 1 }, { scale: 1 + e, duration: D, ease: p.ease }, 0);
    tl.fromTo(aText, { autoAlpha: 0, y: 30 }, { autoAlpha: 1, y: 0, duration: 0.7, ease: 'power3.out' }, 0.25);
    // EL CORTE: seco, sin transición. La forma compartida hace el trabajo.
    tl.set([A, aText], { autoAlpha: 0 }, D);
    tl.set(B, { autoAlpha: 1 }, D);
    tl.fromTo(B, { scale: 1 + e }, { scale: 1 + e * 1.5, duration: D, ease: 'sine.out' }, D);
    tl.fromTo(bText, { autoAlpha: 0, y: 30 }, { autoAlpha: 1, y: 0, duration: 0.7, ease: 'power3.out' }, D + 0.35);
    tl.to({}, { duration: 0.4 });
    return tl;
  },
};
