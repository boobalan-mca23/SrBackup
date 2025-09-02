-- CreateTable
CREATE TABLE `User` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `username` VARCHAR(191) NOT NULL,
    `password` VARCHAR(191) NOT NULL,
    `role` VARCHAR(191) NOT NULL DEFAULT 'user',
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `goldsmithAccess` BOOLEAN NOT NULL DEFAULT false,
    `itemMasterAccess` BOOLEAN NOT NULL DEFAULT false,
    `sealMasterAccess` BOOLEAN NOT NULL DEFAULT false,
    `canCreateUser` BOOLEAN NOT NULL DEFAULT false,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `User_username_key`(`username`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Customer` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `phone` VARCHAR(191) NULL,
    `address` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `MasterItem` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `itemName` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `MasterSealItem` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `sealName` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `MasterTouch` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `touch` DOUBLE NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `CoinStock` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `coinType` VARCHAR(191) NOT NULL,
    `gram` DOUBLE NOT NULL,
    `quantity` INTEGER NOT NULL,
    `touch` DOUBLE NOT NULL,
    `totalWeight` DOUBLE NOT NULL,
    `purity` DOUBLE NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `StockLog` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `coinType` VARCHAR(191) NOT NULL,
    `gram` DOUBLE NOT NULL,
    `quantity` INTEGER NOT NULL,
    `changeType` VARCHAR(191) NOT NULL,
    `reason` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `coinStockId` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Goldsmith` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `phone` VARCHAR(191) NULL,
    `address` VARCHAR(191) NULL,
    `wastage` DOUBLE NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `GoldSmithBalance` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `goldsmithId` INTEGER NOT NULL,
    `balance` DOUBLE NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `JobCard` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `goldsmithId` INTEGER NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `GivenGold` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `jobcardId` INTEGER NOT NULL,
    `username` VARCHAR(191) NULL,
    `itemName` VARCHAR(191) NULL,
    `weight` DOUBLE NULL,
    `touch` DOUBLE NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `DeliveryItem` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `jobcardId` INTEGER NOT NULL,
    `weight` DOUBLE NULL,
    `itemName` VARCHAR(191) NULL,
    `sealName` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `GoldSmithReceived` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `weight` DOUBLE NULL,
    `touch` DOUBLE NULL,
    `jobCardId` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Item` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `masterItemId` INTEGER NOT NULL,
    `jobCardId` INTEGER NOT NULL,
    `originalGivenWeight` DOUBLE NOT NULL,
    `givenWeight` DOUBLE NOT NULL,
    `touch` DOUBLE NOT NULL,
    `estimateWeight` DOUBLE NOT NULL,
    `finalWeight` DOUBLE NULL,
    `wastage` DOUBLE NULL,
    `purity` DOUBLE NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `AdditionalWeight` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `jobcardId` INTEGER NOT NULL,
    `type` VARCHAR(191) NULL,
    `customType` VARCHAR(191) NULL,
    `weight` DOUBLE NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `JobcardTotal` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `givenWt` DOUBLE NULL,
    `itemWt` DOUBLE NULL,
    `stoneWt` DOUBLE NULL,
    `wastage` DOUBLE NULL,
    `goldSmithWastage` DOUBLE NULL,
    `openBal` DOUBLE NULL,
    `balance` DOUBLE NULL,
    `receivedTotal` DOUBLE NULL,
    `isFinished` VARCHAR(191) NULL,
    `jobcardId` INTEGER NOT NULL,
    `goldsmithId` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `JobCardReceived` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `balance` DOUBLE NULL,
    `received` DOUBLE NULL,
    `jobcardId` INTEGER NOT NULL,
    `goldsmithId` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Bill` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `billNo` VARCHAR(191) NOT NULL,
    `customerId` INTEGER NOT NULL,
    `goldRate` DOUBLE NOT NULL,
    `hallmarkCharges` DOUBLE NOT NULL DEFAULT 0,
    `totalWeight` DOUBLE NOT NULL,
    `totalPurity` DOUBLE NOT NULL,
    `totalAmount` DOUBLE NOT NULL,
    `date` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Bill_billNo_key`(`billNo`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `BillItem` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `billId` INTEGER NOT NULL,
    `coinValue` DOUBLE NOT NULL,
    `quantity` INTEGER NOT NULL,
    `percentage` INTEGER NOT NULL,
    `touch` DOUBLE NULL,
    `weight` DOUBLE NOT NULL,
    `purity` DOUBLE NOT NULL,
    `amount` DOUBLE NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ReceivedDetail` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `billId` INTEGER NOT NULL,
    `date` DATETIME(3) NOT NULL,
    `goldRate` DOUBLE NOT NULL,
    `givenGold` DOUBLE NOT NULL,
    `touch` DOUBLE NOT NULL,
    `purityWeight` DOUBLE NOT NULL,
    `amount` DOUBLE NOT NULL,
    `hallmark` DOUBLE NOT NULL DEFAULT 0,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `JewelStock` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `jewelName` VARCHAR(191) NOT NULL,
    `weight` DOUBLE NOT NULL,
    `stoneWeight` DOUBLE NOT NULL,
    `finalWeight` DOUBLE NOT NULL,
    `touch` DOUBLE NOT NULL,
    `purityValue` DOUBLE NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Transaction` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `date` DATETIME(3) NOT NULL,
    `type` VARCHAR(191) NOT NULL,
    `value` DOUBLE NOT NULL,
    `goldRate` DOUBLE NULL,
    `purity` DOUBLE NOT NULL,
    `touch` DOUBLE NULL,
    `customerId` INTEGER NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Entry` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `date` DATETIME(3) NOT NULL,
    `type` VARCHAR(191) NOT NULL,
    `cashAmount` DOUBLE NULL,
    `goldValue` DOUBLE NULL,
    `touch` DOUBLE NULL,
    `purity` DOUBLE NULL,
    `goldRate` DOUBLE NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `customer_order` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `customer_id` INTEGER NOT NULL,
    `order_group_id` INTEGER NOT NULL,
    `item_name` VARCHAR(191) NOT NULL,
    `description` VARCHAR(191) NOT NULL,
    `weight` DOUBLE NOT NULL,
    `image` VARCHAR(191) NULL,
    `due_date` DATETIME(3) NULL,
    `status` VARCHAR(191) NOT NULL DEFAULT 'Pending',
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `product_multiple_images` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `customer_order_id` INTEGER NOT NULL,
    `filename` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `StockLog` ADD CONSTRAINT `StockLog_coinStockId_fkey` FOREIGN KEY (`coinStockId`) REFERENCES `CoinStock`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `GoldSmithBalance` ADD CONSTRAINT `GoldSmithBalance_goldsmithId_fkey` FOREIGN KEY (`goldsmithId`) REFERENCES `Goldsmith`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `JobCard` ADD CONSTRAINT `JobCard_goldsmithId_fkey` FOREIGN KEY (`goldsmithId`) REFERENCES `Goldsmith`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `GivenGold` ADD CONSTRAINT `GivenGold_jobcardId_fkey` FOREIGN KEY (`jobcardId`) REFERENCES `JobCard`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `DeliveryItem` ADD CONSTRAINT `DeliveryItem_jobcardId_fkey` FOREIGN KEY (`jobcardId`) REFERENCES `JobCard`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `GoldSmithReceived` ADD CONSTRAINT `GoldSmithReceived_jobCardId_fkey` FOREIGN KEY (`jobCardId`) REFERENCES `JobCard`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Item` ADD CONSTRAINT `Item_masterItemId_fkey` FOREIGN KEY (`masterItemId`) REFERENCES `MasterItem`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Item` ADD CONSTRAINT `Item_jobCardId_fkey` FOREIGN KEY (`jobCardId`) REFERENCES `JobCard`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AdditionalWeight` ADD CONSTRAINT `AdditionalWeight_jobcardId_fkey` FOREIGN KEY (`jobcardId`) REFERENCES `JobCard`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `JobcardTotal` ADD CONSTRAINT `JobcardTotal_goldsmithId_fkey` FOREIGN KEY (`goldsmithId`) REFERENCES `Goldsmith`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `JobcardTotal` ADD CONSTRAINT `JobcardTotal_jobcardId_fkey` FOREIGN KEY (`jobcardId`) REFERENCES `JobCard`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `JobCardReceived` ADD CONSTRAINT `JobCardReceived_goldsmithId_fkey` FOREIGN KEY (`goldsmithId`) REFERENCES `Goldsmith`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `JobCardReceived` ADD CONSTRAINT `JobCardReceived_jobcardId_fkey` FOREIGN KEY (`jobcardId`) REFERENCES `JobCard`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Bill` ADD CONSTRAINT `Bill_customerId_fkey` FOREIGN KEY (`customerId`) REFERENCES `Customer`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `BillItem` ADD CONSTRAINT `BillItem_billId_fkey` FOREIGN KEY (`billId`) REFERENCES `Bill`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ReceivedDetail` ADD CONSTRAINT `ReceivedDetail_billId_fkey` FOREIGN KEY (`billId`) REFERENCES `Bill`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Transaction` ADD CONSTRAINT `Transaction_customerId_fkey` FOREIGN KEY (`customerId`) REFERENCES `Customer`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `customer_order` ADD CONSTRAINT `customer_order_customer_id_fkey` FOREIGN KEY (`customer_id`) REFERENCES `Customer`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `product_multiple_images` ADD CONSTRAINT `product_multiple_images_customer_order_id_fkey` FOREIGN KEY (`customer_order_id`) REFERENCES `customer_order`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
