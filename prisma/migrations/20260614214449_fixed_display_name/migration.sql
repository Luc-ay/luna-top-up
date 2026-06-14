/*
  Warnings:

  - Made the column `displayName` on table `users` required. This step will fail if there are existing NULL values in that column.

*/
-- DropIndex
DROP INDEX "users_displayName_key";

-- AlterTable
ALTER TABLE "users" ALTER COLUMN "displayName" SET NOT NULL;
