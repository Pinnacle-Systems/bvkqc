-- DropForeignKey
ALTER TABLE `useronbranch` DROP FOREIGN KEY `UserOnBranch_userId_fkey`;

-- AddForeignKey
ALTER TABLE `UserOnBranch` ADD CONSTRAINT `UserOnBranch_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
