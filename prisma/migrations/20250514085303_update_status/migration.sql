/*
  Warnings:

  - The values [IN_PROGRESS] on the enum `Team_status` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "Team_status_new" AS ENUM ('OPEN', 'CLOSED');
ALTER TABLE "Team" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "Team" ALTER COLUMN "status" TYPE "Team_status_new" USING ("status"::text::"Team_status_new");
ALTER TYPE "Team_status" RENAME TO "Team_status_old";
ALTER TYPE "Team_status_new" RENAME TO "Team_status";
DROP TYPE "Team_status_old";
ALTER TABLE "Team" ALTER COLUMN "status" SET DEFAULT 'OPEN';
COMMIT;
