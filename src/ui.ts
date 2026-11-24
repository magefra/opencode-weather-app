import { createInterface } from "node:readline";
import { stdin as entrada, stdout as salida } from "node:process";
import { colorear } from "./colores";
import type { Ciudad, Configuracion, DiaPronostico } from "./types";

const LINEA = "═".repeat(40);

const DESCRIPCIONES_CLIMA: Record<number, string> = {
  0: "Despejado",
  1: "Principalmente despejado",
  2: "Parcialmente nublado",
  3: "Nublado",
  45: "Niebla",
  48: "Niebla con escarcha",
  51: "Llovizna ligera",
  53: "Llovizna",
  55: "Llovizna intensa",
  56: "Llovizna congelante ligera",
  57: "Llovizna congelante",
  61: "Lluvia ligera",
  63: "Lluvia",
  65: "Lluvia intensa",
  66: "Lluvia congelante ligera",
  67: "Lluvia congelante",
  71: "Nieve ligera",
  73: "Nieve",
  75: "Nieve intensa",
  77: "Granos de nieve",
  80: "Chubascos ligeros",
  81: "Chubascos",
  82: "Chubascos intensos",
  85: "Chubascos de nieve ligeros",
  86: "Chubascos de nieve",
  95: "Tormenta",
  96: "Tormenta con granizo ligero",
  99: "Tormenta con granizo",
};
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
    "  6. Pronóstico 7 días (ciudad default)",
    `  7. Pronóstico 7 días (todas las ciudades) (${config.ciudades.length})`,
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

export function imprimirPronostico(
  ciudad: Ciudad,
  dias: DiaPronostico[],
  etiqueta: string,
): void {
  console.log(
    colorear(`  Pronóstico a ${dias.length} días — ${ciudad.nombre}, ${ciudad.pais}`, "cyan"),
  );

  for (const dia of dias) {
    const fecha = new Date(`${dia.fecha}T12:00:00`).toLocaleDateString("es-ES", {
      weekday: "short",
      day: "numeric",
      month: "short",
    });
    const maxima = `${Math.round(dia.tempMax)}${etiqueta}`.padEnd(7);
    const minima = `${Math.round(dia.tempMin)}${etiqueta}`.padEnd(7);
    const clima = DESCRIPCIONES_CLIMA[dia.codigoClima] ?? "Desconocido";
    const lluvia =
      dia.probabilidadLluvia === null ? "" : `   Lluvia ${dia.probabilidadLluvia}%`;

    console.log(
      `  ${fecha.padEnd(12)} Máx ${colorear(maxima, "amarillo")} Mín ${colorear(minima, "amarillo")} ${clima}${lluvia}`,
    );
  }
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
