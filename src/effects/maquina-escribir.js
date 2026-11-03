// Máquina de escribir: el texto aparece carácter a carácter a ritmo constante,
// con una pausa extra tras la puntuación (como habla una persona). El cursor
// queda fijo mientras escribe y solo parpadea al terminar. Los tiempos de cada
// carácter se precalculan: el texto visible es función pura del tiempo.
import { el, layer, DISPLAY, MONO, tone } from '../core/kit.js';

export default {
  id: 'maquina-escribir',
  poster: 0.8,
  build(stage, p, { gsap }) {
    const text = String(p.texto || ' ');
    layer(stage, { background: 'var(--s-bg)' });
    el('div', { ...MONO, position: 'absolute', left: '160px', top: '300px', color: 'var(--s-muted)' }, stage, 'Briefing · 01');
    const box = el('div', { ...DISPLAY, position: 'absolute', left: '150px', top: '350px', width: '1620px', fontSize: `${p.tamano}px`, lineHeight: '1.05', color: 'var(--s-ink)', whiteSpace: 'pre-wrap' }, stage);
    const typed = el('span', {}, box);
    const caret = el('span', { display: 'inline-block', verticalAlign: 'baseline', marginLeft: '0.04em', background: tone(p.color),
      width: p.cursor === 'linea' ? '0.08em' : '0.55em', height: '0.9em', transform: 'translateY(0.1em)' }, box);
    if (p.cursor === 'ninguno') caret.style.display = 'none';

    // Instante en que aparece cada carácter.
    const times = [];
    let t = 0;
    for (const ch of text) {
      times.push(t);
      t += 1 / p.velocidad + (/[.,;:!?…]/.test(ch) ? p.pausaPuntuacion : 0);
    }
    const total = t;
    const chars = [...text];
    const st = { t: 0 };
    const render = () => {
      let n = 0;
      while (n < times.length && times[n] <= st.t) n++;
      typed.textContent = chars.slice(0, n).join('');
    };

    const t0 = 0.4;
    const tl = gsap.timeline({ paused: true });
    tl.fromTo(st, { t: 0 }, { t: total, duration: total, ease: 'none', onUpdate: render }, t0);
    // Parpadeo solo en reposo (al escribir el cursor se ve fijo, como en un editor).
    const blink = 0.5;
    tl.fromTo(caret, { opacity: 1 }, { opacity: 0, duration: blink, ease: 'steps(1)', repeat: 4, yoyo: true, immediateRender: false }, t0 + total + 0.2);
    tl.to({}, { duration: 0.4 });
    render();
    return tl;
  },
};
