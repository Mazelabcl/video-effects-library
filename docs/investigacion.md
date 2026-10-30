# Investigación — video dirigido por código (octubre 2026)

Fuentes: Perplexity (sonar-pro / sonar-reasoning-pro vía OpenRouter) + lectura directa de la documentación oficial. Lo marcado como **[verificado]** se confirmó leyendo la fuente primaria; lo marcado **[no verificado]** viene solo de Perplexity.

## 1. Comparación de stacks

| | HyperFrames (HeyGen) | Remotion | OpenMontage | Motion Canvas / Revideo |
|---|---|---|---|---|
| Qué es | HTML + CSS + GSAP → MP4. Chrome sin interfaz "busca" cada fotograma y FFmpeg codifica | React + TypeScript → MP4 | Sistema "agéntico" de producción completa (investigación, guion, assets, montaje) que usa Remotion o HyperFrames por debajo | Grafo de escena en TypeScript (Revideo = variante sin editor, orientada a API) |
| Licencia | Apache 2.0, sin cobro por render ni umbral comercial **[verificado]** | Gratis hasta 3 personas; empresas de 4+ pagan **[verificado]** | AGPLv3 (+ las licencias de los renderers y APIs que use) **[verificado]** | MIT (Motion Canvas); Revideo: revisar repo **[no verificado]** |
| Windows | La CLI y las skills corren en Windows, incluido el render desde PowerShell **[verificado en la FAQ y probado aquí: 2 renders OK]** | Funciona (Node + FFmpeg) **[no verificado aquí]** | Depende del renderer elegido | Funciona con Node + FFmpeg **[no verificado]** |
| Integración con agentes | Plugin oficial para Claude Code (`claude plugin install hyperframes@hyperframes`), skills, MCP hospedado, `llms.txt` **[verificado]** | Agent Skills oficiales (`npx skills add remotion-dev/skills`), docs para Claude Code, `llms.txt`, docs en Markdown **[verificado en docs]** | Muchas skills y pipelines propios | Sin integración oficial con agentes |
| Madurez | Nuevo pero muy activo (v0.8.x, ~75k estrellas en GitHub según su página) | El más maduro del grupo | Experimental, muchas piezas móviles | Maduro (MC) / joven (Revideo) |

### Licencia de Remotion para Mazelab [verificado: remotion.dev/docs/license/faq]
- Gratis para organizaciones de **hasta 3 personas**. Desde **4 personas** se necesita Company License.
- Agencia que entrega **solo el archivo de video** al cliente: cuenta únicamente la dotación de la agencia.
- Si el cliente **opera el proyecto Remotion**: se suman ambas dotaciones.
- Freelancers u otros estudios que ayudan en el mismo proyecto **suman** a la dotación.
- Precios: *Creators* USD 25/mes por persona que escribe código Remotion (incluido con agentes de IA); *Automators* USD 0,01 por render, mínimo USD 100/mes. Quien use el **Remotion Player** embebido cae en *Automators*.
- Conclusión: si Mazelab tiene 3 personas o menos, Remotion es gratis. Si son 4 o más, cuesta desde USD 25/mes por persona que lo programe. **No se pudo verificar la dotación real de Mazelab.**

### Recomendación
**Principal: HyperFrames.** Licencia Apache 2.0 sin condiciones por tamaño de empresa; su modelo (HTML + timeline GSAP pausado y determinista) es el mismo que usa esta biblioteca, así que **cada efecto de la galería se renderiza a MP4 sin reescribirlo** (probado en este equipo con `golpe-tipografico` y `texto-ventana`, ~15-20 s por render). Tiene plugin oficial para Claude Code y corre en Windows.

**Alternativa: Remotion.** Ecosistema más maduro, mejor para videos con datos y plantillas tipadas en React, y Agent Skills oficiales. Elegirla si Mazelab tiene ≤3 personas o si un cliente exige React/Remotion. Costo y conteo de personas a revisar antes de usarla comercialmente.

**OpenMontage**: útil como referencia de flujo "brief → video", pero AGPL y experimental; no se recomienda como base.

## 2. Taxonomía de efectos con intención
La taxonomía completa, efecto por efecto (cuándo usar, emoción, mal uso), vive en `effects-index.json` y en la galería. Principios que la ordenan:

- **Regla de seis de Walter Murch** (montaje): un corte se evalúa por emoción (51 %), historia, ritmo, mirada del espectador, plano 2D y espacio 3D, en ese orden. Por eso el corte seco es el default y toda transición debe justificar su significado.
- **12 principios de Disney** (Thomas y Johnston, *The Illusion of Life*): puesta en escena, anticipación, slow in/slow out (easing), seguimiento y acción superpuesta, acción secundaria, exageración. Base de las familias *easing*, *tipografía* y *partículas*.
- **Material Design 3 — motion**: diferencia entre movimiento funcional (estándar) y expresivo (con sobrepaso); los tokens de easing y duración se fijan por sistema, no por elemento.
- **Gramática de cámara**: push-in = cercanía/tensión; pull-out = contexto/soledad; parallax = profundidad; dolly zoom = vértigo/epifanía (solo una vez); cámara en mano = urgencia.
- **Color** (Bellantoni): cálido = cercanía; frío = distancia; desaturar = recuerdo; contraste alto = tensión.
- **Datos** (Tufte): animar para revelar, nunca para distorsionar (trazado lineal, ejes honestos, contadores sincronizados con la barra).

## 3. Buenas prácticas para video dirigido por un LLM
1. **Pipeline, no un prompt**: brief → plan editorial (beat sheet + lista de planos + mapa de ritmo) → sistema visual y de movimiento → guion de dirección → aprobación → implementación → revisión.
2. **Guion de dirección con decisiones, no adjetivos**: "escala 1,00→1,06 en 18 fotogramas con power3.out" en vez de "dinámico y premium".
3. **Presupuestos**: 1 transición por defecto (corte) + 1 semántica + 1 excepcional; 1 familia de easing; por escena 1 acción principal + 1 secundaria.
4. **Mapa de ritmo con energía, no solo beats**: incluir quietud, respiraciones y una pausa final sin movimiento antes del CTA.
5. **Anti-relleno**: el modelo rellena la incertidumbre con zooms, partículas, glow, sacudidas y rebotes. Prohibirlos salvo que el brief los pida. Prueba final: quitar un tercio de los efectos y ver si mejora.
6. **Revisión**: ver sin sonido (¿se entiende?), escuchar sin imagen (¿el ritmo funciona?), contar tipos de transición y de easing, revisar fotogramas clave renderizados (no solo la vista previa).

## Fuentes
- HyperFrames: https://github.com/heygen-com/hyperframes · https://hyperframes.heygen.com/faq.md · https://hyperframes.heygen.com/reference/html-schema.md · https://hyperframes.heygen.com/concepts/determinism.md · https://hyperframes.heygen.com/developers/cli.md
- Remotion: https://www.remotion.dev/docs/license/faq · https://www.remotion.dev/docs/ai/skills · https://www.remotion.dev/docs/ai/coding-agents
- OpenMontage: https://github.com/calesthio/openmontage · https://www.openmontage.video/
- Motion (motion.so, agente de video con MCP, servicio comercial): https://motion.so/gva **[no verificado]**
- Murch: https://nofilmschool.com/2016/11/6-rules-good-cutting-according-oscar-winning-editor-walter-murch · https://jonnyelwyn.co.uk/film-and-video-editing/the-walter-murch-opedia/
- Disney: https://www.nyfa.edu/student-resources/12-principles-of-animation/
- Material motion: https://m3.material.io/styles/motion/overview/how-it-works
- GSAP (licencia estándar sin costo, uso comercial permitido): https://gsap.com/standard-license
