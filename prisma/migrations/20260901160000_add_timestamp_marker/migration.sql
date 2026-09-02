-- CreateTable
CREATE TABLE "TimestampMarker" (
    "id" TEXT NOT NULL,
    "episodeId" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "timeLabel" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TimestampMarker_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "TimestampMarker" ADD CONSTRAINT "TimestampMarker_episodeId_fkey" FOREIGN KEY ("episodeId") REFERENCES "Episode"("id") ON DELETE CASCADE ON UPDATE CASCADE;
