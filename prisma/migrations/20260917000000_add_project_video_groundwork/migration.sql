-- CreateEnum
CREATE TYPE "ProjectStage" AS ENUM ('IDE', 'PRA_PRODUKSI', 'PRODUKSI', 'PASCA_PRODUKSI', 'DISTRIBUSI');

-- CreateEnum
CREATE TYPE "ProjectRoleType" AS ENUM ('LEADER_PRODUKSI_VIDEO', 'TIM_PRA_PRODUKSI', 'TIM_PRODUKSI', 'TIM_PASCA_PRODUKSI');

-- CreateTable
CREATE TABLE "Project" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "stage" "ProjectStage" NOT NULL DEFAULT 'IDE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Project_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProjectRole" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "role" "ProjectRoleType" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ProjectRole_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ProjectRole_projectId_userId_role_key" ON "ProjectRole"("projectId", "userId", "role");

-- AddForeignKey
ALTER TABLE "ProjectRole" ADD CONSTRAINT "ProjectRole_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjectRole" ADD CONSTRAINT "ProjectRole_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
