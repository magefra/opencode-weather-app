import { mkdir } from "node:fs/promises";
import { homedir } from "node:os";
import { join } from "node:path";
import type { Configuracion, Unidad } from "./types";

const DIRECTORIO = join(homedir(), ".weather-cli");
const ARCHIVO = join(DIRECTORIO, "config.json");

function configuracionInicial(): Configuracion {
  return { ciudades: [], ciudadDefault: null, unidad: "C" };
}

function esCiudad(valor: unknown): boolean {
  if (typeof valor !== "object" || valor === null) return false;
  const ciudad = valor as Record<string, unknown>;
  return (
    typeof ciudad.id === "number" &&
    typeof ciudad.nombre === "string" &&
    typeof ciudad.pais === "string" &&
    typeof ciudad.latitud === "number" &&
    typeof ciudad.longitud === "number"
  );
}

function esConfiguracion(valor: unknown): valor is Configuracion {
  if (typeof valor !== "object" || valor === null) return false;
  const config = valor as Record<string, unknown>;
  const unidad: Unidad | undefined =
    config.unidad === "C" || config.unidad === "F" ? config.unidad : undefined;

  return (
    Array.isArray(config.ciudades) &&
    config.ciudades.every(esCiudad) &&
    (config.ciudadDefault === null || typeof config.ciudadDefault === "number") &&
    unidad !== undefined
  );
}

export async function cargarConfiguracion(): Promise<Configuracion> {
  const archivo = Bun.file(ARCHIVO);
  if (!(await archivo.exists())) return configuracionInicial();

  try {
    const datos: unknown = await archivo.json();
    if (!esConfiguracion(datos)) return configuracionInicial();

    const existeDefault =
      datos.ciudadDefault !== null &&
      datos.ciudades.some((ciudad) => ciudad.id === datos.ciudadDefault);

    return {
      ciudades: datos.ciudades,
      ciudadDefault: existeDefault ? datos.ciudadDefault : null,
      unidad: datos.unidad,
    };
  } catch {
    return configuracionInicial();
  }
}

export async function guardarConfiguracion(config: Configuracion): Promise<void> {
  await mkdir(DIRECTORIO, { recursive: true });
  await Bun.write(ARCHIVO, `${JSON.stringify(config, null, 2)}\n`);
}

export function rutaConfiguracion(): string {
  return ARCHIVO;
}
