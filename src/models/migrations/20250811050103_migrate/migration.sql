-- AlterTable
ALTER TABLE `aqlinspection` ADD COLUMN `employeeId` INTEGER NULL,
    ADD COLUMN `lineMasterId` INTEGER NULL;

-- AddForeignKey
ALTER TABLE `AqlInspection` ADD CONSTRAINT `AqlInspection_lineMasterId_fkey` FOREIGN KEY (`lineMasterId`) REFERENCES `LineMaster`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AqlInspection` ADD CONSTRAINT `AqlInspection_employeeId_fkey` FOREIGN KEY (`employeeId`) REFERENCES `Employee`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
