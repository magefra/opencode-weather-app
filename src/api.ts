import type { Ciudad, DiaPronostico, Unidad } from "./types";

const GEOCODING_URL = "https://geocoding-api.open-meteo.com/v1/search";
const FORECAST_URL = "https://api.open-meteo.com/v1/forecast";
const TIEMPO_ESPERA_MS = 10_000;

interface ResultadoGeocoding {
  id: number;
  name: string;
  country?: string;
  latitude: number;
  longitude: number;
}

interface RespuestaGeocoding {
  results?: ResultadoGeocoding[];
}

interface RespuestaForecast {
  current?: { temperature_2m?: number };
  current_units?: { temperature_2m?: string };
}

interface DatosDiarios {
  time?: string[];
  temperature_2m_max?: number[];
  temperature_2m_min?: number[];
  weather_code?: number[];
  precipitation_probability_max?: (number | null)[];
}

interface RespuestaPronostico {
  daily?: DatosDiarios;
  daily_units?: { temperature_2m_max?: string };
}

const DIAS_PRONOSTICO = 7;

async function pedirJson<T>(url: URL): Promise<T> {
  let respuesta: Response;
  try {
    respuesta = await fetch(url, { signal: AbortSignal.timeout(TIEMPO_ESPERA_MS) });
  } catch {
    throw new Error("No se pudo conectar con Open-Meteo. Revisa tu conexión a internet.");
  }

  if (!respuesta.ok) {
    throw new Error(`Open-Meteo respondió con el código HTTP ${respuesta.status}.`);
  }

  return (await respuesta.json()) as T;
}

/** Paso 1: convierte el nombre de una ciudad en coordenadas. */
export async function buscarCoordenadas(nombre: string): Promise<Ciudad | null> {
  const url = new URL(GEOCODING_URL);
  url.searchParams.set("name", nombre.trim());
  url.searchParams.set("count", "1");
  url.searchParams.set("language", "es");
  url.searchParams.set("format", "json");

  const datos = await pedirJson<RespuestaGeocoding>(url);
  const resultado = datos.results?.[0];
  if (!resultado) return null;

  return {
    id: resultado.id,
    nombre: resultado.name,
    pais: resultado.country ?? "Desconocido",
    latitud: resultado.latitude,
    longitud: resultado.longitude,
  };
}

/** Paso 2: obtiene la temperatura a partir de las coordenadas. */
export async function obtenerClima(
  ciudad: Ciudad,
  unidad: Unidad,
): Promise<{ temperatura: number; etiqueta: string }> {
  const url = new URL(FORECAST_URL);
  url.searchParams.set("latitude", String(ciudad.latitud));
  url.searchParams.set("longitude", String(ciudad.longitud));
  url.searchParams.set("current", "temperature_2m");
  if (unidad === "F") url.searchParams.set("temperature_unit", "fahrenheit");

  const datos = await pedirJson<RespuestaForecast>(url);
  const temperatura = datos.current?.temperature_2m;
  if (typeof temperatura !== "number") {
    throw new Error("Open-Meteo no devolvió la temperatura solicitada.");
  }

  return {
    temperatura,
    etiqueta: unidad === "F" ? "°F" : (datos.current_units?.temperature_2m ?? "°C"),
  };
}

/** Obtiene el pronóstico diario para los próximos 7 días. */
export async function obtenerPronostico(
  ciudad: Ciudad,
  unidad: Unidad,
): Promise<{ dias: DiaPronostico[]; etiqueta: string }> {
  const url = new URL(FORECAST_URL);
  url.searchParams.set("latitude", String(ciudad.latitud));
  url.searchParams.set("longitude", String(ciudad.longitud));
  url.searchParams.set(
    "daily",
    "temperature_2m_max,temperature_2m_min,weather_code,precipitation_probability_max",
  );
  url.searchParams.set("forecast_days", String(DIAS_PRONOSTICO));
  url.searchParams.set("timezone", "auto");
  if (unidad === "F") url.searchParams.set("temperature_unit", "fahrenheit");

  const datos = await pedirJson<RespuestaPronostico>(url);
  const diario = datos.daily;
  const fechas = diario?.time;
  const maximas = diario?.temperature_2m_max;
  const minimas = diario?.temperature_2m_min;
  const codigos = diario?.weather_code;
  const lluvia = diario?.precipitation_probability_max;

  if (
    !fechas ||
    !maximas ||
    !minimas ||
    !codigos ||
    fechas.length < DIAS_PRONOSTICO ||
    maximas.length < DIAS_PRONOSTICO ||
    minimas.length < DIAS_PRONOSTICO ||
    codigos.length < DIAS_PRONOSTICO
  ) {
    throw new Error("Open-Meteo no devolvió el pronóstico diario solicitado.");
  }

  const dias: DiaPronostico[] = [];
  for (let indice = 0; indice < DIAS_PRONOSTICO; indice += 1) {
    const fecha = fechas[indice];
    const tempMax = maximas[indice];
    const tempMin = minimas[indice];
    const codigoClima = codigos[indice];
    const probabilidad = lluvia?.[indice];

    if (
      typeof fecha !== "string" ||
      typeof tempMax !== "number" ||
      typeof tempMin !== "number" ||
      typeof codigoClima !== "number"
    ) {
      throw new Error("Open-Meteo devolvió datos incompletos en el pronóstico.");
    }

    dias.push({
      fecha,
      tempMax,
      tempMin,
      codigoClima,
      probabilidadLluvia: typeof probabilidad === "number" ? probabilidad : null,
    });
  }

  return {
    dias,
    etiqueta: unidad === "F" ? "°F" : (datos.daily_units?.temperature_2m_max ?? "°C"),
  };
}
