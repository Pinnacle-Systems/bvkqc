/*
  Warnings:

  - The primary key for the `aqlinspection` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to alter the column `id` on the `aqlinspection` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `Int`.
  - The primary key for the `sample` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to alter the column `id` on the `sample` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `Int`.
  - You are about to alter the column `aqlInspectionId` on the `sample` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `Int`.
  - The primary key for the `samplemeasurement` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to alter the column `id` on the `samplemeasurement` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `Int`.
  - You are about to alter the column `sampleId` on the `samplemeasurement` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `Int`.
  - The primary key for the `samplevalue` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to alter the column `id` on the `samplevalue` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `Int`.
  - You are about to alter the column `sampleMeasurementId` on the `samplevalue` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `Int`.

*/
-- DropForeignKey
ALTER TABLE `sample` DROP FOREIGN KEY `Sample_aqlInspectionId_fkey`;

-- DropForeignKey
ALTER TABLE `samplemeasurement` DROP FOREIGN KEY `SampleMeasurement_sampleId_fkey`;

-- DropForeignKey
ALTER TABLE `samplevalue` DROP FOREIGN KEY `SampleValue_sampleMeasurementId_fkey`;

-- AlterTable
ALTER TABLE `aqlinspection` DROP PRIMARY KEY,
    MODIFY `id` INTEGER NOT NULL AUTO_INCREMENT,
    ADD PRIMARY KEY (`id`);

-- AlterTable
ALTER TABLE `sample` DROP PRIMARY KEY,
    MODIFY `id` INTEGER NOT NULL AUTO_INCREMENT,
    MODIFY `aqlInspectionId` INTEGER NOT NULL,
    ADD PRIMARY KEY (`id`);

-- AlterTable
ALTER TABLE `samplemeasurement` DROP PRIMARY KEY,
    MODIFY `id` INTEGER NOT NULL AUTO_INCREMENT,
    MODIFY `sampleId` INTEGER NOT NULL,
    ADD PRIMARY KEY (`id`);

-- AlterTable
ALTER TABLE `samplevalue` DROP PRIMARY KEY,
    MODIFY `id` INTEGER NOT NULL AUTO_INCREMENT,
    MODIFY `sampleMeasurementId` INTEGER NOT NULL,
    ADD PRIMARY KEY (`id`);

-- AddForeignKey
ALTER TABLE `Sample` ADD CONSTRAINT `Sample_aqlInspectionId_fkey` FOREIGN KEY (`aqlInspectionId`) REFERENCES `AqlInspection`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `SampleMeasurement` ADD CONSTRAINT `SampleMeasurement_sampleId_fkey` FOREIGN KEY (`sampleId`) REFERENCES `Sample`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `SampleValue` ADD CONSTRAINT `SampleValue_sampleMeasurementId_fkey` FOREIGN KEY (`sampleMeasurementId`) REFERENCES `SampleMeasurement`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
