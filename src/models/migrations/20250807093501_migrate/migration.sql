-- DropForeignKey
ALTER TABLE `inchargelinelistmaster` DROP FOREIGN KEY `InchargeLineListMaster_lineAllocationInchargeMasterId_fkey`;

-- AddForeignKey
ALTER TABLE `InchargeLineListMaster` ADD CONSTRAINT `InchargeLineListMaster_lineAllocationInchargeMasterId_fkey` FOREIGN KEY (`lineAllocationInchargeMasterId`) REFERENCES `LineAllocationInchargeMaster`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
