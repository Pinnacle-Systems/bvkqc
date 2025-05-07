/*
  Warnings:

  - You are about to drop the column `excessQty` on the `orderbillitems` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `order` ADD COLUMN `excessQty` DOUBLE NULL,
    ADD COLUMN `netAmount` DOUBLE NULL;

-- AlterTable
ALTER TABLE `orderbillitems` DROP COLUMN `excessQty`;
