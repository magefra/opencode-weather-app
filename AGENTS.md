# AGENTS.md

## Resumen

Weather CLI: aplicación de consola en TypeScript sobre **Bun** que consulta la API de
Open-Meteo (geocoding + clima actual + pronóstico a 7 días). El objetivo del proyecto es
generar un binario ejecutable. La interfaz y los mensajes están en español.

## Comandos

- `bun run start` — ejecuta la app (`src/index.ts`).
- `bun run dev` — ejecuta con `--watch`.
- `bun run typecheck` — comprueba tipos con `bunx tsc --noEmit`.
- `bun run test` — ejecuta los tests de `test/` con `bun test --isolate` (sin red ni HOME real).
- `bun run test:watch` — ejecuta los tests en modo watch.
- `bun run check` — typecheck + tests.
- `bun run build` — ejecuta `verify` (typecheck + tests) y solo si pasa compila el binario `weather-cli`.

No hay framework de tests ni toolchain adicional: se usa `bun:test` (Bun + `typescript`/`@types/bun` únicamente).

## Estructura del código

La fuente vive en `src/` y su estructura está definida en `references/file-system.md`:

- `src/index.ts` — punto de entrada: carga la configuración, lanza el menú y cierra la entrada.
- `src/actions/` — acciones del usuario (clima, pronóstico, agregar/eliminar ciudad, default, unidad).
- `src/presentation/` — menú, salida por consola y captura/validación de inputs.
- `src/storage/` — persistencia en `~/.weather-cli/config.json`.
- `src/types/` — tipos globales (`City`, `Weather`, `Settings`, `MenuOption`).
- `src/api/` — integración con geocoding y forecast de Open-Meteo.
- `src/utils/` — constantes, colores y formateadores.
- `test/` — tests automáticos con `bun:test`, espejo de `src/`; `test/helpers/` tiene fixtures y
  utilidades para HOME temporal. Cada archivo se aísla con `--isolate` porque `mock.module`
  de Bun es global al proceso.

Dependencias: `types` → nadie; `utils` → `types`; `api`/`storage` → `utils`/`types`;
 `actions` → `api`/`storage`/`presentation`; `presentation/menu` → `actions`.

## Convenciones

- Los identificadores del código van en inglés; los mensajes al usuario van en español.
- Las claves guardadas en `config.json` (`ciudades`, `ciudadDefault`, `unidad`, `nombre`,
  `pais`, `latitud`, `longitud`) se mantienen en español por compatibilidad con la
  configuración ya existente.
- Los imports se hacen sin extensión (resolución `bundler` de `tsconfig.json`).
- La validación y la E/S de `config.json` viven solo en `src/storage/configFile.ts`.

## Archivos sueltos en la raíz

- `index.html` y `weather-cli.exe` son restos de versiones anteriores; no forman parte de la app actual.
- `ideas-revision.md` registra pendientes del proyecto.
- `references/file-system.md` es la referencia de la estructura deseada.
