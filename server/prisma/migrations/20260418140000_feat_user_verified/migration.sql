-- Add verified flag for placeholder user verification feature
ALTER TABLE "User" ADD COLUMN "verified" BOOLEAN NOT NULL DEFAULT false;

