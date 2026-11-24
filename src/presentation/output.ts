import type { City } from "../types/City";
import type { ForecastResult, WeatherResult } from "../types/Weather";
import { colorize } from "../utils/colors";
import { describeWeatherCode, formatDate, formatTemperature } from "../utils/format";

export function printCityList(cities: City[]): void {
  cities.forEach((city, index) => {
    console.log(`  ${index + 1}. ${city.nombre}, ${city.pais}`);
  });
}

export function printWeather(city: City, weather: WeatherResult): void {
  const value = colorize(`${weather.temperature} ${weather.unitLabel}`, "yellow");
  console.log(`  ${city.nombre}, ${city.pais}: ${value}`);
}

export function printForecast(city: City, forecast: ForecastResult): void {
  console.log(
    colorize(`  Pronóstico a ${forecast.days.length} días — ${city.nombre}, ${city.pais}`, "cyan"),
  );

  for (const day of forecast.days) {
    const date = formatDate(day.date);
    const maximum = formatTemperature(day.maxTemp, forecast.unitLabel).padEnd(7);
    const minimum = formatTemperature(day.minTemp, forecast.unitLabel).padEnd(7);
    const description = describeWeatherCode(day.weatherCode);
    const rain = day.rainProbability === null ? "" : `   Lluvia ${day.rainProbability}%`;

    console.log(
      `  ${date.padEnd(12)} Máx ${colorize(maximum, "yellow")} Mín ${colorize(minimum, "yellow")} ${description}${rain}`,
    );
  }
}

export function printError(error: unknown): void {
  const text = error instanceof Error ? error.message : String(error);
  console.error(colorize(`  Error: ${text}`, "red"));
}

export function message(text: string): void {
  console.log(`  ${text}`);
}

export function successMessage(text: string): void {
  console.log(colorize(`  ${text}`, "green"));
}
