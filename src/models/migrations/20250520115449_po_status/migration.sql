/*
  Warnings:

  - You are about to drop the column `isManufactuerPoStatus` on the `order` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `order` DROP COLUMN `isManufactuerPoStatus`,
    ADD COLUMN `poStatus` VARCHAR(191) NULL;
