import { getWeather as fetchWeather } from "../api/weather";
import { message, printError, printWeather } from "../presentation/output";
import { findCity, getCities } from "../storage/citiesStorage";
import { getUnit } from "../storage/settingsStorage";
import type { City } from "../types/City";
import type { AppConfig } from "../types/Settings";

async function consultWeather(config: AppConfig, city: City): Promise<void> {
  try {
    const weather = await fetchWeather(city, getUnit(config));
    printWeather(city, weather);
  } catch (error) {
    printError(error);
  }
}

export async function getDefaultWeather(config: AppConfig): Promise<void> {
  const city = findCity(config, config.ciudadDefault);
  if (!city) {
    message("No hay ciudad default. Usa la opción 3 o la opción 5 para elegir una.");
    return;
  }

  await consultWeather(config, city);
}

export async function getAllCitiesWeather(config: AppConfig): Promise<void> {
  const cities = getCities(config);
  if (cities.length === 0) {
    message("Aún no hay ciudades guardadas. Usa la opción 3 para agregar una.");
    return;
  }

  for (const city of cities) {
    await consultWeather(config, city);
  }
}
