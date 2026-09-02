-- AlterTable
ALTER TABLE "Episode" ADD COLUMN     "publishDescription" TEXT,
ADD COLUMN     "publishTags" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "publishTitle" TEXT;
