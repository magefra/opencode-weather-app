import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import { getConfigPath, loadConfig, saveConfig } from "../../src/storage/configFile";
import type { AppConfig } from "../../src/types/Settings";
import { bogota, madrid } from "../helpers/fixtures";
import { createTempHome, removeTempHome, restoreEnvs, stubHome } from "../helpers/temp";

let home: string;

async function writeRawConfig(content: string): Promise<void> {
  const file = getConfigPath();
  await mkdir(dirname(file), { recursive: true });
  await writeFile(file, content);
}

describe("storage/configFile", () => {
  beforeEach(async () => {
    home = await createTempHome();
    stubHome(home);
  });

  afterEach(async () => {
    restoreEnvs();
    await removeTempHome(home);
  });

  test("loadConfig devuelve la configuración inicial si no existe el archivo", async () => {
    expect(await loadConfig()).toEqual({
      ciudades: [],
      ciudadDefault: null,
      unidad: "C",
    });
  });

  test("saveConfig escribe en ~/.weather-cli/config.json con salto final", async () => {
    const config: AppConfig = {
      ciudades: [madrid],
      ciudadDefault: madrid.id,
      unidad: "F",
    };

    await saveConfig(config);

    const expectedPath = join(home, ".weather-cli", "config.json");
    expect(getConfigPath()).toBe(expectedPath);
    expect(await readFile(expectedPath, "utf8")).toBe(
      `${JSON.stringify(config, null, 2)}\n`,
    );
  });

  test("loadConfig respeta una configuración válida", async () => {
    const config: AppConfig = {
      ciudades: [madrid, bogota],
      ciudadDefault: bogota.id,
      unidad: "F",
    };
    await saveConfig(config);

    expect(await loadConfig()).toEqual(config);
  });

  test("loadConfig descarta una ciudad default que ya no existe", async () => {
    await writeRawConfig(
      JSON.stringify({ ciudades: [madrid], ciudadDefault: 999, unidad: "C" }),
    );

    expect(await loadConfig()).toEqual({
      ciudades: [madrid],
      ciudadDefault: null,
      unidad: "C",
    });
  });

  test("loadConfig vuelve al inicial ante JSON inválido", async () => {
    await writeRawConfig("{ esto no es json");

    expect(await loadConfig()).toEqual({
      ciudades: [],
      ciudadDefault: null,
      unidad: "C",
    });
  });

  test("loadConfig vuelve al inicial ante una forma inválida", async () => {
    await writeRawConfig(
      JSON.stringify({ ciudades: [madrid], ciudadDefault: null, unidad: "K" }),
    );

    expect(await loadConfig()).toEqual({
      ciudades: [],
      ciudadDefault: null,
      unidad: "C",
    });
  });
});
