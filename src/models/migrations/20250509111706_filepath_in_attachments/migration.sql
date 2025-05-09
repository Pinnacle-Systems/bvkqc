-- AlterTable
ALTER TABLE `attachments` ADD COLUMN `comments` LONGTEXT NULL,
    ADD COLUMN `filePath` VARCHAR(191) NULL,
    ADD COLUMN `log` LONGTEXT NULL;
