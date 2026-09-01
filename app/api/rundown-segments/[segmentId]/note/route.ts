import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ segmentId: string }> },
) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { segmentId } = await params;
  const body = await request.json().catch(() => null);
  const note = typeof body?.note === "string" ? body.note : "";

  await prisma.rundownSegment.update({
    where: { id: segmentId },
    data: { sessionNote: note || null },
  });

  return NextResponse.json({ ok: true });
}
