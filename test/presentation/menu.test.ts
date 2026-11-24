import { afterEach, beforeEach, describe, expect, mock, spyOn, test } from "bun:test";
import type { AppConfig } from "../../src/types/Settings";
import { madrid } from "../helpers/fixtures";

const prompt = mock(async (_text: string): Promise<string> => "9");
const addCity = mock(async (_config: AppConfig): Promise<void> => {});
const removeCity = mock(async (_config: AppConfig): Promise<void> => {});
const setDefaultCity = mock(async (_config: AppConfig): Promise<void> => {});
const toggleUnit = mock(async (_config: AppConfig): Promise<void> => {});
const getDefaultWeather = mock(async (_config: AppConfig): Promise<void> => {});
const getAllCitiesWeather = mock(async (_config: AppConfig): Promise<void> => {});
const getDefaultForecast = mock(async (_config: AppConfig): Promise<void> => {});
const getAllCitiesForecast = mock(async (_config: AppConfig): Promise<void> => {});

mock.module("../../src/presentation/input", () => ({ prompt }));
mock.module("../../src/actions/addCity", () => ({ addCity }));
mock.module("../../src/actions/removeCity", () => ({ removeCity }));
mock.module("../../src/actions/setDefaultCity", () => ({ setDefaultCity }));
mock.module("../../src/actions/toggleUnit", () => ({ toggleUnit }));
mock.module("../../src/actions/getWeather", () => ({
  getDefaultWeather,
  getAllCitiesWeather,
}));
mock.module("../../src/actions/getForecast", () => ({
  getDefaultForecast,
  getAllCitiesForecast,
}));

const { runMenu } = await import("../../src/presentation/menu");

let log: ReturnType<typeof spyOn>;

function config(): AppConfig {
  return { ciudades: [madrid], ciudadDefault: madrid.id, unidad: "C" };
}

function printed(index: number): string {
  return String(log.mock.calls[index]?.[0]);
}

describe("presentation/menu", () => {
  beforeEach(() => {
    prompt.mockReset();
    prompt.mockImplementation(async () => "9");
    for (const action of [
      addCity,
      removeCity,
      setDefaultCity,
      toggleUnit,
      getDefaultWeather,
      getAllCitiesWeather,
      getDefaultForecast,
      getAllCitiesForecast,
    ]) {
      action.mockClear();
    }
    log = spyOn(console, "log").mockImplementation(() => {});
  });

  afterEach(() => {
    mock.restore();
  });

  test("renderiza el menú con el estado actual y sale con 9", async () => {
    await runMenu(config());

    const output = printed(0);
    expect(output).toContain("WEATHER CLI");
    expect(output).toContain("1. Clima de ciudad default");
    expect(output).toContain("Clima de todas las ciudades (1)");
    expect(output).toContain("Ajustes (°C)");
    expect(printed(1)).toContain("¡Hasta luego!");
    expect(prompt).toHaveBeenCalledTimes(1);
  });

  test("una opción inválida no ejecuta acciones", async () => {
    prompt.mockResolvedValueOnce("x");

    await runMenu(config());

    expect(printed(1)).toContain("Opción inválida");
    expect(getDefaultWeather).not.toHaveBeenCalled();
    expect(addCity).not.toHaveBeenCalled();
  });

  test("las opciones 1, 6 y 8 ejecutan sus acciones sobre la configuración", async () => {
    const currentConfig = config();
    prompt
      .mockResolvedValueOnce("1")
      .mockResolvedValueOnce("6")
      .mockResolvedValueOnce("8")
      .mockResolvedValueOnce("9");

    await runMenu(currentConfig);

    expect(getDefaultWeather).toHaveBeenCalledWith(currentConfig);
    expect(getDefaultForecast).toHaveBeenCalledWith(currentConfig);
    expect(toggleUnit).toHaveBeenCalledWith(currentConfig);
    expect(prompt).toHaveBeenCalledTimes(4);
  });

  test("las opciones 2 y 7 consultan todas las ciudades", async () => {
    const currentConfig = config();
    prompt.mockResolvedValueOnce("2").mockResolvedValueOnce("7").mockResolvedValueOnce("9");

    await runMenu(currentConfig);

    expect(getAllCitiesWeather).toHaveBeenCalledWith(currentConfig);
    expect(getAllCitiesForecast).toHaveBeenCalledWith(currentConfig);
  });
});
