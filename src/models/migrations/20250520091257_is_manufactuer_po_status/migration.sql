/*
  Warnings:

  - You are about to alter the column `isManufactuerPoStatus` on the `order` table. The data in that column could be lost. The data in that column will be cast from `TinyInt` to `VarChar(191)`.

*/
-- AlterTable
ALTER TABLE `order` MODIFY `isManufactuerPoStatus` VARCHAR(191) NULL;
