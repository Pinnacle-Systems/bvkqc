/*
  Warnings:

  - You are about to drop the column `seletedApprover` on the `roleonpage` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `role` ADD COLUMN `seletedApprover` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `roleonpage` DROP COLUMN `seletedApprover`;
