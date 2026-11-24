const CODIGOS = {
  cyan: "\x1b[36m",
  amarillo: "\x1b[33m",
  verde: "\x1b[32m",
  rojo: "\x1b[31m",
} as const;

export type Color = keyof typeof CODIGOS;

const RESET = "\x1b[0m";

function coloresHabilitados(): boolean {
  if (process.env.NO_COLOR !== undefined) return false;
  if (process.env.FORCE_COLOR && process.env.FORCE_COLOR !== "0") return true;
  return Boolean(process.stdout.isTTY);
}

const habilitados = coloresHabilitados();

export function colorear(texto: string, color: Color): string {
  return habilitados ? `${CODIGOS[color]}${texto}${RESET}` : texto;
}
