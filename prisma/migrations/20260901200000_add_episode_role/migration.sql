-- CreateEnum
CREATE TYPE "EpisodeRoleType" AS ENUM ('PRODUCER', 'HOST', 'EDITOR');

-- CreateTable
CREATE TABLE "EpisodeRole" (
    "id" TEXT NOT NULL,
    "episodeId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "role" "EpisodeRoleType" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EpisodeRole_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "EpisodeRole_episodeId_userId_role_key" ON "EpisodeRole"("episodeId", "userId", "role");

-- AddForeignKey
ALTER TABLE "EpisodeRole" ADD CONSTRAINT "EpisodeRole_episodeId_fkey" FOREIGN KEY ("episodeId") REFERENCES "Episode"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EpisodeRole" ADD CONSTRAINT "EpisodeRole_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
