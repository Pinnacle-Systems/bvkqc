-- AlterTable
ALTER TABLE `mailtransaction` ADD COLUMN `previousMailId` INTEGER NULL,
    ADD COLUMN `userId` INTEGER NULL,
    ADD COLUMN `userName` VARCHAR(191) NULL;

-- AddForeignKey
ALTER TABLE `MailTransaction` ADD CONSTRAINT `MailTransaction_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
