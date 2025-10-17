-- CreateEnum
CREATE TYPE "ReportStatus" AS ENUM ('PENDING', 'REVIEWED', 'DISMISSED');

-- AlterTable
ALTER TABLE "Report" ADD COLUMN     "status" "ReportStatus" NOT NULL DEFAULT 'PENDING';
