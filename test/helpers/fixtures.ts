import type { City } from "../../src/types/City";
import type { AppConfig } from "../../src/types/Settings";
import type { ForecastDay, ForecastResult } from "../../src/types/Weather";

export const madrid: City = {
  id: 1,
  nombre: "Madrid",
  pais: "España",
  latitud: 40.4168,
  longitud: -3.7038,
};

export const bogota: City = {
  id: 2,
  nombre: "Bogotá",
  pais: "Colombia",
  latitud: 4.711,
  longitud: -74.0721,
};

export function createConfig(overrides: Partial<AppConfig> = {}): AppConfig {
  return { ciudades: [], ciudadDefault: null, unidad: "C", ...overrides };
}

export function createForecastDay(overrides: Partial<ForecastDay> = {}): ForecastDay {
  return {
    date: "2026-11-24",
    maxTemp: 18,
    minTemp: 9,
    weatherCode: 0,
    rainProbability: 10,
    ...overrides,
  };
}

export function createForecast(overrides: Partial<ForecastResult> = {}): ForecastResult {
  return { days: [createForecastDay()], unitLabel: "°C", ...overrides };
}

/** Respuesta cruda tal como la devuelve el endpoint `daily` de Open-Meteo. */
export function createDailyPayload(days = 7): Record<string, unknown> {
  const dates = Array.from({ length: days }, (_, index) => `2026-11-${24 + index}`);
  return {
    daily: {
      time: dates,
      temperature_2m_max: dates.map(() => 20),
      temperature_2m_min: dates.map(() => 10),
      weather_code: dates.map(() => 0),
      precipitation_probability_max: dates.map((_, index) => index * 10),
    },
    daily_units: { temperature_2m_max: "°C" },
  };
}
