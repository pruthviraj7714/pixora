/*
  Warnings:

  - Added the required column `mediaTitle` to the `Notification` table without a default value. This is not possible if the table is not empty.
  - Added the required column `mediaUrl` to the `Notification` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Notification" ADD COLUMN     "mediaTitle" TEXT NOT NULL,
ADD COLUMN     "mediaUrl" TEXT NOT NULL;
