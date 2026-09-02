import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  await prisma.healthCheck.create({ data: {} });
  return NextResponse.json({ status: "ok" });
}
