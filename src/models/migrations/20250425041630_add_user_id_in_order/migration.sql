-- AlterTable
ALTER TABLE `order` ADD COLUMN `userId` INTEGER NULL;

-- AlterTable
ALTER TABLE `user` MODIFY `username` VARCHAR(191) NULL,
    MODIFY `active` BOOLEAN NULL DEFAULT true;

-- AddForeignKey
ALTER TABLE `order` ADD CONSTRAINT `order_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
