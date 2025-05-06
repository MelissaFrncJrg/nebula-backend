-- CreateTable
CREATE TABLE "Review_project" (
    "ID_review" SERIAL NOT NULL,
    "ID_author" INTEGER NOT NULL,
    "ID_project" INTEGER NOT NULL,
    "rating" INTEGER NOT NULL,
    "comment" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Review_project_pkey" PRIMARY KEY ("ID_review")
);

-- CreateTable
CREATE TABLE "Like_review" (
    "ID_user" INTEGER NOT NULL,
    "ID_review" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Like_review_pkey" PRIMARY KEY ("ID_user","ID_review")
);

-- CreateIndex
CREATE UNIQUE INDEX "Review_project_ID_author_ID_project_key" ON "Review_project"("ID_author", "ID_project");

-- AddForeignKey
ALTER TABLE "Review_project" ADD CONSTRAINT "Review_project_ID_author_fkey" FOREIGN KEY ("ID_author") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Review_project" ADD CONSTRAINT "Review_project_ID_project_fkey" FOREIGN KEY ("ID_project") REFERENCES "Project"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Like_review" ADD CONSTRAINT "Like_review_ID_user_fkey" FOREIGN KEY ("ID_user") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Like_review" ADD CONSTRAINT "Like_review_ID_review_fkey" FOREIGN KEY ("ID_review") REFERENCES "Review_project"("ID_review") ON DELETE RESTRICT ON UPDATE CASCADE;
