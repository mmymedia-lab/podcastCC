import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { canEditStage } from "@/lib/permissions";
import { resolveUserId } from "@/lib/session";

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

  const body = await request.json().catch(() => null);
  const note = typeof body?.note === "string" ? body.note : "";

  await prisma.rundownSegment.update({
    where: { id: segmentId },
    data: { sessionNote: note || null },
  });

  return NextResponse.json({ ok: true });
}
