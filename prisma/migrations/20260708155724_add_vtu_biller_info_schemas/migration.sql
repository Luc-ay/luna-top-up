/*
  Warnings:

  - You are about to drop the column `billerCode` on the `vtu_billers` table. All the data in the column will be lost.
  - You are about to drop the column `fee` on the `vtu_billers` table. All the data in the column will be lost.
  - You are about to drop the column `itemCode` on the `vtu_billers` table. All the data in the column will be lost.
  - You are about to drop the column `markupPercent` on the `vtu_billers` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[flwId]` on the table `vtu_billers` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[biller_code]` on the table `vtu_billers` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `biller_code` to the `vtu_billers` table without a default value. This is not possible if the table is not empty.
  - Added the required column `flwId` to the `vtu_billers` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "vtu_billers_billerCode_itemCode_key";

-- AlterTable
ALTER TABLE "vtu_billers" DROP COLUMN "billerCode",
DROP COLUMN "fee",
DROP COLUMN "itemCode",
DROP COLUMN "markupPercent",
ADD COLUMN     "biller_code" TEXT NOT NULL,
ADD COLUMN     "description" TEXT,
ADD COLUMN     "flwId" INTEGER NOT NULL,
ADD COLUMN     "logo" TEXT,
ADD COLUMN     "short_name" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "vtu_billers_flwId_key" ON "vtu_billers"("flwId");

-- CreateIndex
CREATE INDEX "vtu_billers_categoryId_isActive_flwId_idx" ON "vtu_billers"("categoryId", "isActive", "flwId");

-- CreateIndex
CREATE UNIQUE INDEX "vtu_billers_biller_code_key" ON "vtu_billers"("biller_code");
