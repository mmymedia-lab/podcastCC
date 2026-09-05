import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { canEditStage } from "@/lib/permissions";
import { resolveUserId } from "@/lib/session";

// A code expires in 15 minutes if never used, so a stale code shown on
// screen and never typed into a device can't be reused later. Once a
// device activates it (see /api/tv/session/[code]), it stops expiring —
// see the TvPairing model comment for why.
const CODE_TTL_MS = 15 * 60 * 1000;

function generateCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  const userId = await resolveUserId(session);
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const episodeId = typeof body?.episodeId === "string" ? body.episodeId : null;
  if (!episodeId) {
    return NextResponse.json({ error: "episodeId wajib diisi." }, { status: 400 });
  }

  const episode = await prisma.episode.findUnique({ where: { id: episodeId } });
  if (!episode) {
    return NextResponse.json({ error: "Episode tidak ditemukan." }, { status: 404 });
  }

  const allowed = await canEditStage(userId, episodeId, "PANDUAN_EKSEKUSI");
  if (!allowed) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  let code = generateCode();
  for (let attempt = 0; attempt < 5; attempt++) {
    const existing = await prisma.tvPairing.findUnique({ where: { code } });
    if (!existing) break;
    code = generateCode();
  }

  const pairing = await prisma.tvPairing.create({
    data: {
      code,
      episodeId,
      expiresAt: new Date(Date.now() + CODE_TTL_MS),
    },
  });

  return NextResponse.json({ code: pairing.code, expiresAt: pairing.expiresAt });
}
