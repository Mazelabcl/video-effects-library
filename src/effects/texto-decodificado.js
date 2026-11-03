// Texto decodificado: cada posición muestra caracteres al azar que cambian
// varias veces por segundo y se "fijan" en orden de lectura. El azar sale de un
// hash (semilla, posición, fotograma lógico): el mismo tiempo da el mismo
// carácter, así el render cuadro a cuadro coincide con la vista previa.
import { el, layer, MONO, hash3, tone } from '../core/kit.js';

const SETS = { simbolos: '#%&$@*+=<>/\\[]{}?!', binario: '01', letras: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789' };

export default {
  id: 'texto-decodificado',
  poster: 0.85,
  build(stage, p, { gsap }) {
    const text = [...String(p.texto || ' ').toUpperCase()];
    const set = SETS[p.caracteres] || SETS.simbolos;
    layer(stage, { background: 'var(--s-bg)' });
    el('div', { ...MONO, position: 'absolute', left: '0', right: '0', top: '360px', textAlign: 'center', color: 'var(--s-muted)' }, stage, 'Acceso concedido');
    const fs = Math.min(150, Math.floor(1700 / (text.length * 0.62)));
    const box = el('div', { position: 'absolute', left: '0', right: '0', top: '420px', textAlign: 'center', fontFamily: '"JetBrains Mono", ui-monospace, monospace', fontWeight: '600', fontSize: `${fs}px`, whiteSpace: 'pre' }, stage);
    const cells = text.map(() => el('span', { display: 'inline-block', width: '0.62em', textAlign: 'center' }, box));

    const n = text.length;
    // Instante (0..1) en que se fija cada carácter: barrido de izquierda a derecha.
    const lockAt = text.map((_, i) => (1 - p.barrido) + p.barrido * (n > 1 ? i / (n - 1) : 1));
    const st = { t: 0 };
    const render = () => {
      const frame = Math.floor(st.t * p.duracion * 18); // ~18 cambios por segundo
      cells.forEach((c, i) => {
        const ch = text[i];
        if (ch === ' ' || st.t >= lockAt[i]) { c.textContent = ch; c.style.color = 'var(--s-ink)'; return; }
        c.textContent = set[Math.floor(hash3(p.semilla, i, frame) * set.length)];
        c.style.color = tone(p.color);
      });
    };
    const tl = gsap.timeline({ paused: true });
    tl.fromTo(box, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.2 }, 0.2);
    tl.fromTo(st, { t: 0 }, { t: 1, duration: p.duracion, ease: 'none', onUpdate: render }, 0.2);
    tl.to({}, { duration: 1.5 });
    render();
    return tl;
  },
};
