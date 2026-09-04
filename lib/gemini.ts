const DEFAULT_MODEL = "gemini-2.0-flash";

export class GeminiConfigError extends Error {}
export class GeminiRequestError extends Error {}

/**
 * Thin wrapper over the Gemini REST API. Never called from the client —
 * the API key stays server-side (see PRD.md: credentials in .env, never
 * hardcoded, never sent to the browser).
 *
 * `apiKeyOverride` lets a caller use a specific user's own Gemini key
 * (see lib/user-gemini-key.ts) instead of the workspace-wide env var.
 */
export async function generateWithGemini(prompt: string, apiKeyOverride?: string): Promise<string> {
  const apiKey = apiKeyOverride || process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new GeminiConfigError("GEMINI_API_KEY belum diisi di .env.");
  }

  const model = process.env.GEMINI_MODEL || DEFAULT_MODEL;
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`;

  let response: Response;
  try {
    // The key goes in a header rather than the ?key= query param (both are
    // accepted by this API) so it never ends up in server access logs or
    // any request-URL logging middleware.
    response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-goog-api-key": apiKey },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
      }),
    });
  } catch {
    throw new GeminiRequestError("Tidak bisa menghubungi Gemini API (masalah koneksi).");
  }

  if (!response.ok) {
    if (response.status === 429) {
      throw new GeminiRequestError("Kuota Gemini API habis, coba lagi nanti.");
    }
    throw new GeminiRequestError(`Gemini API mengembalikan error (${response.status}).`);
  }

  const data = await response.json();
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (typeof text !== "string" || !text.trim()) {
    throw new GeminiRequestError("Gemini API tidak mengembalikan hasil yang bisa dipakai.");
  }

  return text.trim();
}
