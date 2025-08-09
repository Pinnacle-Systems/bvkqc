/*
  Warnings:

  - You are about to drop the column `ayanCondition` on the `aqlinspection` table. All the data in the column will be lost.
  - You are about to drop the column `aqlInspectionId` on the `sample` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE `sample` DROP FOREIGN KEY `Sample_aqlInspectionId_fkey`;

-- AlterTable
ALTER TABLE `aqlinspection` DROP COLUMN `ayanCondition`;

-- AlterTable
ALTER TABLE `sample` DROP COLUMN `aqlInspectionId`,
    ADD COLUMN `afterAqlInspectionId` INTEGER NULL,
    ADD COLUMN `beforeAqlInspectionId` INTEGER NULL,
    ADD COLUMN `condition` ENUM('BEFORE', 'AFTER') NOT NULL DEFAULT 'BEFORE';

-- AddForeignKey
ALTER TABLE `Sample` ADD CONSTRAINT `Sample_beforeAqlInspectionId_fkey` FOREIGN KEY (`beforeAqlInspectionId`) REFERENCES `AqlInspection`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Sample` ADD CONSTRAINT `Sample_afterAqlInspectionId_fkey` FOREIGN KEY (`afterAqlInspectionId`) REFERENCES `AqlInspection`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
