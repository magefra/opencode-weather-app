import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, mock, spyOn, test } from "bun:test";
import type { City } from "../../src/types/City";
import type { AppConfig } from "../../src/types/Settings";
import { createConfig, madrid } from "../helpers/fixtures";
import { createTempHome, removeTempHome, restoreEnvs, stubHome } from "../helpers/temp";

const prompt = mock(async (_text: string): Promise<string> => "");
const searchCoordinates = mock(async (_name: string): Promise<City | null> => null);
mock.module("../../src/presentation/input", () => ({ prompt }));
mock.module("../../src/api/geocoding", () => ({ searchCoordinates }));

const { addCity } = await import("../../src/actions/addCity");

let home: string;
let log: ReturnType<typeof spyOn>;
let errorLog: ReturnType<typeof spyOn>;

function output(): string {
  return log.mock.calls.map((call: unknown[]) => String(call[0])).join("\n");
}

async function savedConfig(): Promise<AppConfig> {
  const content = await readFile(join(home, ".weather-cli", "config.json"), "utf8");
  return JSON.parse(content) as AppConfig;
}

describe("actions/addCity", () => {
  beforeEach(async () => {
    home = await createTempHome();
    stubHome(home);
    prompt.mockReset();
    searchCoordinates.mockReset();
    searchCoordinates.mockImplementation(async () => null);
    log = spyOn(console, "log").mockImplementation(() => {});
    errorLog = spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(async () => {
    mock.restore();
    restoreEnvs();
    await removeTempHome(home);
  });

  test("sin nombre no consulta la API", async () => {
    prompt.mockResolvedValueOnce("   ");
    const config = createConfig();

    await addCity(config);

    expect(searchCoordinates).not.toHaveBeenCalled();
    expect(output()).toContain("No ingresaste el nombre de una ciudad.");
    expect(config.ciudades).toEqual([]);
  });

  test("guarda la ciudad encontrada y la fija como default", async () => {
    prompt.mockResolvedValueOnce("Madrid");
    searchCoordinates.mockResolvedValueOnce(madrid);
    const config = createConfig();

    await addCity(config);

    expect(searchCoordinates).toHaveBeenCalledWith("Madrid");
    expect(config.ciudades).toEqual([madrid]);
    expect(config.ciudadDefault).toBe(madrid.id);
    expect(await savedConfig()).toEqual(config);
    expect(output()).toContain("Ciudad agregada: Madrid, España.");
  });

  test("no guarda ciudades duplicadas", async () => {
    prompt.mockResolvedValueOnce("Madrid");
    searchCoordinates.mockResolvedValueOnce(madrid);
    const config = createConfig({ ciudades: [madrid], ciudadDefault: madrid.id });

    await addCity(config);

    expect(config.ciudades).toHaveLength(1);
    expect(output()).toContain("ya está en la lista");
  });

  test("avisa cuando la API no encuentra la ciudad", async () => {
    prompt.mockResolvedValueOnce("NoExiste");
    const config = createConfig();

    await addCity(config);

    expect(output()).toContain('No encontramos una ciudad llamada "NoExiste".');
    expect(config.ciudades).toEqual([]);
  });

  test("muestra errores de la API sin modificar la configuración", async () => {
    prompt.mockResolvedValueOnce("Madrid");
    searchCoordinates.mockRejectedValueOnce(new Error("Sin conexión"));
    const config = createConfig();

    await addCity(config);

    expect(String(errorLog.mock.calls[0]?.[0])).toContain("Sin conexión");
    expect(config.ciudades).toEqual([]);
  });
});
