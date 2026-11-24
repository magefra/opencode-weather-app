import { message, printCityList } from "../presentation/output";
import type { AppConfig } from "../types/Settings";

export function listCities(config: AppConfig): void {
  if (config.ciudades.length === 0) {
    message("Aún no hay ciudades guardadas. Usa la opción 3 para agregar una.");
    return;
  }

  printCityList(config.ciudades);
}
