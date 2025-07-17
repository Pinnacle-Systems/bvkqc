/*
  Warnings:

  - Added the required column `reference` to the `Allocation` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `allocation` ADD COLUMN `reference` VARCHAR(191) NOT NULL;
