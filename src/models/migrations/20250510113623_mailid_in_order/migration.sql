-- AlterTable
ALTER TABLE `order` ADD COLUMN `manufacturerMailId` VARCHAR(191) NULL;

-- AddForeignKey
ALTER TABLE `order` ADD CONSTRAINT `order_manufactureId_fkey` FOREIGN KEY (`manufactureId`) REFERENCES `Party`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
