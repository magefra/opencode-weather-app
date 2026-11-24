import { afterEach, beforeEach, describe, expect, mock, spyOn, test } from "bun:test";
import {
  message,
  printCityList,
  printError,
  printForecast,
  printWeather,
  successMessage,
} from "../../src/presentation/output";
import { bogota, createForecast, createForecastDay, madrid } from "../helpers/fixtures";

let log: ReturnType<typeof spyOn>;
let error: ReturnType<typeof spyOn>;

function printedLines(): string[] {
  return log.mock.calls.map((call: unknown[]) => String(call[0]));
}

describe("presentation/output", () => {
  beforeEach(() => {
    log = spyOn(console, "log").mockImplementation(() => {});
    error = spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    mock.restore();
  });

  test("printCityList numera las ciudades desde 1", () => {
    printCityList([madrid, bogota]);

    expect(printedLines()).toEqual([
      "  1. Madrid, España",
      "  2. Bogotá, Colombia",
    ]);
  });

  test("printWeather muestra la ciudad y la temperatura", () => {
    printWeather(madrid, { temperature: 21.6, unitLabel: "°C" });

    expect(printedLines()[0]).toContain("Madrid, España");
    expect(printedLines()[0]).toContain("21.6 °C");
  });

  test("printForecast muestra cabecera, días y probabilidad de lluvia", () => {
    printForecast(
      madrid,
      createForecast({
        days: [
          createForecastDay({ date: "2026-11-24", rainProbability: 60 }),
          createForecastDay({ date: "2026-11-25", rainProbability: null }),
        ],
      }),
    );

    const lines = printedLines();
    expect(lines[0]).toContain("Pronóstico a 2 días");
    expect(lines[0]).toContain("Madrid, España");
    expect(lines[1]).toContain("Despejado");
    expect(lines[1]).toContain("Lluvia 60%");
    expect(lines[2]).not.toContain("Lluvia");
  });

  test("printError escribe en stderr y acepta valores no Error", () => {
    printError(new Error("Falló la red"));

    expect(String(error.mock.calls[0]?.[0])).toContain("Error: Falló la red");

    printError("texto plano");
    expect(String(error.mock.calls[1]?.[0])).toContain("Error: texto plano");
  });

  test("message y successMessage respetan el formato con sangría", () => {
    message("Buscando...");
    successMessage("Listo");

    expect(printedLines()[0]).toBe("  Buscando...");
    expect(printedLines()[1]).toContain("Listo");
  });
});
