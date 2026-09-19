// gemini-2.0-flash was retired by Google; its API error pointed to this
// as the replacement (confirmed working via direct API calls with a real
// key — see PR that changed this constant).
const DEFAULT_MODEL = "gemini-3.6-flash";

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

// Fixed to Gemini's image-generation model ("Nano Banana") rather than
// reading GEMINI_MODEL/DEFAULT_MODEL above, since that env var configures
// the text model and the two aren't interchangeable.
const IMAGE_MODEL = "gemini-2.5-flash-image";

export interface GeneratedImage {
  mimeType: string;
  base64: string;
}

/**
 * Image-generation counterpart to generateWithGemini() — same key/error
 * handling, but requests IMAGE output and returns the inline base64 image
 * data instead of text. Never called from the client, same as above.
 */
export async function generateImageWithGemini(
  prompt: string,
  apiKeyOverride?: string,
): Promise<GeneratedImage> {
  const apiKey = apiKeyOverride || process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new GeminiConfigError("GEMINI_API_KEY belum diisi di .env.");
  }

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${IMAGE_MODEL}:generateContent`;

  let response: Response;
  try {
    response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-goog-api-key": apiKey },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { responseModalities: ["TEXT", "IMAGE"] },
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
  const parts: Array<{ inlineData?: { data?: string; mimeType?: string } }> =
    data?.candidates?.[0]?.content?.parts ?? [];
  const imagePart = parts.find((part) => part?.inlineData?.data);
  if (!imagePart?.inlineData?.data) {
    throw new GeminiRequestError("Gemini API tidak mengembalikan gambar yang bisa dipakai.");
  }

  return {
    mimeType: imagePart.inlineData.mimeType || "image/png",
    base64: imagePart.inlineData.data,
  };
}
