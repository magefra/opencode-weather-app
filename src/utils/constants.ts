export const GEOCODING_URL = "https://geocoding-api.open-meteo.com/v1/search";
export const FORECAST_URL = "https://api.open-meteo.com/v1/forecast";
export const REQUEST_TIMEOUT_MS = 10_000;
export const FORECAST_DAYS = 7;
export const MENU_LINE = "═".repeat(40);

export const WEATHER_DESCRIPTIONS: Record<number, string> = {
  0: "Despejado",
  1: "Principalmente despejado",
  2: "Parcialmente nublado",
  3: "Nublado",
  45: "Niebla",
  48: "Niebla con escarcha",
  51: "Llovizna ligera",
  53: "Llovizna",
  55: "Llovizna intensa",
  56: "Llovizna congelante ligera",
  57: "Llovizna congelante",
  61: "Lluvia ligera",
  63: "Lluvia",
  65: "Lluvia intensa",
  66: "Lluvia congelante ligera",
  67: "Lluvia congelante",
  71: "Nieve ligera",
  73: "Nieve",
  75: "Nieve intensa",
  77: "Granos de nieve",
  80: "Chubascos ligeros",
  81: "Chubascos",
  82: "Chubascos intensos",
  85: "Chubascos de nieve ligeros",
  86: "Chubascos de nieve",
  95: "Tormenta",
  96: "Tormenta con granizo ligero",
  99: "Tormenta con granizo",
};
