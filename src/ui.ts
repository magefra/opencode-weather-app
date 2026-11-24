import { createInterface } from "node:readline";
import { stdin as entrada, stdout as salida } from "node:process";
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

export function preguntar(mensaje: string): Promise<string> {
  salida.write(mensaje);
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
  console.log(LINEA);
  console.log("         WEATHER CLI");
  console.log(LINEA);
  console.log("  1. Clima de ciudad default");
  console.log(`  2. Clima de todas las ciudades (${config.ciudades.length})`);
  console.log("  3. Buscar y agregar ciudad");
  console.log("  4. Eliminar ciudad");
  console.log("  5. Establecer ciudad default");
  console.log(`  8. Ajustes (°${config.unidad})`);
  console.log("  9. Salir");
  console.log(LINEA);
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
  console.log(`  ${ciudad.nombre}, ${ciudad.pais}: ${temperatura} ${etiqueta}`);
}

export function imprimirError(error: unknown): void {
  const mensaje = error instanceof Error ? error.message : String(error);
  console.error(`  Error: ${mensaje}`);
}

export function mensaje(texto: string): void {
  console.log(`  ${texto}`);
}
