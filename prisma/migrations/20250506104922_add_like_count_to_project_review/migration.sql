/*
  Warnings:

  - You are about to drop the `Review_project` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Like_review" DROP CONSTRAINT "Like_review_ID_review_fkey";

-- DropForeignKey
ALTER TABLE "Review_project" DROP CONSTRAINT "Review_project_ID_author_fkey";

-- DropForeignKey
ALTER TABLE "Review_project" DROP CONSTRAINT "Review_project_ID_project_fkey";

-- DropTable
DROP TABLE "Review_project";

-- CreateTable
CREATE TABLE "Project_review" (
    "ID_review" SERIAL NOT NULL,
    "ID_author" INTEGER NOT NULL,
    "ID_project" INTEGER NOT NULL,
    "rating" INTEGER NOT NULL,
    "comment" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "likeCount" INTEGER NOT NULL,

    CONSTRAINT "Project_review_pkey" PRIMARY KEY ("ID_review")
);

-- CreateIndex
CREATE UNIQUE INDEX "Project_review_ID_author_ID_project_key" ON "Project_review"("ID_author", "ID_project");

-- AddForeignKey
ALTER TABLE "Project_review" ADD CONSTRAINT "Project_review_ID_author_fkey" FOREIGN KEY ("ID_author") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Project_review" ADD CONSTRAINT "Project_review_ID_project_fkey" FOREIGN KEY ("ID_project") REFERENCES "Project"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Like_review" ADD CONSTRAINT "Like_review_ID_review_fkey" FOREIGN KEY ("ID_review") REFERENCES "Project_review"("ID_review") ON DELETE RESTRICT ON UPDATE CASCADE;
