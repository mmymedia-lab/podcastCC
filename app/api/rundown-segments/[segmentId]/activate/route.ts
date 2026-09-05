import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { canEditStage } from "@/lib/permissions";
import { resolveUserId } from "@/lib/session";

// Persists which rundown segment Mode Eksekusi is currently showing (and
// when it started), so a companion display (TvPairing) can poll and stay
// in sync — the execute-client page itself only tracks this in React
// state otherwise.
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ segmentId: string }> },
) {
  const session = await getServerSession(authOptions);
  const userId = await resolveUserId(session);
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { segmentId } = await params;

  const segment = await prisma.rundownSegment.findUnique({ where: { id: segmentId } });
  if (!segment) {
    return NextResponse.json({ error: "Segmen tidak ditemukan." }, { status: 404 });
  }

  const allowed = await canEditStage(userId, segment.episodeId, "PANDUAN_EKSEKUSI");
  if (!allowed) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  await prisma.episode.update({
    where: { id: segment.episodeId },
    data: { activeSegmentId: segmentId, activeSegmentStartedAt: new Date() },
  });

  return NextResponse.json({ ok: true });
}
