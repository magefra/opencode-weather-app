import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import { restoreEnvs, stubEnv } from "../helpers/temp";

let importCount = 0;

/** El query fuerza una nueva evaluación del módulo sin vi.resetModules(). */
async function importColors() {
  importCount += 1;
  return import(`../../src/utils/colors.ts?case=${importCount}`);
}

describe("utils/colors", () => {
  beforeEach(() => {
    restoreEnvs();
  });

  afterEach(() => {
    restoreEnvs();
  });

  test("NO_COLOR desactiva los códigos ANSI", async () => {
    stubEnv("NO_COLOR", "1");
    stubEnv("FORCE_COLOR", undefined);
    const { colorize } = await importColors();

    expect(colorize("Madrid", "green")).toBe("Madrid");
  });

  test("FORCE_COLOR activa los códigos ANSI aunque no haya TTY", async () => {
    stubEnv("NO_COLOR", undefined);
    stubEnv("FORCE_COLOR", "1");
    const { colorize } = await importColors();

    expect(colorize("22°C", "yellow")).toBe("\x1b[33m22°C\x1b[0m");
    expect(colorize("Error", "red")).toBe("\x1b[31mError\x1b[0m");
  });
});
