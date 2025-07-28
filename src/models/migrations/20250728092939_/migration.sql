-- CreateTable
CREATE TABLE `AqlInspection` (
    `id` VARCHAR(191) NOT NULL,
    `companyId` VARCHAR(191) NOT NULL,
    `reference` VARCHAR(191) NOT NULL,
    `inspectionDate` DATETIME(3) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `AqlInspection_reference_key`(`reference`),
    INDEX `AqlInspection_companyId_idx`(`companyId`),
    INDEX `AqlInspection_reference_idx`(`reference`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Sample` (
    `id` VARCHAR(191) NOT NULL,
    `aqlInspectionId` VARCHAR(191) NOT NULL,
    `size` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `Sample_aqlInspectionId_idx`(`aqlInspectionId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `SampleMeasurement` (
    `id` VARCHAR(191) NOT NULL,
    `sampleId` VARCHAR(191) NOT NULL,
    `measurementId` VARCHAR(191) NOT NULL,
    `standardValue` DOUBLE NOT NULL,
    `toleranceMin` DOUBLE NOT NULL,
    `toleranceMax` DOUBLE NOT NULL,
    `unit` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `SampleMeasurement_sampleId_idx`(`sampleId`),
    INDEX `SampleMeasurement_measurementId_idx`(`measurementId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `SampleValue` (
    `id` VARCHAR(191) NOT NULL,
    `sampleMeasurementId` VARCHAR(191) NOT NULL,
    `pieceNumber` INTEGER NOT NULL,
    `actualValue` DOUBLE NOT NULL,
    `status` ENUM('within_tolerance', 'out_of_tolerance') NOT NULL DEFAULT 'within_tolerance',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `SampleValue_sampleMeasurementId_idx`(`sampleMeasurementId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Sample` ADD CONSTRAINT `Sample_aqlInspectionId_fkey` FOREIGN KEY (`aqlInspectionId`) REFERENCES `AqlInspection`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `SampleMeasurement` ADD CONSTRAINT `SampleMeasurement_sampleId_fkey` FOREIGN KEY (`sampleId`) REFERENCES `Sample`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `SampleMeasurement` ADD CONSTRAINT `SampleMeasurement_measurementId_fkey` FOREIGN KEY (`measurementId`) REFERENCES `Measurement`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `SampleValue` ADD CONSTRAINT `SampleValue_sampleMeasurementId_fkey` FOREIGN KEY (`sampleMeasurementId`) REFERENCES `SampleMeasurement`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
