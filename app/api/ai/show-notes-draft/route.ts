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
  const outlineText = typeof body?.outlineText === "string" ? body.outlineText.trim() : "";
  if (!outlineText) {
    return NextResponse.json({ error: "Outline episode masih kosong." }, { status: 400 });
  }

  const prompt = `Berdasarkan outline episode podcast berikut:\n\n${outlineText}\n\nBuatkan draft show notes singkat dalam Bahasa Indonesia (ringkasan episode + poin-poin utama), format paragraf pendek diikuti bullet list.`;

  try {
    const draft = await generateWithGemini(prompt);
    return NextResponse.json({ draft });
  } catch (error) {
    if (error instanceof GeminiConfigError || error instanceof GeminiRequestError) {
      return NextResponse.json({ error: error.message }, { status: 502 });
    }
    return NextResponse.json({ error: "Gagal membuat draft show notes." }, { status: 500 });
  }
}
