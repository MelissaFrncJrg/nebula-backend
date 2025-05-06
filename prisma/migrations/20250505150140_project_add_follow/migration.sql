-- CreateTable
CREATE TABLE "Follow_project" (
    "ID_user" INTEGER NOT NULL,
    "ID_project" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "notificationsEnabled" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "Follow_project_pkey" PRIMARY KEY ("ID_user","ID_project")
);

-- AddForeignKey
ALTER TABLE "Follow_project" ADD CONSTRAINT "Follow_project_ID_user_fkey" FOREIGN KEY ("ID_user") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Follow_project" ADD CONSTRAINT "Follow_project_ID_project_fkey" FOREIGN KEY ("ID_project") REFERENCES "Project"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
