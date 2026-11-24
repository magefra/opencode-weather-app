import { afterEach, describe, expect, mock, test } from "bun:test";
import { requestJson } from "../../src/api/client";

const originalFetch = globalThis.fetch;

function setFetch(value: typeof fetch): void {
  globalThis.fetch = value;
}

describe("api/client", () => {
  afterEach(() => {
    setFetch(originalFetch);
  });

  test("requestJson devuelve el JSON parseado", async () => {
    const fetchMock = mock(
      async (_input: URL | Request | string, _init?: RequestInit) =>
        Response.json({ ok: true }, { status: 200 }),
    );
    setFetch(fetchMock as unknown as typeof fetch);
    const url = new URL("https://example.test/data?a=1");

    const result = await requestJson<{ ok: boolean }>(url);

    expect(result).toEqual({ ok: true });
    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [receivedUrl, options] = fetchMock.mock.calls[0] ?? [];
    expect(receivedUrl).toBeInstanceOf(URL);
    expect(String(receivedUrl)).toBe(url.toString());
    expect(options?.signal).toBeInstanceOf(AbortSignal);
  });

  test("requestJson lanza un error con el código HTTP cuando la respuesta falla", async () => {
    setFetch(mock(async () => new Response(null, { status: 503 })) as unknown as typeof fetch);

    await expect(requestJson(new URL("https://example.test"))).rejects.toThrow(
      "Open-Meteo respondió con el código HTTP 503.",
    );
  });

  test("requestJson traduce los fallos de red", async () => {
    setFetch(mock(async () => Promise.reject(new Error("ECONNRESET"))) as unknown as typeof fetch);

    await expect(requestJson(new URL("https://example.test"))).rejects.toThrow(
      "No se pudo conectar con Open-Meteo. Revisa tu conexión a internet.",
    );
  });
});
