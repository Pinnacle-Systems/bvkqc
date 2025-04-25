-- AlterTable
ALTER TABLE `order` ADD COLUMN `branchId` INTEGER NULL;

-- AlterTable
ALTER TABLE `orderbillitems` ADD COLUMN `orderId` INTEGER NULL;

-- AddForeignKey
ALTER TABLE `order` ADD CONSTRAINT `order_branchId_fkey` FOREIGN KEY (`branchId`) REFERENCES `Branch`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `orderBillItems` ADD CONSTRAINT `orderBillItems_orderId_fkey` FOREIGN KEY (`orderId`) REFERENCES `order`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
