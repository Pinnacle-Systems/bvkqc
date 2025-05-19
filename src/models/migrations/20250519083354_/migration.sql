/*
  Warnings:

  - You are about to drop the column `seletedApprover` on the `role` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `role` DROP COLUMN `seletedApprover`;

-- CreateTable
CREATE TABLE `ApprovalDoneBy` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `seletedApprover` VARCHAR(191) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
