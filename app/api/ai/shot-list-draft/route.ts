import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { GeminiConfigError, GeminiRequestError, generateWithGemini } from "@/lib/gemini";
import { resolveUserId } from "@/lib/session";
import { canEditProjectStage } from "@/lib/permissions";
import { checkAiRateLimit } from "@/lib/ai-rate-limit";
import { getUserGeminiApiKey } from "@/lib/user-gemini-key";
import { prisma } from "@/lib/prisma";

// Script Breakdown describes each scene (where/who/what); Storyboard notes
// describe how a shot's already been framed/blocked visually — combined,
// they tell the model both what's being shot and how it's meant to look,
// which a title alone can't. Kept as plain labeled text blocks (no image
// reading — see conversation: that would mean the server fetching each
// Drive-hosted image itself, a new kind of call this app doesn't make
// anywhere else, for a meaningfully pricier/slower request) so this stays
// a same-shape addition to the existing text-only Gemini call.
async function buildProjectContext(projectId: string): Promise<string> {
  const [scriptBreakdowns, storyboardFrames] = await Promise.all([
    prisma.scriptBreakdown.findMany({ where: { projectId }, orderBy: { order: "asc" } }),
    prisma.storyboardFrame.findMany({
      where: { projectId, notes: { not: null } },
      orderBy: { order: "asc" },
      select: { notes: true },
    }),
  ]);

  const sections: string[] = [];

  if (scriptBreakdowns.length > 0) {
    const lines = scriptBreakdowns.map((scene, index) => {
      const parts = [`Lokasi: ${scene.location}`];
      if (scene.props) parts.push(`Props: ${scene.props}`);
      if (scene.cast) parts.push(`Cast: ${scene.cast}`);
      if (scene.notes) parts.push(`Catatan: ${scene.notes}`);
      return `${index + 1}. ${parts.join(" | ")}`;
    });
    sections.push(`Script Breakdown (per scene):\n${lines.join("\n")}`);
  }

  const storyboardNotes = storyboardFrames.filter((frame) => frame.notes?.trim());
  if (storyboardNotes.length > 0) {
    const lines = storyboardNotes.map((frame, index) => `${index + 1}. ${frame.notes}`);
    sections.push(`Catatan Storyboard (per shot, urutan sesuai storyboard):\n${lines.join("\n")}`);
  }

  return sections.join("\n\n");
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

  const context = await buildProjectContext(projectId);
  const prompt = context
    ? `Berikut konteks pra-produksi video berjudul "${projectTitle}":\n\n${context}\n\nBerdasarkan konteks di atas, berikan 5 saran shot (pengambilan gambar) untuk video ini, dalam Bahasa Indonesia. Satu shot per baris, deskripsi singkat pengambilan gambarnya, tanpa penomoran, tanpa penjelasan tambahan.`
    : `Berikan 5 saran shot (pengambilan gambar) untuk video berjudul "${projectTitle}", dalam Bahasa Indonesia. Satu shot per baris, deskripsi singkat pengambilan gambarnya, tanpa penomoran, tanpa penjelasan tambahan.`;

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
      return NextResponse.json({ error: error.message }, { status: 422 });
    }
    return NextResponse.json({ error: "Gagal membuat draft shot list." }, { status: 422 });
  }
}
