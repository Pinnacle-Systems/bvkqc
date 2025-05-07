-- AlterTable
ALTER TABLE `orderbillitems` ADD COLUMN `class` VARCHAR(191) NULL,
    ADD COLUMN `color` VARCHAR(191) NULL,
    ADD COLUMN `department` VARCHAR(191) NULL,
    ADD COLUMN `poNumber` VARCHAR(191) NULL,
    ADD COLUMN `product` VARCHAR(191) NULL,
    ADD COLUMN `styleCode` VARCHAR(191) NULL,
    ADD COLUMN `supplierCode` VARCHAR(191) NULL;
