import type { AppConfig, Unit } from "../types/Settings";
import { saveConfig } from "./configFile";

export function getUnit(config: AppConfig): Unit {
  return config.unidad;
}

export function toggleUnit(config: AppConfig): Unit {
  config.unidad = config.unidad === "C" ? "F" : "C";
  return config.unidad;
}

export function saveSettings(config: AppConfig): Promise<void> {
  return saveConfig(config);
}
