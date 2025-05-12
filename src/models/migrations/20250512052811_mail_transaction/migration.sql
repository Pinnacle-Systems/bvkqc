/*
  Warnings:

  - You are about to drop the column `receiver` on the `mailtransaction` table. All the data in the column will be lost.
  - You are about to drop the column `sender` on the `mailtransaction` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `mailtransaction` DROP COLUMN `receiver`,
    DROP COLUMN `sender`,
    ADD COLUMN `receiverId` INTEGER NULL,
    ADD COLUMN `receiverName` VARCHAR(191) NULL,
    ADD COLUMN `senderId` INTEGER NULL,
    ADD COLUMN `senderName` VARCHAR(191) NULL;

-- AddForeignKey
ALTER TABLE `MailTransaction` ADD CONSTRAINT `MailTransaction_senderId_fkey` FOREIGN KEY (`senderId`) REFERENCES `Party`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `MailTransaction` ADD CONSTRAINT `MailTransaction_receiverId_fkey` FOREIGN KEY (`receiverId`) REFERENCES `Party`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
