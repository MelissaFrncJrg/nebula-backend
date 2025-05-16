-- DropForeignKey
ALTER TABLE "Team" DROP CONSTRAINT "Team_ID_creator_fkey";

-- DropIndex
DROP INDEX "Creator_ID_creator_key";

-- AddForeignKey
ALTER TABLE "Team" ADD CONSTRAINT "Team_ID_creator_ID_project_fkey" FOREIGN KEY ("ID_creator", "ID_project") REFERENCES "Creator"("ID_creator", "ID_project") ON DELETE RESTRICT ON UPDATE CASCADE;
