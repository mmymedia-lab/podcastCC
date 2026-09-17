import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { GeminiConfigError, GeminiRequestError, generateWithGemini } from "@/lib/gemini";
import { resolveUserId } from "@/lib/session";
import { canEditProjectStage } from "@/lib/permissions";
import { checkAiRateLimit } from "@/lib/ai-rate-limit";
import { getUserGeminiApiKey } from "@/lib/user-gemini-key";

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
  const projectTitle = typeof body?.projectTitle === "string" ? body.projectTitle.trim() : "";
  if (!projectId || !projectTitle) {
    return NextResponse.json({ error: "Proyek dan judul proyek wajib diisi." }, { status: 400 });
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

  const prompt = `Berikan 5 saran shot (pengambilan gambar) untuk video berjudul "${projectTitle}", dalam Bahasa Indonesia. Satu shot per baris, deskripsi singkat pengambilan gambarnya, tanpa penomoran, tanpa penjelasan tambahan.`;

  try {
    const userApiKey = await getUserGeminiApiKey(userId);
    const text = await generateWithGemini(prompt, userApiKey);
    const shots = text
      .split("\n")
      .map((line) => line.replace(/^[-*\d.]+\s*/, "").trim())
      .filter(Boolean);
    return NextResponse.json({ shots });
  } catch (error) {
    if (error instanceof GeminiConfigError || error instanceof GeminiRequestError) {
      return NextResponse.json({ error: error.message }, { status: 502 });
    }
    return NextResponse.json({ error: "Gagal membuat draft shot list." }, { status: 500 });
  }
}
