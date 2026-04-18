/*
  Warnings:

  - A unique constraint covering the columns `[googleId]` on the table `User` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateEnum
CREATE TYPE "CompanyVerificationStatus" AS ENUM ('pending', 'verified', 'rejected');

-- CreateEnum
CREATE TYPE "EventStatus" AS ENUM ('draft', 'published', 'completed', 'cancelled');

-- CreateEnum
CREATE TYPE "PayoutStatus" AS ENUM ('held', 'processing', 'released', 'refunded');

-- CreateEnum
CREATE TYPE "EscrowStatus" AS ENUM ('pending', 'held', 'refunded', 'released');

-- CreateEnum
CREATE TYPE "CheckInStatus" AS ENUM ('pending', 'checked_in');

-- AlterTable
ALTER TABLE "Company" ADD COLUMN     "registrationDocumentUrl" TEXT,
ADD COLUMN     "taxId" TEXT,
ADD COLUMN     "verificationStatus" "CompanyVerificationStatus" NOT NULL DEFAULT 'pending',
ADD COLUMN     "verifiedAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "Event" ADD COLUMN     "payoutStatus" "PayoutStatus" NOT NULL DEFAULT 'held',
ADD COLUMN     "status" "EventStatus" NOT NULL DEFAULT 'draft',
ADD COLUMN     "trustScore" DOUBLE PRECISION DEFAULT 0;

-- AlterTable
ALTER TABLE "EventBooking" ADD COLUMN     "checkInStatus" "CheckInStatus" NOT NULL DEFAULT 'pending',
ADD COLUMN     "escrowStatus" "EscrowStatus" NOT NULL DEFAULT 'pending',
ADD COLUMN     "paymentId" TEXT,
ADD COLUMN     "refundStatus" TEXT;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "googleId" TEXT,
ALTER COLUMN "passwordHash" DROP NOT NULL;

-- CreateTable
CREATE TABLE "CompanyVerificationSession" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "status" "VerificationStatus" NOT NULL DEFAULT 'pending',
    "documentType" TEXT,
    "apiValidationSuccessful" BOOLEAN,
    "documentValid" BOOLEAN,
    "directorsMatched" BOOLEAN,
    "authorizationLetterUrl" TEXT,
    "failureReason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CompanyVerificationSession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FraudReport" (
    "id" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "details" TEXT,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FraudReport_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InvestmentProfile" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "fundingStage" TEXT,
    "askAmount" DOUBLE PRECISION,
    "pitchDeckUrl" TEXT,
    "financialsUrl" TEXT,
    "isVerified" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "InvestmentProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InvestorProfile" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "accreditationStatus" TEXT NOT NULL DEFAULT 'pending',
    "investmentThesis" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "InvestorProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DealRoom" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "investorId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'requested',
    "ndaSigned" BOOLEAN NOT NULL DEFAULT false,
    "ndaUrl" TEXT,
    "videoMeetingStatus" TEXT NOT NULL DEFAULT 'pending',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DealRoom_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "CompanyVerificationSession_companyId_idx" ON "CompanyVerificationSession"("companyId");

-- CreateIndex
CREATE INDEX "CompanyVerificationSession_userId_idx" ON "CompanyVerificationSession"("userId");

-- CreateIndex
CREATE INDEX "FraudReport_eventId_idx" ON "FraudReport"("eventId");

-- CreateIndex
CREATE INDEX "FraudReport_userId_idx" ON "FraudReport"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "InvestmentProfile_companyId_key" ON "InvestmentProfile"("companyId");

-- CreateIndex
CREATE UNIQUE INDEX "InvestorProfile_userId_key" ON "InvestorProfile"("userId");

-- CreateIndex
CREATE INDEX "DealRoom_companyId_idx" ON "DealRoom"("companyId");

-- CreateIndex
CREATE INDEX "DealRoom_investorId_idx" ON "DealRoom"("investorId");

-- CreateIndex
CREATE UNIQUE INDEX "DealRoom_companyId_investorId_key" ON "DealRoom"("companyId", "investorId");

-- CreateIndex
CREATE UNIQUE INDEX "User_googleId_key" ON "User"("googleId");

-- AddForeignKey
ALTER TABLE "CompanyVerificationSession" ADD CONSTRAINT "CompanyVerificationSession_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CompanyVerificationSession" ADD CONSTRAINT "CompanyVerificationSession_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FraudReport" ADD CONSTRAINT "FraudReport_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FraudReport" ADD CONSTRAINT "FraudReport_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InvestmentProfile" ADD CONSTRAINT "InvestmentProfile_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InvestorProfile" ADD CONSTRAINT "InvestorProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DealRoom" ADD CONSTRAINT "DealRoom_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DealRoom" ADD CONSTRAINT "DealRoom_investorId_fkey" FOREIGN KEY ("investorId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
