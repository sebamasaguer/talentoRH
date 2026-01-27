-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "PositionStatus" AS ENUM ('Abierta', 'Cubierta', 'Desierta');

-- CreateTable
CREATE TABLE "Organization" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "Organization_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FunctionalProfile" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "FunctionalProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Agent" (
    "id" VARCHAR(20) NOT NULL,
    "fullName" VARCHAR(100) NOT NULL,
    "originOrgId" INTEGER NOT NULL,
    "profileId" INTEGER NOT NULL,
    "keyCompetencies" TEXT,
    "workingHours" INTEGER NOT NULL DEFAULT 40,
    "availableForRotation" BOOLEAN NOT NULL DEFAULT true,
    "interviewDate" DATE NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Agent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Position" (
    "id" VARCHAR(20) NOT NULL,
    "requestingOrgId" INTEGER NOT NULL,
    "requestingArea" VARCHAR(100) NOT NULL,
    "profileRequiredId" INTEGER NOT NULL,
    "mainFunctions" TEXT,
    "hoursRequired" INTEGER NOT NULL DEFAULT 40,
    "requestDate" DATE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" "PositionStatus" NOT NULL DEFAULT 'Abierta',

    CONSTRAINT "Position_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Organization_name_key" ON "Organization"("name");

-- CreateIndex
CREATE UNIQUE INDEX "FunctionalProfile_name_key" ON "FunctionalProfile"("name");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "Agent_profileId_idx" ON "Agent"("profileId");

-- CreateIndex
CREATE INDEX "Position_profileRequiredId_idx" ON "Position"("profileRequiredId");

-- CreateIndex
CREATE INDEX "Position_requestingOrgId_idx" ON "Position"("requestingOrgId");

-- AddForeignKey
ALTER TABLE "Agent" ADD CONSTRAINT "Agent_originOrgId_fkey" FOREIGN KEY ("originOrgId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Agent" ADD CONSTRAINT "Agent_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "FunctionalProfile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Position" ADD CONSTRAINT "Position_requestingOrgId_fkey" FOREIGN KEY ("requestingOrgId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Position" ADD CONSTRAINT "Position_profileRequiredId_fkey" FOREIGN KEY ("profileRequiredId") REFERENCES "FunctionalProfile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
