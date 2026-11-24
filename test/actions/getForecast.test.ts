import { afterEach, beforeEach, describe, expect, mock, spyOn, test } from "bun:test";
import type { City } from "../../src/types/City";
import type { Unit } from "../../src/types/Settings";
import type { ForecastResult } from "../../src/types/Weather";
import { bogota, createConfig, createForecast, createForecastDay, madrid } from "../helpers/fixtures";

const fetchForecast = mock(
  async (_city: City, _unit: Unit): Promise<ForecastResult> => createForecast(),
);
mock.module("../../src/api/weather", () => ({ getForecast: fetchForecast }));

const { getAllCitiesForecast, getDefaultForecast } = await import(
  "../../src/actions/getForecast"
);

let log: ReturnType<typeof spyOn>;
let errorLog: ReturnType<typeof spyOn>;

function output(): string {
  return log.mock.calls.map((call: unknown[]) => String(call[0])).join("\n");
}

describe("actions/getForecast", () => {
  beforeEach(() => {
    fetchForecast.mockReset();
    fetchForecast.mockImplementation(async () => createForecast());
    log = spyOn(console, "log").mockImplementation(() => {});
    errorLog = spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    mock.restore();
  });

  test("sin default avisa y no consulta la API", async () => {
    await getDefaultForecast(createConfig());

    expect(fetchForecast).not.toHaveBeenCalled();
    expect(output()).toContain("No hay ciudad default.");
  });

  test("con default muestra el estado de carga y el pronóstico", async () => {
    fetchForecast.mockResolvedValueOnce(
      createForecast({ days: [createForecastDay({ rainProbability: 30 })] }),
    );
    const config = createConfig({
      ciudades: [madrid],
      ciudadDefault: madrid.id,
      unidad: "F",
    });

    await getDefaultForecast(config);

    expect(fetchForecast).toHaveBeenCalledWith(madrid, "F");
    expect(output()).toContain("Consultando pronóstico...");
    expect(output()).toContain("Pronóstico a 1 días");
    expect(output()).toContain("Lluvia 30%");
  });

  test("todas las ciudades consulta cada una", async () => {
    const config = createConfig({
      ciudades: [madrid, bogota],
      ciudadDefault: madrid.id,
    });

    await getAllCitiesForecast(config);

    expect(fetchForecast).toHaveBeenCalledTimes(2);
    expect(fetchForecast).toHaveBeenNthCalledWith(1, madrid, "C");
    expect(fetchForecast).toHaveBeenNthCalledWith(2, bogota, "C");
  });

  test("sin ciudades guardadas avisa", async () => {
    await getAllCitiesForecast(createConfig());

    expect(fetchForecast).not.toHaveBeenCalled();
    expect(output()).toContain("Aún no hay ciudades guardadas.");
  });

  test("un error de la API se muestra por stderr", async () => {
    const config = createConfig({
      ciudades: [madrid],
      ciudadDefault: madrid.id,
    });
    fetchForecast.mockRejectedValueOnce(new Error("Sin datos"));

    await getDefaultForecast(config);

    expect(String(errorLog.mock.calls[0]?.[0])).toContain("Sin datos");
  });
});
