-- AlterTable
ALTER TABLE "Company" ADD COLUMN     "cinNumber" TEXT,
ADD COLUMN     "gstin" TEXT,
ADD COLUMN     "incorporationCertUrl" TEXT;

-- AlterTable
ALTER TABLE "CompanyVerificationSession" ADD COLUMN     "aiConfidenceScore" DOUBLE PRECISION,
ADD COLUMN     "aiVerificationReason" TEXT,
ADD COLUMN     "cinNumber" TEXT,
ADD COLUMN     "gstin" TEXT,
ADD COLUMN     "incorporationCertUrl" TEXT,
ADD COLUMN     "registrationDocumentUrl" TEXT;
