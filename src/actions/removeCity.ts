import { prompt, selectCity } from "../presentation/input";
import { message, successMessage } from "../presentation/output";
import { removeCityAt, saveCities } from "../storage/citiesStorage";
import type { AppConfig } from "../types/Settings";

export async function removeCity(config: AppConfig): Promise<void> {
  const selection = await selectCity(config, "  Número de la ciudad a eliminar: ");
  if (!selection) return;

  const answer = (await prompt(`  ¿Eliminar ${selection.city.nombre}? (s/n): `))
    .trim()
    .toLowerCase();
  if (answer !== "s" && answer !== "si" && answer !== "sí") {
    message("Eliminación cancelada.");
    return;
  }

  removeCityAt(config, selection.index);
  await saveCities(config);
  successMessage("Ciudad eliminada.");
}
