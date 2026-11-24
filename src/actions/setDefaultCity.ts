import { selectCity } from "../presentation/input";
import { successMessage } from "../presentation/output";
import { saveCities, setDefaultCity as setDefault } from "../storage/citiesStorage";
import type { AppConfig } from "../types/Settings";

export async function setDefaultCity(config: AppConfig): Promise<void> {
  const selection = await selectCity(config, "  Número de la ciudad default: ");
  if (!selection) return;

  setDefault(config, selection.city);
  await saveCities(config);
  successMessage(`Ciudad default: ${selection.city.nombre}, ${selection.city.pais}.`);
}
