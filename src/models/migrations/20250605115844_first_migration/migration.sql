/*
  Warnings:

  - You are about to drop the `fabric` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `supportingdoc` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `testresult` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `supportingdoc` DROP FOREIGN KEY `SupportingDoc_fabricId_fkey`;

-- DropForeignKey
ALTER TABLE `testresult` DROP FOREIGN KEY `TestResult_fabricId_fkey`;

-- DropTable
DROP TABLE `fabric`;

-- DropTable
DROP TABLE `supportingdoc`;

-- DropTable
DROP TABLE `testresult`;

-- CreateTable
CREATE TABLE `StyleSheet` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `fdsDate` DATETIME(3) NULL,
    `fabCode` VARCHAR(191) NULL,
    `fabType` VARCHAR(191) NULL,
    `countryOriginFabric` VARCHAR(191) NULL,
    `countryOriginYarn` VARCHAR(191) NULL,
    `countryOriginFiber` VARCHAR(191) NULL,
    `smsMcq` VARCHAR(191) NULL,
    `smsMoq` VARCHAR(191) NULL,
    `smsLeadTime` VARCHAR(191) NULL,
    `bulkMcq` VARCHAR(191) NULL,
    `bulkMoq` VARCHAR(191) NULL,
    `bulkLeadTime` VARCHAR(191) NULL,
    `surCharges` VARCHAR(191) NULL,
    `priceFob` VARCHAR(191) NULL,
    `fabricImage` TEXT NULL,
    `construction` VARCHAR(191) NULL,
    `fiberContent` VARCHAR(191) NULL,
    `yarnDetails` VARCHAR(191) NULL,
    `weightGSM` VARCHAR(191) NULL,
    `weftWalesCount` VARCHAR(191) NULL,
    `widthFinished` VARCHAR(191) NULL,
    `widthCuttale` VARCHAR(191) NULL,
    `wrapCoursesCount` VARCHAR(191) NULL,
    `dyedMethod` VARCHAR(191) NULL,
    `printingMethod` VARCHAR(191) NULL,
    `surfaceFinish` VARCHAR(191) NULL,
    `otherPerformanceFunction` VARCHAR(191) NULL,
    `testName` VARCHAR(191) NULL,
    `testResult` VARCHAR(191) NULL,
    `testStandard` VARCHAR(191) NULL,
    `additionalTests` JSON NULL,
    `careInstructions` VARCHAR(191) NULL,
    `qualityLimitations` VARCHAR(191) NULL,
    `reportData` TEXT NULL,
    `supportingDocs` JSON NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
