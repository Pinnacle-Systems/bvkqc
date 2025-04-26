-- AlterTable
ALTER TABLE `order` ADD COLUMN `buyerGmail` VARCHAR(191) NULL,
    ADD COLUMN `isApproval` BOOLEAN NOT NULL DEFAULT false;
