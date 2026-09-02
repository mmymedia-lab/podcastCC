import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { GeminiConfigError, GeminiRequestError, generateWithGemini } from "@/lib/gemini";

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const episodeTitle = typeof body?.episodeTitle === "string" ? body.episodeTitle.trim() : "";
  if (!episodeTitle) {
    return NextResponse.json({ error: "Judul episode wajib diisi." }, { status: 400 });
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
