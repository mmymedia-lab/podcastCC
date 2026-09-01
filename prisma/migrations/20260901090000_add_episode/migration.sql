-- CreateEnum
CREATE TYPE "ThemeIdeaStatus" AS ENUM ('RAW', 'SELECTED');

-- CreateEnum
CREATE TYPE "EpisodeStage" AS ENUM ('BANK_TEMA', 'RISET_OUTLINE', 'PRA_PRODUKSI', 'PANDUAN_EKSEKUSI', 'PASCA_PRODUKSI', 'PUBLISH_DISTRIBUSI', 'EVALUASI');

-- AlterTable
ALTER TABLE "ThemeIdea" ADD COLUMN     "episodeId" TEXT,
ADD COLUMN     "status" "ThemeIdeaStatus" NOT NULL DEFAULT 'RAW';

-- CreateTable
CREATE TABLE "Episode" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "stage" "EpisodeStage" NOT NULL DEFAULT 'BANK_TEMA',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Episode_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ThemeIdea_episodeId_key" ON "ThemeIdea"("episodeId");

-- AddForeignKey
ALTER TABLE "ThemeIdea" ADD CONSTRAINT "ThemeIdea_episodeId_fkey" FOREIGN KEY ("episodeId") REFERENCES "Episode"("id") ON DELETE SET NULL ON UPDATE CASCADE;
