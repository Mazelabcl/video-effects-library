# Historia de video-effects-library

**Qué es:** biblioteca interna de 51 efectos de video con intención (transiciones, tipografía cinética, cámara, etc.). Cada efecto se ve en una galería web con sliders y se renderiza a MP4 con HyperFrames. Incluye `effects-index.json`, la versión para agentes. (fuente: README y package.json)
**Para quién:** uso interno de Mazelab (?) — no hay cliente asociado en el material.
**Hecho con:** GSAP, Node.js, Playwright y HyperFrames. No hay conversaciones registradas de Codex ni de Claude Code en esta carpeta.

## Línea de tiempo
| Fecha | Versión | Qué cambió | Fuente |
|---|---|---|---|
| 2026-10-30 | 0.1.0 | Primera versión: 20 efectos GSAP deterministas, índice para agentes, exportador a HyperFrames y borrador de la skill video-director | commit `7b39737` |
| 2026-11-02 | 0.1.0 | 31 efectos nuevos (51 en total), formato vertical y color de marca | commit `abd8f51` |
| 2026-11-02 | 0.1.0 | Se ignoran los archivos `.env` | commit `52a5956` |

## Quién depende de esta carpeta
- La skill `video-director` del starter `yt-venture-starter-final` lee `C:\Users\aldot\.gemini\antigravity\scratch\video-effects-library\effects-index.json` por ruta absoluta; si no lo encuentra, se detiene. (fuente: `.claude/skills/video-director/SKILL.md` de ese proyecto)
- `brazos/directorio.json` de `yt-venture-starter-final` y de `Bot-Growth` nombran la biblioteca como un "brazo" (?).
- Por eso la carpeta no se movió ni se le borraron las librerías al archivarla.

## Conviene saberlo si se retoma
- La carpeta debe seguir en la misma ruta absoluta, o hay que actualizar la skill `video-director`.
- Los renders (`renders/`) no van a git (están en `.gitignore`); la copia está en Drive y `retomar.ps1` los trae.
- El README dice que aún no se publicaba en Vercel; el repo privado en GitHub ya existía (primer commit 2026-10-30, último push 2026-11-02).

## De dónde salió esta historia
3 commits, README, package.json y las skills de otros proyectos. Lo marcado con (?) es una deducción.
