/*
  Warnings:

  - You are about to drop the column `amount` on the `vtu_billers` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "vtu_billers_biller_code_key";

-- AlterTable
ALTER TABLE "vtu_billers" DROP COLUMN "amount";
