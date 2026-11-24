import { searchCoordinates } from "../api/geocoding";
import { prompt } from "../presentation/input";
import { message, printError, successMessage } from "../presentation/output";
import { addCity as storeCity, hasCity, saveCities } from "../storage/citiesStorage";
import type { City } from "../types/City";
import type { AppConfig } from "../types/Settings";

export async function addCity(config: AppConfig): Promise<void> {
  const name = (await prompt("  Nombre de la ciudad: ")).trim();
  if (!name) {
    message("No ingresaste el nombre de una ciudad.");
    return;
  }

  message("Buscando la ciudad...");
  let found: City | null;
  try {
    found = await searchCoordinates(name);
  } catch (error) {
    printError(error);
    return;
  }

  if (!found) {
    message(`No encontramos una ciudad llamada "${name}".`);
    return;
  }

  if (hasCity(config, found.id)) {
    message(`${found.nombre}, ${found.pais} ya está en la lista.`);
    return;
  }

  storeCity(config, found);
  await saveCities(config);
  successMessage(`Ciudad agregada: ${found.nombre}, ${found.pais}.`);
}
