-- AlterTable
ALTER TABLE `linemaster` ADD COLUMN `companyId` INTEGER NULL;

-- AddForeignKey
ALTER TABLE `LineMaster` ADD CONSTRAINT `LineMaster_companyId_fkey` FOREIGN KEY (`companyId`) REFERENCES `Company`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
