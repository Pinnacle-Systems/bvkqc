/*
  Warnings:

  - You are about to drop the column `isSave` on the `orderbillitems` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `order` ADD COLUMN `isSave` BOOLEAN NULL;

-- AlterTable
ALTER TABLE `orderbillitems` DROP COLUMN `isSave`;
