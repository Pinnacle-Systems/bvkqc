/*
  Warnings:

  - You are about to drop the column `class` on the `order` table. All the data in the column will be lost.
  - You are about to drop the column `color` on the `order` table. All the data in the column will be lost.
  - You are about to drop the column `department` on the `order` table. All the data in the column will be lost.
  - You are about to drop the column `product` on the `order` table. All the data in the column will be lost.
  - You are about to drop the column `styleCode` on the `order` table. All the data in the column will be lost.
  - You are about to drop the column `supplierCode` on the `order` table. All the data in the column will be lost.
  - You are about to drop the column `poNumber` on the `orderbillitems` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `order` DROP COLUMN `class`,
    DROP COLUMN `color`,
    DROP COLUMN `department`,
    DROP COLUMN `product`,
    DROP COLUMN `styleCode`,
    DROP COLUMN `supplierCode`;

-- AlterTable
ALTER TABLE `orderbillitems` DROP COLUMN `poNumber`,
    ADD COLUMN `date` DATETIME(3) NULL;
