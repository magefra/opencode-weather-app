import { WEATHER_DESCRIPTIONS } from "./constants";

export function formatDate(value: string): string {
  return new Date(`${value}T12:00:00`).toLocaleDateString("es-ES", {
    weekday: "short",
    day: "numeric",
    month: "short",
  });
}

export function formatTemperature(value: number, unitLabel: string): string {
  return `${Math.round(value)}${unitLabel}`;
}

export function describeWeatherCode(code: number): string {
  return WEATHER_DESCRIPTIONS[code] ?? "Desconocido";
}
