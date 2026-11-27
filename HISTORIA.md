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
**La carpeta no debe moverse, renombrarse ni aligerarse (borrar `node_modules` u otros archivos) mientras la skill `video-director` del starter la lea por ruta absoluta.**

Lugares que la referencian (ruta base `C:\Users\aldot\.gemini\antigravity\scratch\`):
1. `Mazelab-dev\Side-projects\yt-venture-Starter-Final\yt-venture-starter-final`: su skill `video-director` lee `video-effects-library\effects-index.json` por ruta absoluta y se detiene si no lo encuentra. También la nombran `brazos\directorio.json` y `memory\plan-de-batalla*.json`.
2. `Mazelab-dev\Side-projects\Bot-Growth`: copia de la skill y `brazos\directorio.json`.
3. `danza-4-you-platform`: copia de la skill y `brazos\directorio.json`.
4. `Mazelab-dev\Experimentos\Plug\plug-lab\.sites-local\bold-upstream`: copia del starter.
5. `Mazelab-dev\Experimentos\Weddi\weddi-app\outputs\starter-bold-reference`: copia del starter.
6. `Mazelab-dev\Fotos-con-ia-3-lab\.tools\bold-ref`: copia del starter.

Además, `Mazelab-dev\Audit-Games\inventario\zona-c.json` la menciona, pero solo como inventario. La búsqueda se cortó en 30 resultados, así que puede haber más. (fuente: búsqueda de texto del 2026-11-27)

## Conviene saberlo si se retoma
- La carpeta debe seguir en la misma ruta absoluta, o hay que actualizar la skill `video-director`.
- Los renders (`renders/`) no van a git (están en `.gitignore`); la copia está en Drive y `retomar.ps1` los trae.
- El README dice que aún no se publicaba en Vercel; el repo privado en GitHub ya existía (primer commit 2026-10-30, último push 2026-11-02).

## De dónde salió esta historia
3 commits, README, package.json y las skills de otros proyectos. Lo marcado con (?) es una deducción.
