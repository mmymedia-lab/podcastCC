-- CreateEnum
CREATE TYPE "WorkspaceMode" AS ENUM ('SOLO', 'TIM');

-- CreateTable
CREATE TABLE "WorkspaceSettings" (
    "id" INTEGER NOT NULL DEFAULT 1,
    "mode" "WorkspaceMode" NOT NULL DEFAULT 'SOLO',
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WorkspaceSettings_pkey" PRIMARY KEY ("id")
);
