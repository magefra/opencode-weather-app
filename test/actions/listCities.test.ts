import { afterEach, beforeEach, describe, expect, spyOn, test, mock } from "bun:test";
import { listCities } from "../../src/actions/listCities";
import { bogota, createConfig, madrid } from "../helpers/fixtures";

let log: ReturnType<typeof spyOn>;

describe("actions/listCities", () => {
  beforeEach(() => {
    log = spyOn(console, "log").mockImplementation(() => {});
  });

  afterEach(() => {
    mock.restore();
  });

  test("avisa cuando no hay ciudades", () => {
    listCities(createConfig());

    expect(String(log.mock.calls[0]?.[0])).toContain("Aún no hay ciudades guardadas.");
    expect(log).toHaveBeenCalledTimes(1);
  });

  test("muestra todas las ciudades guardadas", () => {
    listCities(createConfig({ ciudades: [madrid, bogota] }));

    const lines = log.mock.calls.map((call: unknown[]) => String(call[0]));
    expect(lines).toHaveLength(2);
    expect(lines[0]).toContain("Madrid, España");
    expect(lines[1]).toContain("Bogotá, Colombia");
  });
});
