const CODES = {
  cyan: "\x1b[36m",
  yellow: "\x1b[33m",
  green: "\x1b[32m",
  red: "\x1b[31m",
} as const;

export type Color = keyof typeof CODES;

const RESET = "\x1b[0m";

function colorsEnabled(): boolean {
  if (process.env.NO_COLOR !== undefined) return false;
  if (process.env.FORCE_COLOR && process.env.FORCE_COLOR !== "0") return true;
  return Boolean(process.stdout.isTTY);
}

const enabled = colorsEnabled();

export function colorize(text: string, color: Color): string {
  return enabled ? `${CODES[color]}${text}${RESET}` : text;
}
