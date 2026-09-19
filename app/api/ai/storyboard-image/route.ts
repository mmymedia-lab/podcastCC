import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { GeminiConfigError, GeminiRequestError, generateImageWithGemini } from "@/lib/gemini";
import { resolveUserId } from "@/lib/session";
import { canEditProjectStage } from "@/lib/permissions";
import { checkAiRateLimit } from "@/lib/ai-rate-limit";
import { getUserGeminiApiKey } from "@/lib/user-gemini-key";

// Wraps the user's scene description in the storyboard-panel conventions
// research turned up: rough pencil-sketch style (not a finished/realistic
// render), simple camera-direction annotation, explicit aspect ratio —
// these keep results looking like a storyboard panel instead of concept art.
function buildStoryboardPrompt(description: string): string {
  return (
    `Gambarkan satu panel storyboard bergaya sketsa pensil kasar hitam-putih ` +
    `(rough pencil sketch, bukan render realistis berwarna), untuk adegan berikut: ` +
    `"${description}". Sertakan anotasi panah sederhana untuk arah gerakan kamera atau ` +
    `subjek jika relevan pada adegan tersebut. Fokus pada komposisi, framing, dan blocking, ` +
    `bukan detail wajah/tekstur yang realistis. Rasio aspek 16:9.`
  );
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = await resolveUserId(session);
  if (!userId) {
    return NextResponse.json({ error: "Sesi tidak valid, silakan login ulang." }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const projectId = typeof body?.projectId === "string" ? body.projectId : "";
  const description = typeof body?.description === "string" ? body.description.trim() : "";
  if (!projectId || !description) {
    return NextResponse.json({ error: "Proyek dan deskripsi adegan wajib diisi." }, { status: 400 });
  }

  const allowed = await canEditProjectStage(userId, projectId, "PRA_PRODUKSI");
  if (!allowed) {
    return NextResponse.json(
      { error: "Kamu tidak punya izin mengedit tahap Pra-Produksi." },
      { status: 403 },
    );
  }

  if (!checkAiRateLimit(userId)) {
    return NextResponse.json(
      { error: "Terlalu banyak permintaan AI, coba lagi dalam satu menit." },
      { status: 429 },
    );
  }

  try {
    const userApiKey = await getUserGeminiApiKey(userId);
    const image = await generateImageWithGemini(buildStoryboardPrompt(description), userApiKey);
    return NextResponse.json(image);
  } catch (error) {
    if (error instanceof GeminiConfigError || error instanceof GeminiRequestError) {
      return NextResponse.json({ error: error.message }, { status: 502 });
    }
    return NextResponse.json({ error: "Gagal membuat gambar storyboard." }, { status: 500 });
  }
}
