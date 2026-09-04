import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { GeminiConfigError, GeminiRequestError, generateWithGemini } from "@/lib/gemini";
import { resolveUserId } from "@/lib/session";
import { canEditStage } from "@/lib/permissions";
import { checkAiRateLimit } from "@/lib/ai-rate-limit";

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
  const episodeId = typeof body?.episodeId === "string" ? body.episodeId : "";
  const episodeTitle = typeof body?.episodeTitle === "string" ? body.episodeTitle.trim() : "";
  if (!episodeId || !episodeTitle) {
    return NextResponse.json({ error: "Episode dan judul episode wajib diisi." }, { status: 400 });
  }

  const allowed = await canEditStage(userId, episodeId, "RISET_OUTLINE");
  if (!allowed) {
    return NextResponse.json(
      { error: "Kamu tidak punya izin mengedit tahap Riset & Outline." },
      { status: 403 },
    );
  }

  if (!checkAiRateLimit(userId)) {
    return NextResponse.json(
      { error: "Terlalu banyak permintaan AI, coba lagi dalam satu menit." },
      { status: 429 },
    );
  }

  const prompt = `Buatkan draft 5-7 poin bicara (talking points) untuk episode podcast berjudul "${episodeTitle}", dalam Bahasa Indonesia. Satu poin per baris, singkat dan jelas, tanpa penomoran.`;

  try {
    const draft = await generateWithGemini(prompt);
    return NextResponse.json({ draft });
  } catch (error) {
    if (error instanceof GeminiConfigError || error instanceof GeminiRequestError) {
      return NextResponse.json({ error: error.message }, { status: 502 });
    }
    return NextResponse.json({ error: "Gagal membuat draft outline." }, { status: 500 });
  }
}
