import { mkdtemp, rm } from "node:fs/promises";
import { join } from "node:path";

const TEMP_ROOT = process.env.TEMP ?? process.env.TMP ?? process.env.TMPDIR ?? ".";
const originalEnv = new Map<string, string | undefined>();

export async function createTempHome(): Promise<string> {
  return mkdtemp(join(TEMP_ROOT, "weather-cli-test-"));
}

export async function removeTempHome(directory: string): Promise<void> {
  await rm(directory, { recursive: true, force: true });
}

export function stubEnv(name: string, value: string | undefined): void {
  if (!originalEnv.has(name)) originalEnv.set(name, process.env[name]);
  if (value === undefined) delete process.env[name];
  else process.env[name] = value;
}

export function restoreEnvs(): void {
  for (const [name, value] of originalEnv) {
    if (value === undefined) delete process.env[name];
    else process.env[name] = value;
  }
  originalEnv.clear();
}

/** `homedir()` lee estas variables en cada llamada en Bun. */
export function stubHome(directory: string): void {
  stubEnv("HOME", directory);
  stubEnv("USERPROFILE", directory);
}
