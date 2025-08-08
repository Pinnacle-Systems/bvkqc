-- AlterTable
ALTER TABLE `inchargelinelistmaster` ADD COLUMN `Size` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `lineallocationinchargemaster` ADD COLUMN `UserId` INTEGER NULL;

-- AddForeignKey
ALTER TABLE `LineAllocationInchargeMaster` ADD CONSTRAINT `LineAllocationInchargeMaster_UserId_fkey` FOREIGN KEY (`UserId`) REFERENCES `Employee`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
