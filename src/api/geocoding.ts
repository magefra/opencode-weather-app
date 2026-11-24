import type { City } from "../types/City";
import { GEOCODING_URL } from "../utils/constants";
import { requestJson } from "./client";

interface GeocodingResult {
  id: number;
  name: string;
  country?: string;
  latitude: number;
  longitude: number;
}

interface GeocodingResponse {
  results?: GeocodingResult[];
}

/** Paso 1: convierte el nombre de una ciudad en coordenadas. */
export async function searchCoordinates(name: string): Promise<City | null> {
  const url = new URL(GEOCODING_URL);
  url.searchParams.set("name", name.trim());
  url.searchParams.set("count", "1");
  url.searchParams.set("language", "es");
  url.searchParams.set("format", "json");

  const data = await requestJson<GeocodingResponse>(url);
  const result = data.results?.[0];
  if (!result) return null;

  return {
    id: result.id,
    nombre: result.name,
    pais: result.country ?? "Desconocido",
    latitud: result.latitude,
    longitud: result.longitude,
  };
}
