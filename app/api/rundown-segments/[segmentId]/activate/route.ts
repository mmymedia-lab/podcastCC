import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { canEditStage } from "@/lib/permissions";
import { resolveUserId } from "@/lib/session";

// Persists which rundown segment Mode Eksekusi is currently showing (and
// whether/when its timer started), so a companion display (TvPairing) can
// poll and stay in sync — the execute-client page itself only tracks this
// in React state otherwise.
//
// `started` defaults to false: switching to a segment does NOT start its
// timer by itself. The host must explicitly press Play in Mode Eksekusi
// (which re-calls this route with `started: true`) before
// activeSegmentStartedAt is set — see FEATURE_REQUEST_MANUAL_PLAY_TIMER.md.
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
  const body = await request.json().catch(() => ({}));
  const started = body?.started === true;

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
    data: {
      activeSegmentId: segmentId,
      activeSegmentStartedAt: started ? new Date() : null,
    },
  });

  return NextResponse.json({ ok: true });
}
