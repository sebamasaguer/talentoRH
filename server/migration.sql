-- DropIndex
DROP INDEX "Agent_profile_idx";

-- DropIndex
DROP INDEX "Position_profileRequired_idx";

-- DropIndex
DROP INDEX "Position_requestingOrg_idx";

-- AlterTable
ALTER TABLE "Agent" DROP COLUMN "originOrg",
DROP COLUMN "profile",
ADD COLUMN     "originOrgId" INTEGER NOT NULL,
ADD COLUMN     "profileId" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "Position" DROP COLUMN "profileRequired",
DROP COLUMN "requestingOrg",
ADD COLUMN     "profileRequiredId" INTEGER NOT NULL,
ADD COLUMN     "requestingOrgId" INTEGER NOT NULL;

-- DropEnum
DROP TYPE "FunctionalProfile";

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

-- CreateIndex
CREATE UNIQUE INDEX "Organization_name_key" ON "Organization"("name");

-- CreateIndex
CREATE UNIQUE INDEX "FunctionalProfile_name_key" ON "FunctionalProfile"("name");

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
