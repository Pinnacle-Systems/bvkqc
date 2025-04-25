-- CreateTable
CREATE TABLE `order` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `createdById` INTEGER NULL,
    `updatedById` INTEGER NULL,
    `docId` VARCHAR(191) NULL,
    `orderdate` DATETIME(3) NULL,
    `department` VARCHAR(191) NULL,
    `class` VARCHAR(191) NULL,
    `supplierCode` VARCHAR(191) NULL,
    `styleCode` VARCHAR(191) NULL,
    `product` VARCHAR(191) NULL,
    `color` VARCHAR(191) NULL,
    `poNumber` VARCHAR(191) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `orderBillItems` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `itemCode` VARCHAR(191) NULL,
    `barCode` VARCHAR(191) NULL,
    `sizeDesc` VARCHAR(191) NULL,
    `size` VARCHAR(191) NULL,
    `mrp` DOUBLE NULL,
    `qty` DOUBLE NULL,
    `orderQty` DOUBLE NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `order` ADD CONSTRAINT `order_createdById_fkey` FOREIGN KEY (`createdById`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `order` ADD CONSTRAINT `order_updatedById_fkey` FOREIGN KEY (`updatedById`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
