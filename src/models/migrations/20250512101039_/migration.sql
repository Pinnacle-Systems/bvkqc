-- AlterTable
ALTER TABLE `attachments` ADD COLUMN `isBuyerAttachments` BOOLEAN NULL DEFAULT false,
    ADD COLUMN `isVendorAttachments` BOOLEAN NULL DEFAULT false;
