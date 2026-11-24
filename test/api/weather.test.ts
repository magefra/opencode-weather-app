import { beforeEach, describe, expect, mock, test } from "bun:test";
import { madrid } from "../helpers/fixtures";

const requestJson = mock(async (_url: URL): Promise<unknown> => ({}));
mock.module("../../src/api/client", () => ({ requestJson }));

const { getForecast, getWeather } = await import("../../src/api/weather");

function lastUrl(): URL {
  const [url] = requestJson.mock.calls[requestJson.mock.calls.length - 1] ?? [];
  if (!(url instanceof URL)) throw new Error("No se capturó la URL solicitada");
  return url;
}

describe("api/weather", () => {
  beforeEach(() => {
    requestJson.mockReset();
  });

  describe("getWeather", () => {
    test("pide la temperatura actual y respeta la unidad C", async () => {
      requestJson.mockResolvedValue({
        current: { temperature_2m: 21.6 },
        current_units: { temperature_2m: "°C" },
      });

      const result = await getWeather(madrid, "C");

      expect(result).toEqual({ temperature: 21.6, unitLabel: "°C" });
      const url = lastUrl();
      expect(url.origin + url.pathname).toBe(
        "https://api.open-meteo.com/v1/forecast",
      );
      expect(url.searchParams.get("latitude")).toBe("40.4168");
      expect(url.searchParams.get("longitude")).toBe("-3.7038");
      expect(url.searchParams.get("current")).toBe("temperature_2m");
      expect(url.searchParams.has("temperature_unit")).toBe(false);
    });

    test("pide Fahrenheit y fuerza la etiqueta °F", async () => {
      requestJson.mockResolvedValue({
        current: { temperature_2m: 70 },
        current_units: { temperature_2m: "°C" },
      });

      const result = await getWeather(madrid, "F");

      expect(result).toEqual({ temperature: 70, unitLabel: "°F" });
      expect(lastUrl().searchParams.get("temperature_unit")).toBe("fahrenheit");
    });

    test("falla si no viene la temperatura", async () => {
      requestJson.mockResolvedValue({ current: {} });

      await expect(getWeather(madrid, "C")).rejects.toThrow(
        "Open-Meteo no devolvió la temperatura solicitada.",
      );
    });
  });

  describe("getForecast", () => {
    test("mapea los 7 días y normaliza la probabilidad de lluvia ausente", async () => {
      const payload = {
        daily: {
          time: Array.from({ length: 7 }, (_, index) => `2026-11-${24 + index}`),
          temperature_2m_max: [20, 21, 22, 23, 24, 25, 26],
          temperature_2m_min: [10, 11, 12, 13, 14, 15, 16],
          weather_code: [0, 1, 2, 3, 45, 61, 95],
          precipitation_probability_max: [0, null, 20, 30, 40, 50, 60],
        },
        daily_units: { temperature_2m_max: "°C" },
      };
      requestJson.mockResolvedValue(payload);

      const result = await getForecast(madrid, "C");

      expect(result.unitLabel).toBe("°C");
      expect(result.days).toHaveLength(7);
      expect(result.days[0]).toEqual({
        date: "2026-11-24",
        maxTemp: 20,
        minTemp: 10,
        weatherCode: 0,
        rainProbability: 0,
      });
      expect(result.days[1]?.rainProbability).toBeNull();
      expect(result.days[6]?.weatherCode).toBe(95);

      const url = lastUrl();
      expect(url.searchParams.get("forecast_days")).toBe("7");
      expect(url.searchParams.get("timezone")).toBe("auto");
      expect(url.searchParams.get("daily")).toBe(
        "temperature_2m_max,temperature_2m_min,weather_code,precipitation_probability_max",
      );
    });

    test("pide Fahrenheit en el pronóstico", async () => {
      requestJson.mockResolvedValue({
        daily: {
          time: Array.from({ length: 7 }, (_, index) => `2026-11-${24 + index}`),
          temperature_2m_max: Array(7).fill(70),
          temperature_2m_min: Array(7).fill(50),
          weather_code: Array(7).fill(0),
        },
      });

      const result = await getForecast(madrid, "F");

      expect(result.unitLabel).toBe("°F");
      expect(result.days[0]?.rainProbability).toBeNull();
      expect(lastUrl().searchParams.get("temperature_unit")).toBe("fahrenheit");
    });

    test("falla si faltan días en el pronóstico", async () => {
      requestJson.mockResolvedValue({ daily: { time: ["2026-11-24"] } });

      await expect(getForecast(madrid, "C")).rejects.toThrow(
        "Open-Meteo no devolvió el pronóstico diario solicitado.",
      );
    });

    test("falla si un día tiene datos incompletos", async () => {
      requestJson.mockResolvedValue({
        daily: {
          time: Array.from({ length: 7 }, (_, index) => `2026-11-${24 + index}`),
          temperature_2m_max: Array(7).fill(20),
          temperature_2m_min: Array(7).fill(10),
          weather_code: [0, 1, 2, 3, 45, 61, "desconocido"],
        },
      });

      await expect(getForecast(madrid, "C")).rejects.toThrow(
        "Open-Meteo devolvió datos incompletos en el pronóstico.",
      );
    });
  });
});
