/*
  Warnings:

  - The primary key for the `Follow_creator` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `Follow_creator` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Follow_creator" DROP CONSTRAINT "Follow_creator_pkey",
DROP COLUMN "id",
ADD CONSTRAINT "Follow_creator_pkey" PRIMARY KEY ("ID_user", "ID_creator");
