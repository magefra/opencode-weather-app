import { describe, expect, test } from "bun:test";
import { describeWeatherCode, formatDate, formatTemperature } from "../../src/utils/format";

describe("utils/format", () => {
  test("formatDate muestra el día y el mes en español", () => {
    const result = formatDate("2026-11-24");

    expect(result).toContain("24");
    expect(result.toLowerCase()).toContain("nov");
  });

  test("formatTemperature redondea y conserva la unidad", () => {
    expect(formatTemperature(21.6, "°C")).toBe("22°C");
    expect(formatTemperature(-3.2, "°F")).toBe("-3°F");
    expect(formatTemperature(18, "°C")).toBe("18°C");
  });

  test("describeWeatherCode traduce códigos conocidos", () => {
    expect(describeWeatherCode(0)).toBe("Despejado");
    expect(describeWeatherCode(45)).toBe("Niebla");
    expect(describeWeatherCode(95)).toBe("Tormenta");
  });

  test("describeWeatherCode usa Desconocido para códigos no mapeados", () => {
    expect(describeWeatherCode(999)).toBe("Desconocido");
  });
});
