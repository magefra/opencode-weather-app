import type { City } from "../types/City";
import type { Unit } from "../types/Settings";
import type { ForecastDay, ForecastResult, WeatherResult } from "../types/Weather";
import { FORECAST_DAYS, FORECAST_URL } from "../utils/constants";
import { requestJson } from "./client";

interface ForecastResponse {
  current?: { temperature_2m?: number };
  current_units?: { temperature_2m?: string };
}

interface DailyData {
  time?: string[];
  temperature_2m_max?: number[];
  temperature_2m_min?: number[];
  weather_code?: number[];
  precipitation_probability_max?: (number | null)[];
}

interface ForecastApiResponse {
  daily?: DailyData;
  daily_units?: { temperature_2m_max?: string };
}

/** Paso 2: obtiene la temperatura a partir de las coordenadas. */
export async function getWeather(city: City, unit: Unit): Promise<WeatherResult> {
  const url = new URL(FORECAST_URL);
  url.searchParams.set("latitude", String(city.latitud));
  url.searchParams.set("longitude", String(city.longitud));
  url.searchParams.set("current", "temperature_2m");
  if (unit === "F") url.searchParams.set("temperature_unit", "fahrenheit");

  const data = await requestJson<ForecastResponse>(url);
  const temperature = data.current?.temperature_2m;
  if (typeof temperature !== "number") {
    throw new Error("Open-Meteo no devolvió la temperatura solicitada.");
  }

  return {
    temperature,
    unitLabel: unit === "F" ? "°F" : (data.current_units?.temperature_2m ?? "°C"),
  };
}

/** Obtiene el pronóstico diario para los próximos 7 días. */
export async function getForecast(city: City, unit: Unit): Promise<ForecastResult> {
  const url = new URL(FORECAST_URL);
  url.searchParams.set("latitude", String(city.latitud));
  url.searchParams.set("longitude", String(city.longitud));
  url.searchParams.set(
    "daily",
    "temperature_2m_max,temperature_2m_min,weather_code,precipitation_probability_max",
  );
  url.searchParams.set("forecast_days", String(FORECAST_DAYS));
  url.searchParams.set("timezone", "auto");
  if (unit === "F") url.searchParams.set("temperature_unit", "fahrenheit");

  const data = await requestJson<ForecastApiResponse>(url);
  const daily = data.daily;
  const dates = daily?.time;
  const maximums = daily?.temperature_2m_max;
  const minimums = daily?.temperature_2m_min;
  const codes = daily?.weather_code;
  const rain = daily?.precipitation_probability_max;

  if (
    !dates ||
    !maximums ||
    !minimums ||
    !codes ||
    dates.length < FORECAST_DAYS ||
    maximums.length < FORECAST_DAYS ||
    minimums.length < FORECAST_DAYS ||
    codes.length < FORECAST_DAYS
  ) {
    throw new Error("Open-Meteo no devolvió el pronóstico diario solicitado.");
  }

  const days: ForecastDay[] = [];
  for (let index = 0; index < FORECAST_DAYS; index += 1) {
    const date = dates[index];
    const maxTemp = maximums[index];
    const minTemp = minimums[index];
    const weatherCode = codes[index];
    const probability = rain?.[index];

    if (
      typeof date !== "string" ||
      typeof maxTemp !== "number" ||
      typeof minTemp !== "number" ||
      typeof weatherCode !== "number"
    ) {
      throw new Error("Open-Meteo devolvió datos incompletos en el pronóstico.");
    }

    days.push({
      date,
      maxTemp,
      minTemp,
      weatherCode,
      rainProbability: typeof probability === "number" ? probability : null,
    });
  }

  return {
    days,
    unitLabel: unit === "F" ? "°F" : (data.daily_units?.temperature_2m_max ?? "°C"),
  };
}
