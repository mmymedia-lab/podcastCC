-- AlterTable
ALTER TABLE "Episode" ADD COLUMN     "recordingScheduledAt" TIMESTAMP(3);

-- CreateTable
CREATE TABLE "Guest" (
    "id" TEXT NOT NULL,
    "episodeId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "contact" TEXT,
    "briefingNotes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Guest_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Guest" ADD CONSTRAINT "Guest_episodeId_fkey" FOREIGN KEY ("episodeId") REFERENCES "Episode"("id") ON DELETE CASCADE ON UPDATE CASCADE;
