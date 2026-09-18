/*
  Warnings:

  - You are about to drop the `_MediaToPost` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `postId` to the `Media` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "_MediaToPost" DROP CONSTRAINT "_MediaToPost_A_fkey";

-- DropForeignKey
ALTER TABLE "_MediaToPost" DROP CONSTRAINT "_MediaToPost_B_fkey";

-- AlterTable
ALTER TABLE "Media" ADD COLUMN     "postId" TEXT NOT NULL;

-- DropTable
DROP TABLE "_MediaToPost";

-- AddForeignKey
ALTER TABLE "Media" ADD CONSTRAINT "Media_postId_fkey" FOREIGN KEY ("postId") REFERENCES "Post"("id") ON DELETE CASCADE ON UPDATE CASCADE;
