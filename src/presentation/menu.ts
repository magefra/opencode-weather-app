import { addCity } from "../actions/addCity";
import { getDefaultForecast, getAllCitiesForecast } from "../actions/getForecast";
import { getDefaultWeather, getAllCitiesWeather } from "../actions/getWeather";
import { removeCity } from "../actions/removeCity";
import { setDefaultCity } from "../actions/setDefaultCity";
import { toggleUnit } from "../actions/toggleUnit";
import { getCities } from "../storage/citiesStorage";
import { getUnit } from "../storage/settingsStorage";
import type { AppConfig } from "../types/Settings";
import type { MenuOption } from "../types/MenuOption";
import { colorize } from "../utils/colors";
import { MENU_LINE } from "../utils/constants";
import { prompt } from "./input";
import { message } from "./output";

function buildOptions(config: AppConfig): MenuOption[] {
  const count = getCities(config).length;

  return [
    {
      key: "1",
      label: "Clima de ciudad default",
      run: async () => {
        await getDefaultWeather(config);
        return true;
      },
    },
    {
      key: "2",
      label: `Clima de todas las ciudades (${count})`,
      run: async () => {
        await getAllCitiesWeather(config);
        return true;
      },
    },
    {
      key: "3",
      label: "Buscar y agregar ciudad",
      run: async () => {
        await addCity(config);
        return true;
      },
    },
    {
      key: "4",
      label: "Eliminar ciudad",
      run: async () => {
        await removeCity(config);
        return true;
      },
    },
    {
      key: "5",
      label: "Establecer ciudad default",
      run: async () => {
        await setDefaultCity(config);
        return true;
      },
    },
    {
      key: "6",
      label: "Pronóstico 7 días (ciudad default)",
      run: async () => {
        await getDefaultForecast(config);
        return true;
      },
    },
    {
      key: "7",
      label: `Pronóstico 7 días (todas las ciudades) (${count})`,
      run: async () => {
        await getAllCitiesForecast(config);
        return true;
      },
    },
    {
      key: "8",
      label: `Ajustes (°${getUnit(config)})`,
      run: async () => {
        await toggleUnit(config);
        return true;
      },
    },
    {
      key: "9",
      label: "Salir",
      run: async () => {
        message("¡Hasta luego!");
        return false;
      },
    },
  ];
}

function renderMenu(options: MenuOption[]): void {
  const lines = [
    MENU_LINE,
    "         WEATHER CLI",
    MENU_LINE,
    ...options.map((option) => `  ${option.key}. ${option.label}`),
    MENU_LINE,
  ];
  console.log(colorize(lines.join("\n"), "cyan"));
}

export async function runMenu(config: AppConfig): Promise<void> {
  while (true) {
    const options = buildOptions(config);
    renderMenu(options);
    const answer = (await prompt("  Selecciona una opción: ")).trim();
    const selected = options.find((option) => option.key === answer);

    if (!selected) {
      message("Opción inválida. Elige 1, 2, 3, 4, 5, 6, 7, 8 o 9.");
    } else if (!(await selected.run())) {
      return;
    }

    console.log();
  }
}
