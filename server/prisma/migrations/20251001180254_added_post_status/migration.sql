/*
  Warnings:

  - You are about to drop the column `isApproved` on the `Post` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "PostStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- AlterTable
ALTER TABLE "Post" DROP COLUMN "isApproved",
ADD COLUMN     "PostStatus" "PostStatus" NOT NULL DEFAULT 'PENDING';
