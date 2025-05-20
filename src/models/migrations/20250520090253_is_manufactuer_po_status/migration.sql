/*
  Warnings:

  - You are about to drop the column `isPoStatus` on the `order` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `order` DROP COLUMN `isPoStatus`,
    ADD COLUMN `isManufactuerPoStatus` BOOLEAN NULL;
