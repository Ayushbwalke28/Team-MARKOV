/*
  Warnings:

  - You are about to drop the column `body` on the `Post` table. All the data in the column will be lost.
  - Added the required column `authorType` to the `Post` table without a default value. This is not possible if the table is not empty.
  - Added the required column `text` to the `Post` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "AuthorType" AS ENUM ('user', 'company');

-- CreateEnum
CREATE TYPE "VerificationStatus" AS ENUM ('pending', 'document_uploaded', 'face_captured', 'processing', 'passed', 'failed', 'manual_review', 'locked');

-- CreateEnum
CREATE TYPE "DocumentType" AS ENUM ('passport', 'drivers_license', 'aadhaar', 'pan_card', 'national_id');

-- CreateEnum
CREATE TYPE "ConnectionStatus" AS ENUM ('pending', 'accepted', 'declined');

-- AlterEnum
ALTER TYPE "UserRoleType" ADD VALUE 'admin';

-- AlterTable
ALTER TABLE "Company" ADD COLUMN     "logoUrl" TEXT;

-- AlterTable
ALTER TABLE "Event" ADD COLUMN     "bannerUrl" TEXT;

-- AlterTable
ALTER TABLE "Post" DROP COLUMN "body",
ADD COLUMN     "authorCompanyId" TEXT,
ADD COLUMN     "authorType" "AuthorType" NOT NULL,
ADD COLUMN     "authorUserId" TEXT,
ADD COLUMN     "media" TEXT[],
ADD COLUMN     "mediaUrl" TEXT,
ADD COLUMN     "text" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "avatarUrl" TEXT;

-- CreateTable
CREATE TABLE "PostLike" (
    "id" TEXT NOT NULL,
    "postId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PostLike_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PostComment" (
    "id" TEXT NOT NULL,
    "postId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PostComment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Connection" (
    "id" TEXT NOT NULL,
    "senderId" TEXT NOT NULL,
    "receiverId" TEXT NOT NULL,
    "status" "ConnectionStatus" NOT NULL DEFAULT 'pending',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Connection_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VerificationSession" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "status" "VerificationStatus" NOT NULL DEFAULT 'pending',
    "documentType" "DocumentType",
    "ocrName" TEXT,
    "ocrDob" TEXT,
    "ocrIdNumber" TEXT,
    "ocrExpiry" TEXT,
    "ocrAddress" TEXT,
    "documentValid" BOOLEAN,
    "documentExpired" BOOLEAN,
    "documentBlurry" BOOLEAN,
    "documentTampered" BOOLEAN,
    "faceMatchScore" DOUBLE PRECISION,
    "livenessPass" BOOLEAN,
    "confidenceScore" DOUBLE PRECISION,
    "failureReason" TEXT,
    "attemptNumber" INTEGER NOT NULL DEFAULT 1,
    "consentGiven" BOOLEAN NOT NULL DEFAULT false,
    "consentTimestamp" TIMESTAMP(3),
    "rawDataDeletedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "VerificationSession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ManualReview" (
    "id" TEXT NOT NULL,
    "verificationSessionId" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "reviewedBy" TEXT,
    "reviewDecision" TEXT,
    "reviewNotes" TEXT,
    "reviewedAt" TIMESTAMP(3),
    "slaDeadline" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ManualReview_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "PostLike_postId_idx" ON "PostLike"("postId");

-- CreateIndex
CREATE INDEX "PostLike_userId_idx" ON "PostLike"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "PostLike_postId_userId_key" ON "PostLike"("postId", "userId");

-- CreateIndex
CREATE INDEX "PostComment_postId_idx" ON "PostComment"("postId");

-- CreateIndex
CREATE INDEX "PostComment_userId_idx" ON "PostComment"("userId");

-- CreateIndex
CREATE INDEX "Connection_senderId_idx" ON "Connection"("senderId");

-- CreateIndex
CREATE INDEX "Connection_receiverId_idx" ON "Connection"("receiverId");

-- CreateIndex
CREATE UNIQUE INDEX "Connection_senderId_receiverId_key" ON "Connection"("senderId", "receiverId");

-- CreateIndex
CREATE INDEX "VerificationSession_userId_idx" ON "VerificationSession"("userId");

-- CreateIndex
CREATE INDEX "VerificationSession_status_idx" ON "VerificationSession"("status");

-- CreateIndex
CREATE UNIQUE INDEX "ManualReview_verificationSessionId_key" ON "ManualReview"("verificationSessionId");

-- CreateIndex
CREATE INDEX "ManualReview_reviewedBy_idx" ON "ManualReview"("reviewedBy");

-- CreateIndex
CREATE INDEX "Post_authorUserId_idx" ON "Post"("authorUserId");

-- CreateIndex
CREATE INDEX "Post_authorCompanyId_idx" ON "Post"("authorCompanyId");

-- CreateIndex
CREATE INDEX "Post_createdAt_idx" ON "Post"("createdAt");

-- AddForeignKey
ALTER TABLE "Post" ADD CONSTRAINT "Post_authorUserId_fkey" FOREIGN KEY ("authorUserId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Post" ADD CONSTRAINT "Post_authorCompanyId_fkey" FOREIGN KEY ("authorCompanyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PostLike" ADD CONSTRAINT "PostLike_postId_fkey" FOREIGN KEY ("postId") REFERENCES "Post"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PostLike" ADD CONSTRAINT "PostLike_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PostComment" ADD CONSTRAINT "PostComment_postId_fkey" FOREIGN KEY ("postId") REFERENCES "Post"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PostComment" ADD CONSTRAINT "PostComment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Connection" ADD CONSTRAINT "Connection_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Connection" ADD CONSTRAINT "Connection_receiverId_fkey" FOREIGN KEY ("receiverId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VerificationSession" ADD CONSTRAINT "VerificationSession_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ManualReview" ADD CONSTRAINT "ManualReview_verificationSessionId_fkey" FOREIGN KEY ("verificationSessionId") REFERENCES "VerificationSession"("id") ON DELETE CASCADE ON UPDATE CASCADE;
