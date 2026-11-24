import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, mock, spyOn, test } from "bun:test";
import type { City } from "../../src/types/City";
import type { AppConfig } from "../../src/types/Settings";
import { bogota, createConfig, madrid } from "../helpers/fixtures";
import { createTempHome, removeTempHome, restoreEnvs, stubHome } from "../helpers/temp";

const selectCity = mock(
  async (_config: AppConfig, _instruction: string): Promise<{ city: City; index: number } | null> =>
    null,
);
mock.module("../../src/presentation/input", () => ({ selectCity }));

const { setDefaultCity } = await import("../../src/actions/setDefaultCity");

let home: string;
let log: ReturnType<typeof spyOn>;

describe("actions/setDefaultCity", () => {
  beforeEach(async () => {
    home = await createTempHome();
    stubHome(home);
    selectCity.mockReset();
    selectCity.mockImplementation(async () => null);
    log = spyOn(console, "log").mockImplementation(() => {});
  });

  afterEach(async () => {
    mock.restore();
    restoreEnvs();
    await removeTempHome(home);
  });

  test("sin selección no cambia ni persiste nada", async () => {
    const config = createConfig({ ciudades: [madrid], ciudadDefault: madrid.id });

    await setDefaultCity(config);

    expect(config.ciudadDefault).toBe(madrid.id);
    expect(log).not.toHaveBeenCalled();
  });

  test("guarda la nueva ciudad default", async () => {
    selectCity.mockResolvedValueOnce({ city: bogota, index: 1 });
    const config = createConfig({
      ciudades: [madrid, bogota],
      ciudadDefault: madrid.id,
    });

    await setDefaultCity(config);

    expect(config.ciudadDefault).toBe(bogota.id);
    const content = await readFile(join(home, ".weather-cli", "config.json"), "utf8");
    expect(JSON.parse(content) as AppConfig).toEqual(config);
    expect(String(log.mock.calls[0]?.[0])).toContain("Ciudad default: Bogotá, Colombia.");
  });
});
