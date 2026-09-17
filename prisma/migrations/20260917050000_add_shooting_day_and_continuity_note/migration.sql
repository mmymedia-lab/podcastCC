-- CreateTable
CREATE TABLE "ShootingDay" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "scheduledDate" TIMESTAMP(3),
    "callTime" TEXT,
    "location" TEXT,
    "sceneSchedule" TEXT,
    "wrapEstimate" TEXT,
    "notes" TEXT,
    "order" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ShootingDay_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ContinuityNote" (
    "id" TEXT NOT NULL,
    "shootingDayId" TEXT NOT NULL,
    "slate" TEXT,
    "takeNumber" INTEGER,
    "isGood" BOOLEAN NOT NULL DEFAULT false,
    "notes" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ContinuityNote_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "ShootingDay" ADD CONSTRAINT "ShootingDay_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContinuityNote" ADD CONSTRAINT "ContinuityNote_shootingDayId_fkey" FOREIGN KEY ("shootingDayId") REFERENCES "ShootingDay"("id") ON DELETE CASCADE ON UPDATE CASCADE;
