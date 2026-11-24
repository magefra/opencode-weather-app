import { beforeEach, describe, expect, mock, test } from "bun:test";

const requestJson = mock(async (_url: URL): Promise<unknown> => ({}));
mock.module("../../src/api/client", () => ({ requestJson }));

const { searchCoordinates } = await import("../../src/api/geocoding");

function lastUrl(): URL {
  const [url] = requestJson.mock.calls[0] ?? [];
  if (!(url instanceof URL)) throw new Error("No se capturó la URL solicitada");
  return url;
}

describe("api/geocoding", () => {
  beforeEach(() => {
    requestJson.mockReset();
  });

  test("searchCoordinates consulta el nombre recortado y mapea el primer resultado", async () => {
    requestJson.mockResolvedValue({
      results: [
        {
          id: 351,
          name: "Ottawa",
          country: "Canadá",
          latitude: 45.41,
          longitude: -75.69,
        },
      ],
    });

    const city = await searchCoordinates("  Ottawa  ");

    expect(city).toEqual({
      id: 351,
      nombre: "Ottawa",
      pais: "Canadá",
      latitud: 45.41,
      longitud: -75.69,
    });
    const url = lastUrl();
    expect(url.origin + url.pathname).toBe(
      "https://geocoding-api.open-meteo.com/v1/search",
    );
    expect(url.searchParams.get("name")).toBe("Ottawa");
    expect(url.searchParams.get("count")).toBe("1");
    expect(url.searchParams.get("language")).toBe("es");
    expect(url.searchParams.get("format")).toBe("json");
  });

  test("searchCoordinates usa Desconocido cuando no hay país", async () => {
    requestJson.mockResolvedValue({
      results: [{ id: 7, name: "Ciudad", latitude: 1, longitude: 2 }],
    });

    const city = await searchCoordinates("Ciudad");

    expect(city?.pais).toBe("Desconocido");
  });

  test("searchCoordinates devuelve null cuando no hay resultados", async () => {
    requestJson.mockResolvedValue({});

    expect(await searchCoordinates("NoExiste")).toBeNull();
  });
});
