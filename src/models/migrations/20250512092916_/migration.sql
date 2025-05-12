/*
  Warnings:

  - You are about to alter the column `isApproved` on the `order` table. The data in that column could be lost. The data in that column will be cast from `TinyInt` to `VarChar(191)`.

*/
-- AlterTable
ALTER TABLE `order` MODIFY `isApproved` VARCHAR(191) NULL;
