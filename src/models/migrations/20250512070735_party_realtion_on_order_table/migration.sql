/*
  Warnings:

  - You are about to drop the column `manufacture` on the `order` table. All the data in the column will be lost.
  - You are about to drop the column `vendor` on the `order` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `order` DROP COLUMN `manufacture`,
    DROP COLUMN `vendor`;

-- AddForeignKey
ALTER TABLE `order` ADD CONSTRAINT `order_vendorId_fkey` FOREIGN KEY (`vendorId`) REFERENCES `Party`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
