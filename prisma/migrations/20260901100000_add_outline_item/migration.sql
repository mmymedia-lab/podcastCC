-- CreateTable
CREATE TABLE "OutlineItem" (
    "id" TEXT NOT NULL,
    "episodeId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "referenceUrl" TEXT,
    "order" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "OutlineItem_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "OutlineItem" ADD CONSTRAINT "OutlineItem_episodeId_fkey" FOREIGN KEY ("episodeId") REFERENCES "Episode"("id") ON DELETE CASCADE ON UPDATE CASCADE;
