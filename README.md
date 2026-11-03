# Biblioteca de efectos con intención

Galería web de **51 efectos de video** (transiciones, tipografía cinética, cámara, easing, ritmo, máscaras, partículas, color, pantalla dividida, datos, fondos y ambiente, logos, y redes y formatos). Cada efecto:

- se ve **en vivo** y se ajusta con **sliders** (duración, curva, intensidad, dirección…);
- trae un panel de **intención**: qué siente el espectador, cuándo usarlo, cuándo evitarlo y el mal uso típico;
- es el **mismo código** que se renderiza a MP4 con [HyperFrames](https://github.com/heygen-com/hyperframes) (sin reescribir nada).

Es un recurso único y compartido: no se genera por proyecto. El archivo `effects-index.json` es la versión para agentes (el director de video lo lee para elegir efectos con intención).

## Abrirla en tu computador

Necesitas Node.js 22 o superior (ya lo tienes si usas Claude Code).

1. Abre PowerShell y entra a la carpeta:
   ```powershell
   cd C:\Users\aldot\.gemini\antigravity\scratch\video-effects-library
   ```
   (esto te ubica dentro del proyecto)
2. Arranca el servidor local:
   ```powershell
   npm run dev
   ```
   (esto levanta un mini servidor web; no instala nada y deja la terminal ocupada mientras funciona)
3. Abre en el navegador: http://localhost:4321
   (ahí ves la galería; pasa el cursor sobre una tarjeta para reproducirla y haz clic para ver sliders e intención)
4. Para detenerlo, vuelve a esa terminal y presiona `Ctrl + C`
   (esto apaga el servidor)

> No funciona con doble clic sobre `index.html`: el navegador bloquea la carga de módulos desde archivos locales. Siempre usa el paso 2.

## Renderizar un efecto a video (MP4)

Requiere FFmpeg (ya está instalado en este equipo). La primera vez:

1. En la carpeta del proyecto, instala las herramientas de desarrollo:
   ```powershell
   npm install
   ```
   (esto descarga Playwright, que se usa para medir la duración exacta del efecto)
2. En la galería, abre un efecto, ajusta los sliders y presiona **Copiar parámetros**. Pega eso en un archivo nuevo llamado `params.json` dentro de la carpeta del proyecto.
   (así el video usa exactamente lo que viste)
3. Genera la composición de HyperFrames:
   ```powershell
   node scripts/export-hyperframes.mjs golpe-tipografico params.json --tema=neutral
   ```
   (esto crea `renders/golpe-tipografico/index.html` con el efecto listo para renderizar; cambia `golpe-tipografico` por el id del efecto y `neutral` por `fluo` si quieres el tema negro + fluorescente)
4. Entra a esa carpeta y renderiza:
   ```powershell
   cd renders/golpe-tipografico
   npx hyperframes render --output golpe-tipografico.mp4
   ```
   (esto abre un Chrome invisible, captura cada fotograma y arma el MP4; tarda unos 15-20 segundos)

## Publicarla en internet con Vercel (cuando quieras)

No se ha publicado todavía. Para hacerlo:

1. Crea un repositorio en GitHub y sube esta carpeta:
   ```powershell
   gh repo create video-effects-library --private --source . --push
   ```
   (esto crea el repo en tu cuenta de GitHub y sube el código; `--private` lo deja privado)
2. Entra a https://vercel.com/new e inicia sesión con GitHub.
3. Elige el repo `video-effects-library` y presiona **Import**.
4. No cambies nada: el archivo `vercel.json` ya le dice a Vercel que es un sitio estático (no instala dependencias y solo valida el índice).
5. Presiona **Deploy**. En menos de un minuto tendrás una URL tipo `https://video-effects-library.vercel.app`.
   (desde ahí, cada `git push` actualiza el sitio automáticamente)

Alternativa gratuita: GitHub Pages (Settings → Pages → Deploy from branch → `main` / root). El archivo `.nojekyll` ya está incluido.

## Comandos útiles

| Comando | Qué hace |
|---|---|
| `npm run dev` | Abre la galería en http://localhost:4321 |
| `npm run validate` | Revisa que `effects-index.json` y los archivos de efectos coincidan (ids, rangos, parámetros usados, nada aleatorio sin semilla) |
| `npm run screenshots` | Toma capturas de todos los efectos en `docs/screenshots/` y avisa si hay errores en el navegador |
| `npm run export -- <id> params.json` | Igual al paso 3 de render |

## Cómo está hecho (para quien lo mantenga)

- `index.html` + `src/app.js` + `src/styles.css`: la galería (sin framework, sin build).
- `src/effects/<id>.js`: un archivo por efecto. Exporta `build(stage, params, ctx)` y devuelve un `gsap.timeline({ paused: true })` **determinista** (nada de `Math.random` sin semilla, `Date.now` ni `requestAnimationFrame`). Es exactamente el contrato de HyperFrames.
- `src/core/kit.js`: utilidades compartidas (random con semilla, división de texto, ruido suave, mezcla de colores).
- `effects-index.json`: metadatos y fuente de verdad de los parámetros (la galería dibuja los sliders desde aquí).
- `vendor/gsap.min.js`: GSAP 3.14.2 (licencia estándar gratuita, uso comercial permitido).
- `docs/investigacion.md`: la investigación de stacks, licencias y principios, con fuentes.
- `skill/video-director/SKILL.md`: borrador de la skill que dirige videos usando esta biblioteca.

### Color de marca y formato vertical
- Los parámetros **Color** ofrecen los tokens del tema (`acento`, `acento2`, `acento3`, `tinta`). En un `params.json` también se puede escribir un hex, por ejemplo `"color": "#e4002b"`, para usar el color de marca del cliente.
- Los efectos de la familia **Redes y formatos** tienen el parámetro **Formato** (`16:9` o `9:16`). Con `9:16` el exportador genera una composición vertical real de 1080x1920 (lista para Reels, TikTok o Shorts):
  ```powershell
  node scripts/export-hyperframes.mjs subtitulos-karaoke vertical.json --out=renders/subtitulos-vertical
  ```
  (donde `vertical.json` contiene `{"formato": "9:16"}`; en la galería el escenario vertical se ve centrado con bandas a los lados)

### Agregar un efecto nuevo
1. Crea `src/effects/mi-efecto.js` copiando uno parecido.
2. Agrega su entrada en `effects-index.json` (mismo `id`, parámetros con rangos, intención).
3. Corre `npm run validate` y `npm run screenshots -- mi-efecto`.
