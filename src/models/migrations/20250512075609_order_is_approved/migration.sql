-- AlterTable
ALTER TABLE `order` ADD COLUMN `isApproved` BOOLEAN NULL DEFAULT false,
    ADD COLUMN `isMailSent` BOOLEAN NULL DEFAULT false;
