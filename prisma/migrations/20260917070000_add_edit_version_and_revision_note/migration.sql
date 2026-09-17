-- CreateEnum
CREATE TYPE "EditVersionStage" AS ENUM ('ROUGH_CUT', 'FINE_CUT', 'PICTURE_LOCK');

-- CreateEnum
CREATE TYPE "EditApprovalStatus" AS ENUM ('DRAFT', 'IN_REVIEW', 'APPROVED');

-- CreateTable
CREATE TABLE "EditVersion" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "stage" "EditVersionStage" NOT NULL,
    "driveUrl" TEXT NOT NULL,
    "approvalStatus" "EditApprovalStatus" NOT NULL DEFAULT 'DRAFT',
    "order" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EditVersion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RevisionNote" (
    "id" TEXT NOT NULL,
    "editVersionId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "resolved" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RevisionNote_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "EditVersion" ADD CONSTRAINT "EditVersion_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RevisionNote" ADD CONSTRAINT "RevisionNote_editVersionId_fkey" FOREIGN KEY ("editVersionId") REFERENCES "EditVersion"("id") ON DELETE CASCADE ON UPDATE CASCADE;
