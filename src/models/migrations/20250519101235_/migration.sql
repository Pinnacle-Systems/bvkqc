/*
  Warnings:

  - You are about to drop the column `seletedApprover` on the `approvaldoneby` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `approvaldoneby` DROP COLUMN `seletedApprover`,
    ADD COLUMN `selectedApprover` VARCHAR(191) NULL;
