-- CreateTable
CREATE TABLE "GuestQuestion" (
    "id" TEXT NOT NULL,
    "episodeId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "GuestQuestion_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "GuestQuestion" ADD CONSTRAINT "GuestQuestion_episodeId_fkey" FOREIGN KEY ("episodeId") REFERENCES "Episode"("id") ON DELETE CASCADE ON UPDATE CASCADE;
