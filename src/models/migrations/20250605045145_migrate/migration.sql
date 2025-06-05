-- CreateTable
CREATE TABLE `Fabric` (
    `id` VARCHAR(191) NOT NULL,
    `selectedCountryCode` VARCHAR(191) NULL,
    `selectedCountryName` VARCHAR(191) NULL,
    `fabricImage` VARCHAR(191) NULL,
    `construction` VARCHAR(191) NULL,
    `fiberContent` VARCHAR(191) NULL,
    `yarnDetails` VARCHAR(191) NULL,
    `weightGSM` VARCHAR(191) NULL,
    `weightOpposite` VARCHAR(191) NULL,
    `weftWalesCount` VARCHAR(191) NULL,
    `widthFinished` VARCHAR(191) NULL,
    `widthCuttale` VARCHAR(191) NULL,
    `wrapCoursesCount` VARCHAR(191) NULL,
    `dyedMethod` VARCHAR(191) NULL,
    `printingMethod` VARCHAR(191) NULL,
    `surfaceFinish` VARCHAR(191) NULL,
    `otherPerformanceFunction` VARCHAR(191) NULL,
    `careInstructions` VARCHAR(191) NULL,
    `qualityLimitations` VARCHAR(191) NULL,
    `reportData` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `TestResult` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `result` VARCHAR(191) NOT NULL,
    `standard` VARCHAR(191) NULL,
    `fabricId` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `SupportingDoc` (
    `id` VARCHAR(191) NOT NULL,
    `fileName` VARCHAR(191) NOT NULL,
    `fileUrl` VARCHAR(191) NOT NULL,
    `fabricId` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `TestResult` ADD CONSTRAINT `TestResult_fabricId_fkey` FOREIGN KEY (`fabricId`) REFERENCES `Fabric`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `SupportingDoc` ADD CONSTRAINT `SupportingDoc_fabricId_fkey` FOREIGN KEY (`fabricId`) REFERENCES `Fabric`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
