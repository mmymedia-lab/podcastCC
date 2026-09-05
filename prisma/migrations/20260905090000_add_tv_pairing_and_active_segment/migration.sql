-- AlterTable
ALTER TABLE "Episode" ADD COLUMN     "activeSegmentId" TEXT,
ADD COLUMN     "activeSegmentStartedAt" TIMESTAMP(3);

-- CreateTable
CREATE TABLE "TvPairing" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "episodeId" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "activatedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TvPairing_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "TvPairing_code_key" ON "TvPairing"("code");

-- AddForeignKey
ALTER TABLE "Episode" ADD CONSTRAINT "Episode_activeSegmentId_fkey" FOREIGN KEY ("activeSegmentId") REFERENCES "RundownSegment"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TvPairing" ADD CONSTRAINT "TvPairing_episodeId_fkey" FOREIGN KEY ("episodeId") REFERENCES "Episode"("id") ON DELETE CASCADE ON UPDATE CASCADE;
