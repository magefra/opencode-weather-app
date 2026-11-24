import { createInterface } from "node:readline";
import { stdin as entrada, stdout as salida } from "node:process";
import { colorear } from "./colores";
import type { Ciudad, Configuracion } from "./types";

const LINEA = "═".repeat(40);
const lineasPendientes: string[] = [];
let resolverLinea: ((valor: string) => void) | null = null;
let rechazarLinea: ((error: Error) => void) | null = null;

const lector = createInterface({ input: entrada, output: salida });

lector.on("line", (linea) => {
  if (resolverLinea) {
    const resolver = resolverLinea;
    resolverLinea = null;
    rechazarLinea = null;
    resolver(linea);
  } else {
    lineasPendientes.push(linea);
  }
});

lector.on("close", () => {
  if (rechazarLinea) rechazarLinea(new Error("Se cerró la entrada de datos."));
  resolverLinea = null;
  rechazarLinea = null;
});

export function preguntar(texto: string): Promise<string> {
  salida.write(colorear(texto, "cyan"));
  const pendiente = lineasPendientes.shift();
  if (pendiente !== undefined) return Promise.resolve(pendiente);

  return new Promise<string>((resolve, reject) => {
    resolverLinea = resolve;
    rechazarLinea = reject;
  });
}

export function cerrarEntrada(): void {
  lector.close();
}

export function imprimirMenu(config: Configuracion): void {
  const lineas = [
    LINEA,
    "         WEATHER CLI",
    LINEA,
    "  1. Clima de ciudad default",
    `  2. Clima de todas las ciudades (${config.ciudades.length})`,
    "  3. Buscar y agregar ciudad",
    "  4. Eliminar ciudad",
    "  5. Establecer ciudad default",
    `  8. Ajustes (°${config.unidad})`,
    "  9. Salir",
    LINEA,
  ];
  console.log(colorear(lineas.join("\n"), "cyan"));
}

export function listarCiudades(ciudades: Ciudad[]): void {
  ciudades.forEach((ciudad, indice) => {
    console.log(`  ${indice + 1}. ${ciudad.nombre}, ${ciudad.pais}`);
  });
}

export function imprimirClima(
  ciudad: Ciudad,
  temperatura: number,
  etiqueta: string,
): void {
  const valor = colorear(`${temperatura} ${etiqueta}`, "amarillo");
  console.log(`  ${ciudad.nombre}, ${ciudad.pais}: ${valor}`);
}

export function imprimirError(error: unknown): void {
  const mensaje = error instanceof Error ? error.message : String(error);
  console.error(colorear(`  Error: ${mensaje}`, "rojo"));
}

export function mensaje(texto: string): void {
  console.log(`  ${texto}`);
}

export function mensajeExito(texto: string): void {
  console.log(colorear(`  ${texto}`, "verde"));
}
