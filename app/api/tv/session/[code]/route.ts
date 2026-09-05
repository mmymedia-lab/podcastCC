import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Deliberately unauthenticated (unlike every other route in this app):
// the companion display (Smart TV app, or a tablet/phone browser) has no
// NextAuth session — it authenticates purely by knowing a pairing code.
// See the TvPairing model comment and the Flutter companion-app spec,
// Milestone 0, for why this trade-off is acceptable for an internal tool.
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ code: string }> },
) {
  const { code } = await params;

  const pairing = await prisma.tvPairing.findUnique({ where: { code } });
  if (!pairing) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }

  if (!pairing.activatedAt) {
    if (pairing.expiresAt < new Date()) {
      return NextResponse.json({ error: "expired" }, { status: 410 });
    }
    await prisma.tvPairing.update({
      where: { id: pairing.id },
      data: { activatedAt: new Date() },
    });
  }

  const episode = await prisma.episode.findUnique({
    where: { id: pairing.episodeId },
    include: {
      host: { select: { name: true } },
      rundownSegments: {
        orderBy: { order: "asc" },
        select: { id: true, title: true, talkingPoints: true, estimatedMinutes: true },
      },
      guestQuestions: {
        orderBy: { order: "asc" },
        select: { id: true, content: true },
      },
      guests: {
        select: { id: true, name: true, contact: true, briefingNotes: true },
      },
    },
  });

  if (!episode) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }

  const activeSegmentIndex = episode.activeSegmentId
    ? episode.rundownSegments.findIndex((segment) => segment.id === episode.activeSegmentId)
    : -1;
  const activeSegment = activeSegmentIndex >= 0 ? episode.rundownSegments[activeSegmentIndex] : null;

  return NextResponse.json({
    episodeId: episode.id,
    episodeTitle: episode.title,
    host: episode.host ? { name: episode.host.name } : null,
    activeSegmentIndex,
    totalSegments: episode.rundownSegments.length,
    activeSegment: activeSegment
      ? {
          id: activeSegment.id,
          title: activeSegment.title,
          talkingPoints: activeSegment.talkingPoints,
          estimatedMinutes: activeSegment.estimatedMinutes,
          segmentStartedAt: episode.activeSegmentStartedAt,
        }
      : null,
    // Lightweight — just enough for a companion display's own rundown
    // overview (mirrors Mode Eksekusi's "Ringkasan Rundown" panel). No
    // talkingPoints here; that only matters for the currently active
    // segment, already covered by activeSegment above.
    segments: episode.rundownSegments.map((segment) => ({
      id: segment.id,
      title: segment.title,
      estimatedMinutes: segment.estimatedMinutes,
    })),
    guestQuestions: episode.guestQuestions,
    guests: episode.guests,
    connectionStatus: "live",
  });
}
