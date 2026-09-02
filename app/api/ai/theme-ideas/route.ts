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
