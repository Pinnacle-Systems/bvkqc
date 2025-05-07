/*
  Warnings:

  - You are about to drop the `excessqty` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE `excessqty`;

-- CreateTable
CREATE TABLE `percentage` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `qty` INTEGER NULL,
    `active` BOOLEAN NOT NULL DEFAULT false,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
