import { readFile } from "node:fs/promises";
import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import { getConfigPath } from "../../src/storage/configFile";
import {
  addCity,
  findCity,
  getCities,
  hasCity,
  removeCityAt,
  saveCities,
  setDefaultCity,
} from "../../src/storage/citiesStorage";
import { bogota, createConfig, madrid } from "../helpers/fixtures";
import { createTempHome, removeTempHome, restoreEnvs, stubHome } from "../helpers/temp";

let home: string;

describe("storage/citiesStorage", () => {
  beforeEach(async () => {
    home = await createTempHome();
    stubHome(home);
  });

  afterEach(async () => {
    restoreEnvs();
    await removeTempHome(home);
  });

  test("getCities devuelve la lista de la configuración", () => {
    const config = createConfig({ ciudades: [madrid] });

    expect(getCities(config)).toBe(config.ciudades);
  });

  test("findCity busca por id y devuelve undefined para null", () => {
    const config = createConfig({ ciudades: [madrid, bogota] });

    expect(findCity(config, bogota.id)).toBe(bogota);
    expect(findCity(config, null)).toBeUndefined();
    expect(findCity(config, 999)).toBeUndefined();
  });

  test("hasCity comprueba la existencia por id", () => {
    const config = createConfig({ ciudades: [madrid] });

    expect(hasCity(config, madrid.id)).toBe(true);
    expect(hasCity(config, bogota.id)).toBe(false);
  });

  test("addCity agrega y fija como default la primera ciudad", () => {
    const config = createConfig();

    addCity(config, madrid);

    expect(config.ciudades).toEqual([madrid]);
    expect(config.ciudadDefault).toBe(madrid.id);
  });

  test("addCity no sobrescribe una ciudad default existente", () => {
    const config = createConfig({ ciudades: [madrid], ciudadDefault: madrid.id });

    addCity(config, bogota);

    expect(config.ciudadDefault).toBe(madrid.id);
    expect(config.ciudades).toHaveLength(2);
  });

  test("removeCityAt reasigna el default al eliminar la ciudad default", () => {
    const config = createConfig({
      ciudades: [madrid, bogota],
      ciudadDefault: madrid.id,
    });

    removeCityAt(config, 0);

    expect(config.ciudades).toEqual([bogota]);
    expect(config.ciudadDefault).toBe(bogota.id);
  });

  test("removeCityAt deja el default en null al vaciar la lista", () => {
    const config = createConfig({ ciudades: [madrid], ciudadDefault: madrid.id });

    removeCityAt(config, 0);

    expect(config.ciudades).toEqual([]);
    expect(config.ciudadDefault).toBeNull();
  });

  test("setDefaultCity actualiza el id guardado", () => {
    const config = createConfig({ ciudades: [madrid, bogota] });

    setDefaultCity(config, bogota);

    expect(config.ciudadDefault).toBe(bogota.id);
  });

  test("saveCities persiste la configuración", async () => {
    const config = createConfig({ ciudades: [madrid, bogota], ciudadDefault: bogota.id });

    await saveCities(config);

    expect(JSON.parse(await readFile(getConfigPath(), "utf8"))).toEqual(config);
  });
});
