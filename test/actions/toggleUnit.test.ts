import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, mock, spyOn, test } from "bun:test";
import type { AppConfig } from "../../src/types/Settings";
import { createConfig } from "../helpers/fixtures";
import { createTempHome, removeTempHome, restoreEnvs, stubHome } from "../helpers/temp";

const { toggleUnit } = await import("../../src/actions/toggleUnit");

let home: string;
let log: ReturnType<typeof spyOn>;

async function savedUnit(): Promise<AppConfig["unidad"]> {
  const content = await readFile(join(home, ".weather-cli", "config.json"), "utf8");
  return (JSON.parse(content) as AppConfig).unidad;
}

describe("actions/toggleUnit", () => {
  beforeEach(async () => {
    home = await createTempHome();
    stubHome(home);
    log = spyOn(console, "log").mockImplementation(() => {});
  });

  afterEach(async () => {
    mock.restore();
    restoreEnvs();
    await removeTempHome(home);
  });

  test("cambia de C a F y persiste el ajuste", async () => {
    const config = createConfig();

    await toggleUnit(config);

    expect(config.unidad).toBe("F");
    expect(await savedUnit()).toBe("F");
    expect(String(log.mock.calls[0]?.[0])).toContain("cambiada a °F");
  });

  test("cambia de F a C y persiste el ajuste", async () => {
    const config = createConfig({ unidad: "F" });

    await toggleUnit(config);

    expect(config.unidad).toBe("C");
    expect(await savedUnit()).toBe("C");
  });
});
