import { getForecast as fetchForecast } from "../api/weather";
import { message, printError, printForecast } from "../presentation/output";
import { findCity, getCities } from "../storage/citiesStorage";
import { getUnit } from "../storage/settingsStorage";
import type { City } from "../types/City";
import type { AppConfig } from "../types/Settings";

async function consultForecast(config: AppConfig, city: City): Promise<void> {
  message("Consultando pronóstico...");
  try {
    const forecast = await fetchForecast(city, getUnit(config));
    printForecast(city, forecast);
  } catch (error) {
    printError(error);
  }
}

export async function getDefaultForecast(config: AppConfig): Promise<void> {
  const city = findCity(config, config.ciudadDefault);
  if (!city) {
    message("No hay ciudad default. Usa la opción 3 o la opción 5 para elegir una.");
    return;
  }

  await consultForecast(config, city);
}

export async function getAllCitiesForecast(config: AppConfig): Promise<void> {
  const cities = getCities(config);
  if (cities.length === 0) {
    message("Aún no hay ciudades guardadas. Usa la opción 3 para agregar una.");
    return;
  }

  for (const city of cities) {
    await consultForecast(config, city);
  }
}
