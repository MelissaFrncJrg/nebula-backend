/*
  Warnings:

  - You are about to drop the column `isCreator` on the `Profile` table. All the data in the column will be lost.
  - You are about to drop the column `name` on the `User` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "Role" AS ENUM ('PLAYER', 'CREATOR');

-- AlterTable
ALTER TABLE "Profile" DROP COLUMN "isCreator";

-- AlterTable
ALTER TABLE "User" DROP COLUMN "name",
ADD COLUMN     "isTotpEnabled" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "role" "Role" NOT NULL DEFAULT 'PLAYER',
ADD COLUMN     "totpSecret" TEXT,
ADD COLUMN     "username" TEXT,
ALTER COLUMN "email" DROP NOT NULL;
