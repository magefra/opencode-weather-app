import { EventEmitter } from "node:events";
import { afterEach, beforeEach, describe, expect, mock, spyOn, test } from "bun:test";
import type { AppConfig } from "../../src/types/Settings";
import { bogota, createConfig, madrid } from "../helpers/fixtures";

const listCitiesMock = mock((_config: AppConfig): void => {});
const fakeReader = Object.assign(new EventEmitter(), {
  close: mock((): void => {}),
});

mock.module("node:readline", () => ({ createInterface: () => fakeReader }));
mock.module("../../src/actions/listCities", () => ({ listCities: listCitiesMock }));

const { closeInput, prompt, selectCity } = await import(
  "../../src/presentation/input"
);

describe("presentation/input", () => {
  beforeEach(() => {
    listCitiesMock.mockClear();
    fakeReader.close.mockClear();
    spyOn(console, "log").mockImplementation(() => {});
    spyOn(process.stdout, "write").mockImplementation(() => true);
  });

  afterEach(() => {
    mock.restore();
  });

  test("prompt escribe el texto y resuelve con la línea recibida", async () => {
    const promise = prompt("  Nombre: ");
    expect(process.stdout.write).toHaveBeenCalledWith(expect.stringContaining("Nombre:"));

    fakeReader.emit("line", " Madrid ");
    expect(await promise).toBe(" Madrid ");
  });

  test("prompt consume las líneas pendientes en orden", async () => {
    fakeReader.emit("line", "primera");
    fakeReader.emit("line", "segunda");

    expect(await prompt("a")).toBe("primera");
    expect(await prompt("b")).toBe("segunda");
  });

  test("selectCity sin ciudades avisa y devuelve null", async () => {
    expect(await selectCity(createConfig(), "  Número: ")).toBeNull();
    expect(listCitiesMock).not.toHaveBeenCalled();
  });

  test("selectCity devuelve la ciudad y el índice elegidos", async () => {
    const config = createConfig({ ciudades: [madrid, bogota] });
    const promise = selectCity(config, "  Número: ");

    fakeReader.emit("line", "2");

    expect(await promise).toEqual({ city: bogota, index: 1 });
    expect(listCitiesMock).toHaveBeenCalledWith(config);
  });

  test("selectCity rechaza una selección inválida", async () => {
    const config = createConfig({ ciudades: [madrid] });
    const promise = selectCity(config, "  Número: ");

    fakeReader.emit("line", "no es un número");

    expect(await promise).toBeNull();
  });

  test("closeInput cierra el lector", () => {
    closeInput();

    expect(fakeReader.close).toHaveBeenCalledTimes(1);
  });
});
