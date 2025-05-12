/*
  Warnings:

  - You are about to drop the `_NewsToProject` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `ID_project` to the `News` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "_NewsToProject" DROP CONSTRAINT "_NewsToProject_A_fkey";

-- DropForeignKey
ALTER TABLE "_NewsToProject" DROP CONSTRAINT "_NewsToProject_B_fkey";

-- AlterTable
ALTER TABLE "News" ADD COLUMN     "ID_project" INTEGER NOT NULL,
ADD COLUMN     "image" TEXT,
ADD COLUMN     "likesCount" INTEGER NOT NULL DEFAULT 0;

-- DropTable
DROP TABLE "_NewsToProject";

-- CreateTable
CREATE TABLE "Comment_news" (
    "id" SERIAL NOT NULL,
    "ID_news" INTEGER NOT NULL,
    "ID_user" INTEGER NOT NULL,
    "ID_parent" INTEGER,
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Comment_news_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Like_news" (
    "ID_user" INTEGER NOT NULL,
    "ID_news" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Like_news_pkey" PRIMARY KEY ("ID_user","ID_news")
);

-- CreateTable
CREATE TABLE "Like_comment" (
    "ID_user" INTEGER NOT NULL,
    "ID_comment" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Like_comment_pkey" PRIMARY KEY ("ID_user","ID_comment")
);

-- AddForeignKey
ALTER TABLE "News" ADD CONSTRAINT "News_ID_project_fkey" FOREIGN KEY ("ID_project") REFERENCES "Project"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Comment_news" ADD CONSTRAINT "Comment_news_ID_news_fkey" FOREIGN KEY ("ID_news") REFERENCES "News"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Comment_news" ADD CONSTRAINT "Comment_news_ID_user_fkey" FOREIGN KEY ("ID_user") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Comment_news" ADD CONSTRAINT "Comment_news_ID_parent_fkey" FOREIGN KEY ("ID_parent") REFERENCES "Comment_news"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Like_news" ADD CONSTRAINT "Like_news_ID_user_fkey" FOREIGN KEY ("ID_user") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Like_news" ADD CONSTRAINT "Like_news_ID_news_fkey" FOREIGN KEY ("ID_news") REFERENCES "News"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Like_comment" ADD CONSTRAINT "Like_comment_ID_user_fkey" FOREIGN KEY ("ID_user") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Like_comment" ADD CONSTRAINT "Like_comment_ID_comment_fkey" FOREIGN KEY ("ID_comment") REFERENCES "Comment_news"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
