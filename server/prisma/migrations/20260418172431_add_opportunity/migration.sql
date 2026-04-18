-- CreateEnum
CREATE TYPE "OpportunityType" AS ENUM ('job', 'internship', 'freelance');

-- CreateEnum
CREATE TYPE "OpportunityMode" AS ENUM ('online', 'onsite', 'hybrid');

-- CreateEnum
CREATE TYPE "OpportunityStatus" AS ENUM ('open', 'closed');

-- CreateTable
CREATE TABLE "Opportunity" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "type" "OpportunityType" NOT NULL,
    "mode" "OpportunityMode" NOT NULL,
    "status" "OpportunityStatus" NOT NULL DEFAULT 'open',
    "payment" TEXT,
    "postName" TEXT NOT NULL,
    "description" TEXT,
    "registrationDeadline" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Opportunity_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Opportunity_companyId_idx" ON "Opportunity"("companyId");

-- AddForeignKey
ALTER TABLE "Opportunity" ADD CONSTRAINT "Opportunity_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;
