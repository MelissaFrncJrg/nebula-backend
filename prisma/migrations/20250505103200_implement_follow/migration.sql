-- CreateTable
CREATE TABLE "Follow_creator" (
    "id" SERIAL NOT NULL,
    "ID_user" INTEGER NOT NULL,
    "ID_creator" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "notificationsEnabled" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "Follow_creator_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Follow_creator" ADD CONSTRAINT "Follow_creator_ID_user_fkey" FOREIGN KEY ("ID_user") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Follow_creator" ADD CONSTRAINT "Follow_creator_ID_creator_fkey" FOREIGN KEY ("ID_creator") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
