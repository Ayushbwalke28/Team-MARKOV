-- CreateEnum
CREATE TYPE "OrganizerType" AS ENUM ('individual', 'company');

-- CreateEnum
CREATE TYPE "EventMode" AS ENUM ('online', 'offline', 'hybrid');

-- CreateTable
CREATE TABLE "Event" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "category" TEXT,
    "organizerType" "OrganizerType" NOT NULL,
    "organizerUserId" TEXT,
    "organizerCompanyId" TEXT,
    "schedule" TIMESTAMP(3) NOT NULL,
    "fees" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "mode" "EventMode" NOT NULL,
    "venue" TEXT,
    "onlinePlatform" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Event_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EventBooking" (
    "id" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EventBooking_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Event_organizerUserId_idx" ON "Event"("organizerUserId");

-- CreateIndex
CREATE INDEX "Event_organizerCompanyId_idx" ON "Event"("organizerCompanyId");

-- CreateIndex
CREATE INDEX "EventBooking_eventId_idx" ON "EventBooking"("eventId");

-- CreateIndex
CREATE INDEX "EventBooking_userId_idx" ON "EventBooking"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "EventBooking_eventId_userId_key" ON "EventBooking"("eventId", "userId");

-- AddForeignKey
ALTER TABLE "Event" ADD CONSTRAINT "Event_organizerUserId_fkey" FOREIGN KEY ("organizerUserId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Event" ADD CONSTRAINT "Event_organizerCompanyId_fkey" FOREIGN KEY ("organizerCompanyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EventBooking" ADD CONSTRAINT "EventBooking_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EventBooking" ADD CONSTRAINT "EventBooking_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
