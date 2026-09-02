-- CreateTable
CREATE TABLE "RundownSegment" (
    "id" TEXT NOT NULL,
    "episodeId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "talkingPoints" TEXT NOT NULL,
    "estimatedMinutes" INTEGER NOT NULL DEFAULT 5,
    "order" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RundownSegment_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "RundownSegment" ADD CONSTRAINT "RundownSegment_episodeId_fkey" FOREIGN KEY ("episodeId") REFERENCES "Episode"("id") ON DELETE CASCADE ON UPDATE CASCADE;
