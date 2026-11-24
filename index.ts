import { buscarCoordenadas, obtenerClima } from "./src/api";
import { cargarConfiguracion, guardarConfiguracion } from "./src/storage";
import {
  cerrarEntrada,
  imprimirClima,
  imprimirError,
  imprimirMenu,
  listarCiudades,
  mensaje,
  preguntar,
} from "./src/ui";
import type { Ciudad, Configuracion } from "./src/types";

const config: Configuracion = await cargarConfiguracion();

function guardar(): Promise<void> {
  return guardarConfiguracion(config);
}

async function consultarClima(ciudad: Ciudad): Promise<void> {
  try {
    const { temperatura, etiqueta } = await obtenerClima(ciudad, config.unidad);
    imprimirClima(ciudad, temperatura, etiqueta);
  } catch (error) {
    imprimirError(error);
  }
}

async function elegirCiudad(
  instruccion: string,
): Promise<{ ciudad: Ciudad; indice: number } | null> {
  if (config.ciudades.length === 0) {
    mensaje("Aún no hay ciudades guardadas. Usa la opción 3 para agregar una.");
    return null;
  }

  listarCiudades(config.ciudades);
  const respuesta = (await preguntar(instruccion)).trim();
  const indice = Number(respuesta) - 1;
  const ciudad = config.ciudades[indice];

  if (!Number.isInteger(indice) || !ciudad) {
    mensaje("Selección inválida.");
    return null;
  }

  return { ciudad, indice };
}

async function opcionClimaDefault(): Promise<void> {
  const ciudad = config.ciudades.find((item) => item.id === config.ciudadDefault);
  if (!ciudad) {
    mensaje("No hay ciudad default. Usa la opción 3 o la opción 5 para elegir una.");
    return;
  }
  await consultarClima(ciudad);
}

async function opcionTodasLasCiudades(): Promise<void> {
  if (config.ciudades.length === 0) {
    mensaje("Aún no hay ciudades guardadas. Usa la opción 3 para agregar una.");
    return;
  }
  for (const ciudad of config.ciudades) {
    await consultarClima(ciudad);
  }
}

async function opcionAgregarCiudad(): Promise<void> {
  const nombre = (await preguntar("  Nombre de la ciudad: ")).trim();
  if (!nombre) {
    mensaje("No ingresaste el nombre de una ciudad.");
    return;
  }

  mensaje("Buscando la ciudad...");
  let encontrada: Ciudad | null;
  try {
    encontrada = await buscarCoordenadas(nombre);
  } catch (error) {
    imprimirError(error);
    return;
  }

  if (!encontrada) {
    mensaje(`No encontramos una ciudad llamada "${nombre}".`);
    return;
  }

  const ciudad = encontrada;
  if (config.ciudades.some((item) => item.id === ciudad.id)) {
    mensaje(`${ciudad.nombre}, ${ciudad.pais} ya está en la lista.`);
    return;
  }

  config.ciudades.push(ciudad);
  if (config.ciudadDefault === null) config.ciudadDefault = ciudad.id;
  await guardar();
  mensaje(`Ciudad agregada: ${ciudad.nombre}, ${ciudad.pais}.`);
}

async function opcionEliminarCiudad(): Promise<void> {
  const seleccion = await elegirCiudad("  Número de la ciudad a eliminar: ");
  if (!seleccion) return;

  const respuesta = (await preguntar(`  ¿Eliminar ${seleccion.ciudad.nombre}? (s/n): `))
    .trim()
    .toLowerCase();
  if (respuesta !== "s" && respuesta !== "si" && respuesta !== "sí") {
    mensaje("Eliminación cancelada.");
    return;
  }

  config.ciudades.splice(seleccion.indice, 1);
  if (config.ciudadDefault === seleccion.ciudad.id) {
    config.ciudadDefault = config.ciudades[0]?.id ?? null;
  }
  await guardar();
  mensaje("Ciudad eliminada.");
}

async function opcionEstablecerDefault(): Promise<void> {
  const seleccion = await elegirCiudad("  Número de la ciudad default: ");
  if (!seleccion) return;

  config.ciudadDefault = seleccion.ciudad.id;
  await guardar();
  mensaje(`Ciudad default: ${seleccion.ciudad.nombre}, ${seleccion.ciudad.pais}.`);
}

async function opcionAjustes(): Promise<void> {
  config.unidad = config.unidad === "C" ? "F" : "C";
  await guardar();
  mensaje(`Unidad de temperatura cambiada a °${config.unidad}.`);
}

async function main(): Promise<void> {
  while (true) {
    imprimirMenu(config);
    const opcion = (await preguntar("  Selecciona una opción: ")).trim();

    switch (opcion) {
      case "1":
        await opcionClimaDefault();
        break;
      case "2":
        await opcionTodasLasCiudades();
        break;
      case "3":
        await opcionAgregarCiudad();
        break;
      case "4":
        await opcionEliminarCiudad();
        break;
      case "5":
        await opcionEstablecerDefault();
        break;
      case "8":
        await opcionAjustes();
        break;
      case "9":
        mensaje("¡Hasta luego!");
        return;
      default:
        mensaje("Opción inválida. Elige 1, 2, 3, 4, 5, 8 o 9.");
    }

    console.log();
  }
}

try {
  await main();
} catch (error) {
  imprimirError(error);
} finally {
  cerrarEntrada();
}
