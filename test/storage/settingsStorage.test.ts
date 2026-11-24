import { readFile } from "node:fs/promises";
import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import { getConfigPath } from "../../src/storage/configFile";
import { getUnit, saveSettings, toggleUnit } from "../../src/storage/settingsStorage";
import { createConfig } from "../helpers/fixtures";
import { createTempHome, removeTempHome, restoreEnvs, stubHome } from "../helpers/temp";

let home: string;

describe("storage/settingsStorage", () => {
  beforeEach(async () => {
    home = await createTempHome();
    stubHome(home);
  });

  afterEach(async () => {
    restoreEnvs();
    await removeTempHome(home);
  });

  test("getUnit devuelve la unidad configurada", () => {
    expect(getUnit(createConfig({ unidad: "F" }))).toBe("F");
  });

  test("toggleUnit alterna C y F sobre la configuración", () => {
    const config = createConfig();

    expect(toggleUnit(config)).toBe("F");
    expect(config.unidad).toBe("F");
    expect(toggleUnit(config)).toBe("C");
    expect(config.unidad).toBe("C");
  });

  test("saveSettings persiste la unidad elegida", async () => {
    const config = createConfig({ unidad: "F" });

    await saveSettings(config);

    expect(JSON.parse(await readFile(getConfigPath(), "utf8"))).toEqual(config);
  });
});
