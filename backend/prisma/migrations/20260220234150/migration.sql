/*
  Warnings:

  - The `status` column on the `class_waitlist` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `status` column on the `member_class_passes` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `status` column on the `notification_logs` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `type` column on the `notifications` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - Changed the type of `transaction_type` on the `class_credit_transactions` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `pass_type` on the `class_packages` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "WaitlistStatus" AS ENUM ('WAITING', 'NOTIFIED', 'EXPIRED', 'BOOKED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "PassStatus" AS ENUM ('ACTIVE', 'EXPIRED', 'CANCELLED', 'USED');

-- CreateEnum
CREATE TYPE "ClassPassType" AS ENUM ('BUNDLE', 'MONTHLY');

-- CreateEnum
CREATE TYPE "CreditTransactionType" AS ENUM ('PURCHASE', 'USAGE', 'REFUND', 'EXPIRE');

-- CreateEnum
CREATE TYPE "NotificationLogStatus" AS ENUM ('PENDING', 'SENT', 'FAILED');

-- AlterTable
ALTER TABLE "class_credit_transactions" DROP COLUMN "transaction_type",
ADD COLUMN     "transaction_type" "CreditTransactionType" NOT NULL;

-- AlterTable
ALTER TABLE "class_packages" DROP COLUMN "pass_type",
ADD COLUMN     "pass_type" "ClassPassType" NOT NULL;

-- AlterTable
ALTER TABLE "class_waitlist" DROP COLUMN "status",
ADD COLUMN     "status" "WaitlistStatus" NOT NULL DEFAULT 'WAITING';

-- AlterTable
ALTER TABLE "member_class_passes" DROP COLUMN "status",
ADD COLUMN     "status" "PassStatus" NOT NULL DEFAULT 'ACTIVE';

-- AlterTable
ALTER TABLE "notification_logs" DROP COLUMN "status",
ADD COLUMN     "status" "NotificationLogStatus" NOT NULL DEFAULT 'PENDING';

-- AlterTable
ALTER TABLE "notifications" DROP COLUMN "type",
ADD COLUMN     "type" "NotificationType" NOT NULL DEFAULT 'IN_APP';

-- CreateIndex
CREATE INDEX "class_credit_transactions_transaction_type_idx" ON "class_credit_transactions"("transaction_type");

-- CreateIndex
CREATE INDEX "class_packages_pass_type_idx" ON "class_packages"("pass_type");

-- CreateIndex
CREATE INDEX "class_waitlist_status_idx" ON "class_waitlist"("status");

-- CreateIndex
CREATE INDEX "member_class_passes_status_idx" ON "member_class_passes"("status");

-- CreateIndex
CREATE INDEX "notification_logs_status_idx" ON "notification_logs"("status");
