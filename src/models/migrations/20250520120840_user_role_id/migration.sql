-- AlterTable
ALTER TABLE `order` ADD COLUMN `userRoleId` INTEGER NULL;

-- AddForeignKey
ALTER TABLE `order` ADD CONSTRAINT `order_userRoleId_fkey` FOREIGN KEY (`userRoleId`) REFERENCES `Role`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
