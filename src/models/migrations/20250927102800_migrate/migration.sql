-- AlterTable
ALTER TABLE `saqlinspection` ADD COLUMN `userId` INTEGER NULL;

-- AddForeignKey
ALTER TABLE `SAqlInspection` ADD CONSTRAINT `SAqlInspection_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
