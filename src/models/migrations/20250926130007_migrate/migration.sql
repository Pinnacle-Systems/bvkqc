-- CreateTable
CREATE TABLE `SAqlInspection` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `companyId` VARCHAR(191) NOT NULL,
    `reference` VARCHAR(191) NOT NULL,
    `inspectionDate` DATETIME(3) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `color` VARCHAR(191) NULL,
    `approveStatus` INTEGER NULL,
    `lineMasterId` INTEGER NULL,
    `employeeId` INTEGER NULL,

    INDEX `SAqlInspection_companyId_idx`(`companyId`),
    INDEX `SAqlInspection_reference_idx`(`reference`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `SSample` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `beforeAqlInspectionId` INTEGER NULL,
    `afterAqlInspectionId` INTEGER NULL,
    `size` VARCHAR(191) NOT NULL,
    `condition` ENUM('BEFORE', 'AFTER') NOT NULL DEFAULT 'BEFORE',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `SSampleMeasurement` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `sampleId` INTEGER NOT NULL,
    `measurementId` INTEGER NOT NULL,
    `operationId` INTEGER NOT NULL,
    `standardValue` DOUBLE NOT NULL,
    `toleranceMin` DOUBLE NOT NULL,
    `toleranceMax` DOUBLE NOT NULL,
    `unit` VARCHAR(191) NOT NULL,
    `mcNo` VARCHAR(191) NULL,
    `spi` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `defectId` INTEGER NULL,
    `defectCorrectionId` INTEGER NULL,

    INDEX `SSampleMeasurement_sampleId_idx`(`sampleId`),
    INDEX `SSampleMeasurement_measurementId_idx`(`measurementId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `SSampleValue` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `sampleMeasurementId` INTEGER NOT NULL,
    `pieceNumber` INTEGER NOT NULL,
    `actualValue` DOUBLE NOT NULL,
    `status` ENUM('within_tolerance', 'out_of_tolerance') NOT NULL DEFAULT 'within_tolerance',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `SSampleValue_sampleMeasurementId_idx`(`sampleMeasurementId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `SAqlInspection` ADD CONSTRAINT `SAqlInspection_lineMasterId_fkey` FOREIGN KEY (`lineMasterId`) REFERENCES `LineMaster`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `SAqlInspection` ADD CONSTRAINT `SAqlInspection_employeeId_fkey` FOREIGN KEY (`employeeId`) REFERENCES `Employee`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `SSample` ADD CONSTRAINT `SSample_beforeAqlInspectionId_fkey` FOREIGN KEY (`beforeAqlInspectionId`) REFERENCES `SAqlInspection`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `SSample` ADD CONSTRAINT `SSample_afterAqlInspectionId_fkey` FOREIGN KEY (`afterAqlInspectionId`) REFERENCES `SAqlInspection`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `SSampleMeasurement` ADD CONSTRAINT `SSampleMeasurement_sampleId_fkey` FOREIGN KEY (`sampleId`) REFERENCES `SSample`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `SSampleMeasurement` ADD CONSTRAINT `SSampleMeasurement_measurementId_fkey` FOREIGN KEY (`measurementId`) REFERENCES `Measurement`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `SSampleMeasurement` ADD CONSTRAINT `SSampleMeasurement_operationId_fkey` FOREIGN KEY (`operationId`) REFERENCES `Operation`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `SSampleMeasurement` ADD CONSTRAINT `SSampleMeasurement_defectId_fkey` FOREIGN KEY (`defectId`) REFERENCES `Defect`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `SSampleMeasurement` ADD CONSTRAINT `SSampleMeasurement_defectCorrectionId_fkey` FOREIGN KEY (`defectCorrectionId`) REFERENCES `DefectCorrection`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `SSampleValue` ADD CONSTRAINT `SSampleValue_sampleMeasurementId_fkey` FOREIGN KEY (`sampleMeasurementId`) REFERENCES `SSampleMeasurement`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
