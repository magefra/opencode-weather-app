import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, mock, spyOn, test } from "bun:test";
import type { City } from "../../src/types/City";
import type { AppConfig } from "../../src/types/Settings";
import { bogota, createConfig, madrid } from "../helpers/fixtures";
import { createTempHome, removeTempHome, restoreEnvs, stubHome } from "../helpers/temp";

const prompt = mock(async (_text: string): Promise<string> => "n");
const selectCity = mock(
  async (_config: AppConfig, _instruction: string): Promise<{ city: City; index: number } | null> =>
    null,
);
mock.module("../../src/presentation/input", () => ({ prompt, selectCity }));

const { removeCity } = await import("../../src/actions/removeCity");

let home: string;
let log: ReturnType<typeof spyOn>;

function output(): string {
  return log.mock.calls.map((call: unknown[]) => String(call[0])).join("\n");
}

async function savedConfig(): Promise<AppConfig> {
  const content = await readFile(join(home, ".weather-cli", "config.json"), "utf8");
  return JSON.parse(content) as AppConfig;
}

describe("actions/removeCity", () => {
  beforeEach(async () => {
    home = await createTempHome();
    stubHome(home);
    prompt.mockReset();
    prompt.mockImplementation(async () => "n");
    selectCity.mockReset();
    selectCity.mockImplementation(async () => null);
    log = spyOn(console, "log").mockImplementation(() => {});
  });

  afterEach(async () => {
    mock.restore();
    restoreEnvs();
    await removeTempHome(home);
  });

  test("sin selección no pide confirmación", async () => {
    const config = createConfig({ ciudades: [madrid], ciudadDefault: madrid.id });

    await removeCity(config);

    expect(prompt).not.toHaveBeenCalled();
    expect(config.ciudades).toEqual([madrid]);
  });

  test("la confirmación negativa cancela la eliminación", async () => {
    selectCity.mockResolvedValueOnce({ city: madrid, index: 0 });
    prompt.mockResolvedValueOnce("no");
    const config = createConfig({ ciudades: [madrid], ciudadDefault: madrid.id });

    await removeCity(config);

    expect(output()).toContain("Eliminación cancelada.");
    expect(config.ciudades).toEqual([madrid]);
  });

  test("confirma con sí, elimina y reasigna el default", async () => {
    selectCity.mockResolvedValueOnce({ city: madrid, index: 0 });
    prompt.mockResolvedValueOnce("sí");
    const config = createConfig({
      ciudades: [madrid, bogota],
      ciudadDefault: madrid.id,
    });

    await removeCity(config);

    expect(config.ciudades).toEqual([bogota]);
    expect(config.ciudadDefault).toBe(bogota.id);
    expect(await savedConfig()).toEqual(config);
    expect(output()).toContain("Ciudad eliminada.");
  });

  test("eliminar una ciudad no default conserva el default", async () => {
    selectCity.mockResolvedValueOnce({ city: bogota, index: 1 });
    prompt.mockResolvedValueOnce("s");
    const config = createConfig({
      ciudades: [madrid, bogota],
      ciudadDefault: madrid.id,
    });

    await removeCity(config);

    expect(config.ciudades).toEqual([madrid]);
    expect(config.ciudadDefault).toBe(madrid.id);
  });
});
