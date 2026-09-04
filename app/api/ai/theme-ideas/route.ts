import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { GeminiConfigError, GeminiRequestError, generateWithGemini } from "@/lib/gemini";
import { resolveUserId } from "@/lib/session";
import { checkAiRateLimit } from "@/lib/ai-rate-limit";

// No stage-based gating here (unlike outline-draft/show-notes-draft): a
// Bank Tema idea isn't tied to any episode yet, so there's no episodeId to
// check canEditStage() against. This matches the existing, deliberate
// choice in bank-tema/actions.ts to leave ThemeIdea CRUD ungated by stage
// permissions — gating just this AI-assisted path would make it stricter
// than typing the same idea manually, which would be inconsistent.
export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = await resolveUserId(session);
  if (!userId) {
    return NextResponse.json({ error: "Sesi tidak valid, silakan login ulang." }, { status: 401 });
  }
  if (!checkAiRateLimit(userId)) {
    return NextResponse.json(
      { error: "Terlalu banyak permintaan AI, coba lagi dalam satu menit." },
      { status: 429 },
    );
  }

  const body = await request.json().catch(() => null);
  const keyword = typeof body?.keyword === "string" ? body.keyword.trim() : "";
  if (!keyword) {
    return NextResponse.json({ error: "Kata kunci wajib diisi." }, { status: 400 });
  }

  const prompt = `Berikan 5 ide topik podcast terkait kata kunci "${keyword}", dalam Bahasa Indonesia. Satu ide per baris, tanpa penomoran, tanpa penjelasan tambahan, cukup judul ide yang singkat dan menarik.`;

  try {
    const text = await generateWithGemini(prompt);
    const ideas = text
      .split("\n")
      .map((line) => line.replace(/^[-*\d.]+\s*/, "").trim())
      .filter(Boolean);
    return NextResponse.json({ ideas });
  } catch (error) {
    if (error instanceof GeminiConfigError || error instanceof GeminiRequestError) {
      return NextResponse.json({ error: error.message }, { status: 502 });
    }
    return NextResponse.json({ error: "Gagal meminta ide AI." }, { status: 500 });
  }
}
