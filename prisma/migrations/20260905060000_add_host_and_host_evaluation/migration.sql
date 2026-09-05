-- CreateTable
CREATE TABLE "Host" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "contact" TEXT,
    "bio" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Host_pkey" PRIMARY KEY ("id")
);

-- AlterTable
ALTER TABLE "Episode" ADD COLUMN "hostId" TEXT;

-- CreateTable
CREATE TABLE "HostEvaluation" (
    "id" TEXT NOT NULL,
    "hostId" TEXT NOT NULL,
    "episodeId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "HostEvaluation_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Episode" ADD CONSTRAINT "Episode_hostId_fkey" FOREIGN KEY ("hostId") REFERENCES "Host"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HostEvaluation" ADD CONSTRAINT "HostEvaluation_hostId_fkey" FOREIGN KEY ("hostId") REFERENCES "Host"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HostEvaluation" ADD CONSTRAINT "HostEvaluation_episodeId_fkey" FOREIGN KEY ("episodeId") REFERENCES "Episode"("id") ON DELETE CASCADE ON UPDATE CASCADE;
