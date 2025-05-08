-- CreateTable
CREATE TABLE `OrderImport` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `docId` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `createdById` INTEGER NOT NULL,
    `updatedById` INTEGER NULL,
    `branchId` INTEGER NULL,
    `companyId` INTEGER NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `OrderImportItems` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `orderImportId` INTEGER NOT NULL,
    `department` VARCHAR(191) NULL,
    `class_Subclass` VARCHAR(191) NULL,
    `season_supplier_code` VARCHAR(191) NULL,
    `item_code` VARCHAR(191) NULL,
    `ean_barcode` VARCHAR(191) NULL,
    `style_code_group` VARCHAR(191) NULL,
    `mrp` VARCHAR(191) NULL,
    `month_year` VARCHAR(191) NULL,
    `product` VARCHAR(191) NULL,
    `size_desc` VARCHAR(191) NULL,
    `code` VARCHAR(191) NULL,
    `colour` VARCHAR(191) NULL,
    `qty` VARCHAR(191) NULL,
    `order_qty` VARCHAR(191) NULL,
    `po_number` VARCHAR(191) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `OrderImport` ADD CONSTRAINT `OrderImport_createdById_fkey` FOREIGN KEY (`createdById`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `OrderImport` ADD CONSTRAINT `OrderImport_updatedById_fkey` FOREIGN KEY (`updatedById`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `OrderImport` ADD CONSTRAINT `OrderImport_branchId_fkey` FOREIGN KEY (`branchId`) REFERENCES `Branch`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `OrderImport` ADD CONSTRAINT `OrderImport_companyId_fkey` FOREIGN KEY (`companyId`) REFERENCES `Company`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `OrderImportItems` ADD CONSTRAINT `OrderImportItems_orderImportId_fkey` FOREIGN KEY (`orderImportId`) REFERENCES `OrderImport`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
