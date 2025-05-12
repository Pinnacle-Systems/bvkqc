-- CreateTable
CREATE TABLE `MailTransaction` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `date` DATE NULL,
    `orderId` INTEGER NULL,
    `sender` VARCHAR(191) NULL,
    `receiver` VARCHAR(191) NULL,
    `from` LONGTEXT NULL,
    `to` LONGTEXT NULL,
    `cc` LONGTEXT NULL,
    `subject` LONGTEXT NULL,
    `messages` LONGTEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `createdById` INTEGER NULL,
    `updatedById` INTEGER NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `MailTransAttachments` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `date` DATE NULL,
    `mailTransactionId` INTEGER NULL,
    `fileName` VARCHAR(191) NULL,
    `filePath` VARCHAR(191) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `MailTransaction` ADD CONSTRAINT `MailTransaction_orderId_fkey` FOREIGN KEY (`orderId`) REFERENCES `order`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `MailTransaction` ADD CONSTRAINT `MailTransaction_createdById_fkey` FOREIGN KEY (`createdById`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `MailTransaction` ADD CONSTRAINT `MailTransaction_updatedById_fkey` FOREIGN KEY (`updatedById`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `MailTransAttachments` ADD CONSTRAINT `MailTransAttachments_mailTransactionId_fkey` FOREIGN KEY (`mailTransactionId`) REFERENCES `MailTransaction`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
