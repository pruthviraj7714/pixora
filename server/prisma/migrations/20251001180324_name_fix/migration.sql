/*
  Warnings:

  - You are about to drop the column `PostStatus` on the `Post` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Post" DROP COLUMN "PostStatus",
ADD COLUMN     "status" "PostStatus" NOT NULL DEFAULT 'PENDING';
