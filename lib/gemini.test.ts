import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { GeminiConfigError, GeminiRequestError, generateWithGemini } from "./gemini";

const originalEnv = { ...process.env };

beforeEach(() => {
  process.env.GEMINI_API_KEY = "test-api-key";
  process.env.GEMINI_MODEL = "gemini-2.0-flash";
});

afterEach(() => {
  process.env = { ...originalEnv };
  vi.unstubAllGlobals();
});

describe("generateWithGemini", () => {
  it("throws GeminiConfigError when no API key is configured", async () => {
    delete process.env.GEMINI_API_KEY;
    await expect(generateWithGemini("halo")).rejects.toThrow(GeminiConfigError);
  });

  it("sends the API key as a header, not a URL query param", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ candidates: [{ content: { parts: [{ text: "hasil" }] } }] }),
    });
    vi.stubGlobal("fetch", fetchMock);

    await generateWithGemini("halo");

    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [url, options] = fetchMock.mock.calls[0];
    expect(url).not.toContain("test-api-key");
    expect(url).not.toContain("key=");
    expect(options.headers["x-goog-api-key"]).toBe("test-api-key");
  });

  it("throws GeminiRequestError with a clear message on a 429", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({ ok: false, status: 429 }),
    );
    await expect(generateWithGemini("halo")).rejects.toThrow(GeminiRequestError);
  });

  it("returns the trimmed text from the first candidate", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ candidates: [{ content: { parts: [{ text: "  hasil AI  " }] } }] }),
      }),
    );
    await expect(generateWithGemini("halo")).resolves.toBe("hasil AI");
  });
});
