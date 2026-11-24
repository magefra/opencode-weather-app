import { stdin as inputStream, stdout as outputStream } from "node:process";
import { createInterface } from "node:readline";
import { listCities } from "../actions/listCities";
import type { City } from "../types/City";
import type { AppConfig } from "../types/Settings";
import { colorize } from "../utils/colors";
import { message } from "./output";

const pendingLines: string[] = [];
let resolveLine: ((value: string) => void) | null = null;
let rejectLine: ((error: Error) => void) | null = null;

const reader = createInterface({ input: inputStream, output: outputStream });

reader.on("line", (line) => {
  if (resolveLine) {
    const resolve = resolveLine;
    resolveLine = null;
    rejectLine = null;
    resolve(line);
  } else {
    pendingLines.push(line);
  }
});

reader.on("close", () => {
  if (rejectLine) rejectLine(new Error("Se cerró la entrada de datos."));
  resolveLine = null;
  rejectLine = null;
});

export function prompt(text: string): Promise<string> {
  outputStream.write(colorize(text, "cyan"));
  const pending = pendingLines.shift();
  if (pending !== undefined) return Promise.resolve(pending);

  return new Promise<string>((resolve, reject) => {
    resolveLine = resolve;
    rejectLine = reject;
  });
}

export function closeInput(): void {
  reader.close();
}

export async function selectCity(
  config: AppConfig,
  instruction: string,
): Promise<{ city: City; index: number } | null> {
  if (config.ciudades.length === 0) {
    message("Aún no hay ciudades guardadas. Usa la opción 3 para agregar una.");
    return null;
  }

  listCities(config);
  const answer = (await prompt(instruction)).trim();
  const index = Number(answer) - 1;
  const city = config.ciudades[index];

  if (!Number.isInteger(index) || !city) {
    message("Selección inválida.");
    return null;
  }

  return { city, index };
}
