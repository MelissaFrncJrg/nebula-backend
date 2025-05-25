/*
  Warnings:

  - A unique constraint covering the columns `[ID_creator]` on the table `Creator` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateEnum
CREATE TYPE "Team_status" AS ENUM ('OPEN', 'IN_PROGRESS', 'CLOSED');

-- CreateTable
CREATE TABLE "Team" (
    "ID_project" INTEGER NOT NULL,
    "ID_creator" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "jobs" JSONB NOT NULL,
    "status" "Team_status" NOT NULL DEFAULT 'OPEN',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Team_pkey" PRIMARY KEY ("ID_project","ID_creator")
);

-- CreateIndex
CREATE UNIQUE INDEX "Creator_ID_creator_key" ON "Creator"("ID_creator");

-- AddForeignKey
ALTER TABLE "Team" ADD CONSTRAINT "Team_ID_project_fkey" FOREIGN KEY ("ID_project") REFERENCES "Project"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Team" ADD CONSTRAINT "Team_ID_creator_fkey" FOREIGN KEY ("ID_creator") REFERENCES "Creator"("ID_creator") ON DELETE RESTRICT ON UPDATE CASCADE;
