import type { City } from "./City";

export type Unit = "C" | "F";

/** Las claves se mantienen en español porque forman parte de config.json. */
export interface AppConfig {
  ciudades: City[];
  ciudadDefault: number | null;
  unidad: Unit;
}
