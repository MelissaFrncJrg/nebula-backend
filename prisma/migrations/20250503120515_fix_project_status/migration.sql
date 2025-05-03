/*
  Warnings:

  - You are about to drop the column `statut` on the `Project` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Project" DROP COLUMN "statut",
ADD COLUMN     "status" "ProjectStatus" NOT NULL DEFAULT 'in_progress';
