import type { City } from "../types/City";
import type { AppConfig } from "../types/Settings";
import { saveConfig } from "./configFile";

export function getCities(config: AppConfig): City[] {
  return config.ciudades;
}

export function findCity(config: AppConfig, id: number | null): City | undefined {
  if (id === null) return undefined;
  return config.ciudades.find((city) => city.id === id);
}

export function hasCity(config: AppConfig, id: number): boolean {
  return config.ciudades.some((city) => city.id === id);
}

export function addCity(config: AppConfig, city: City): void {
  config.ciudades.push(city);
  if (config.ciudadDefault === null) config.ciudadDefault = city.id;
}

export function removeCityAt(config: AppConfig, index: number): void {
  const [removed] = config.ciudades.splice(index, 1);
  if (removed && config.ciudadDefault === removed.id) {
    config.ciudadDefault = config.ciudades[0]?.id ?? null;
  }
}

export function setDefaultCity(config: AppConfig, city: City): void {
  config.ciudadDefault = city.id;
}

export function saveCities(config: AppConfig): Promise<void> {
  return saveConfig(config);
}
