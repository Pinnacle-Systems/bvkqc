/*
  Warnings:

  - Added the required column `shift` to the `SAqlInspection` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `saqlinspection` ADD COLUMN `shift` VARCHAR(191) NOT NULL;
