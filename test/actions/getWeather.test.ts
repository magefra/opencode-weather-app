import { afterEach, beforeEach, describe, expect, mock, spyOn, test } from "bun:test";
import type { City } from "../../src/types/City";
import type { Unit } from "../../src/types/Settings";
import type { WeatherResult } from "../../src/types/Weather";
import { bogota, createConfig, madrid } from "../helpers/fixtures";

const fetchWeather = mock(
  async (_city: City, _unit: Unit): Promise<WeatherResult> => ({
    temperature: 20,
    unitLabel: "°C",
  }),
);
mock.module("../../src/api/weather", () => ({ getWeather: fetchWeather }));

const { getAllCitiesWeather, getDefaultWeather } = await import(
  "../../src/actions/getWeather"
);

let log: ReturnType<typeof spyOn>;
let errorLog: ReturnType<typeof spyOn>;

function output(): string {
  return log.mock.calls.map((call: unknown[]) => String(call[0])).join("\n");
}

describe("actions/getWeather", () => {
  beforeEach(() => {
    fetchWeather.mockReset();
    fetchWeather.mockImplementation(async () => ({ temperature: 20, unitLabel: "°C" }));
    log = spyOn(console, "log").mockImplementation(() => {});
    errorLog = spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    mock.restore();
  });

  test("sin default avisa y no consulta la API", async () => {
    await getDefaultWeather(createConfig());

    expect(fetchWeather).not.toHaveBeenCalled();
    expect(output()).toContain("No hay ciudad default.");
  });

  test("con default consulta usando la unidad configurada", async () => {
    const config = createConfig({
      ciudades: [madrid],
      ciudadDefault: madrid.id,
      unidad: "F",
    });

    await getDefaultWeather(config);

    expect(fetchWeather).toHaveBeenCalledWith(madrid, "F");
    expect(output()).toContain("Madrid, España");
    expect(output()).toContain("20 °C");
  });

  test("todas las ciudades consulta cada una", async () => {
    const config = createConfig({
      ciudades: [madrid, bogota],
      ciudadDefault: madrid.id,
    });

    await getAllCitiesWeather(config);

    expect(fetchWeather).toHaveBeenCalledTimes(2);
    expect(fetchWeather).toHaveBeenNthCalledWith(1, madrid, "C");
    expect(fetchWeather).toHaveBeenNthCalledWith(2, bogota, "C");
  });

  test("sin ciudades guardadas avisa", async () => {
    await getAllCitiesWeather(createConfig());

    expect(fetchWeather).not.toHaveBeenCalled();
    expect(output()).toContain("Aún no hay ciudades guardadas.");
  });

  test("un error de la API se muestra y no detiene la acción", async () => {
    const config = createConfig({
      ciudades: [madrid],
      ciudadDefault: madrid.id,
    });
    fetchWeather.mockRejectedValueOnce(new Error("HTTP 500"));

    await getDefaultWeather(config);

    expect(String(errorLog.mock.calls[0]?.[0])).toContain("HTTP 500");
  });
});
