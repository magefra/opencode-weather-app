import { mkdir } from "node:fs/promises";
import { homedir } from "node:os";
import { dirname, join } from "node:path";
import type { City } from "../types/City";
import type { AppConfig, Unit } from "../types/Settings";

/** Se calcula en cada llamada para poder aislar el directorio en los tests. */
function configPath(): string {
  return join(homedir(), ".weather-cli", "config.json");
}

function initialConfig(): AppConfig {
  return { ciudades: [], ciudadDefault: null, unidad: "C" };
}

function isCity(value: unknown): boolean {
  if (typeof value !== "object" || value === null) return false;
  const city = value as Record<string, unknown>;
  return (
    typeof city.id === "number" &&
    typeof city.nombre === "string" &&
    typeof city.pais === "string" &&
    typeof city.latitud === "number" &&
    typeof city.longitud === "number"
  );
}

function isConfig(value: unknown): value is AppConfig {
  if (typeof value !== "object" || value === null) return false;
  const config = value as Record<string, unknown>;
  const unit: Unit | undefined =
    config.unidad === "C" || config.unidad === "F" ? config.unidad : undefined;

  return (
    Array.isArray(config.ciudades) &&
    config.ciudades.every(isCity) &&
    (config.ciudadDefault === null || typeof config.ciudadDefault === "number") &&
    unit !== undefined
  );
}

export async function loadConfig(): Promise<AppConfig> {
  const file = Bun.file(configPath());
  if (!(await file.exists())) return initialConfig();

  try {
    const data: unknown = await file.json();
    if (!isConfig(data)) return initialConfig();

    const defaultExists =
      data.ciudadDefault !== null &&
      data.ciudades.some((city: City) => city.id === data.ciudadDefault);

    return {
      ciudades: data.ciudades,
      ciudadDefault: defaultExists ? data.ciudadDefault : null,
      unidad: data.unidad,
    };
  } catch {
    return initialConfig();
  }
}

export async function saveConfig(config: AppConfig): Promise<void> {
  const file = configPath();
  await mkdir(dirname(file), { recursive: true });
  await Bun.write(file, `${JSON.stringify(config, null, 2)}\n`);
}

export function getConfigPath(): string {
  return configPath();
}
