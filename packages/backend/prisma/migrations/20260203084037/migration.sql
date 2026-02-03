/*
  Warnings:

  - You are about to drop the column `createdAt` on the `attendance` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `attendance` table. All the data in the column will be lost.
  - You are about to drop the column `bookedAt` on the `class_bookings` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `class_bookings` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `class_schedules` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `class_schedules` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `classes` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `classes` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `equipment` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `equipment` table. All the data in the column will be lost.
  - You are about to drop the column `bodyFat` on the `members` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `members` table. All the data in the column will be lost.
  - You are about to drop the column `currentWeight` on the `members` table. All the data in the column will be lost.
  - You are about to drop the column `dateOfBirth` on the `members` table. All the data in the column will be lost.
  - You are about to drop the column `emergencyContact` on the `members` table. All the data in the column will be lost.
  - You are about to drop the column `targetWeight` on the `members` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `members` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `members` table. All the data in the column will be lost.
  - You are about to drop the column `accessToEquipment` on the `membership_plans` table. All the data in the column will be lost.
  - You are about to drop the column `accessToLocker` on the `membership_plans` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `membership_plans` table. All the data in the column will be lost.
  - You are about to drop the column `nutritionConsultation` on the `membership_plans` table. All the data in the column will be lost.
  - You are about to drop the column `personalTrainingHours` on the `membership_plans` table. All the data in the column will be lost.
  - You are about to drop the column `unlimitedClasses` on the `membership_plans` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `membership_plans` table. All the data in the column will be lost.
  - You are about to drop the column `autoRenew` on the `subscriptions` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `subscriptions` table. All the data in the column will be lost.
  - You are about to drop the column `endDate` on the `subscriptions` table. All the data in the column will be lost.
  - You are about to drop the column `memberId` on the `subscriptions` table. All the data in the column will be lost.
  - You are about to drop the column `membershipPlanId` on the `subscriptions` table. All the data in the column will be lost.
  - You are about to drop the column `renewalDate` on the `subscriptions` table. All the data in the column will be lost.
  - You are about to drop the column `startDate` on the `subscriptions` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `subscriptions` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `trainer_sessions` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `trainer_sessions` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `trainers` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `trainers` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `trainers` table. All the data in the column will be lost.
  - You are about to drop the column `recordedAt` on the `user_progress` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `firstName` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `lastName` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `phone` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `workout_plans` table. All the data in the column will be lost.
  - You are about to drop the column `endDate` on the `workout_plans` table. All the data in the column will be lost.
  - You are about to drop the column `isActive` on the `workout_plans` table. All the data in the column will be lost.
  - You are about to drop the column `startDate` on the `workout_plans` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `workout_plans` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[user_id]` on the table `members` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[user_id]` on the table `trainers` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `updated_at` to the `attendance` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_at` to the `class_bookings` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_at` to the `class_schedules` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_at` to the `classes` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_at` to the `equipment` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_at` to the `members` table without a default value. This is not possible if the table is not empty.
  - Added the required column `user_id` to the `members` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_at` to the `membership_plans` table without a default value. This is not possible if the table is not empty.
  - Added the required column `end_date` to the `subscriptions` table without a default value. This is not possible if the table is not empty.
  - Added the required column `member_id` to the `subscriptions` table without a default value. This is not possible if the table is not empty.
  - Added the required column `membership_plan_id` to the `subscriptions` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_at` to the `subscriptions` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_at` to the `trainer_sessions` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_at` to the `trainers` table without a default value. This is not possible if the table is not empty.
  - Added the required column `user_id` to the `trainers` table without a default value. This is not possible if the table is not empty.
  - Added the required column `first_name` to the `users` table without a default value. This is not possible if the table is not empty.
  - Added the required column `last_name` to the `users` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_at` to the `users` table without a default value. This is not possible if the table is not empty.
  - Added the required column `end_date` to the `workout_plans` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_at` to the `workout_plans` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "members" DROP CONSTRAINT "members_userId_fkey";

-- DropForeignKey
ALTER TABLE "subscriptions" DROP CONSTRAINT "subscriptions_memberId_fkey";

-- DropForeignKey
ALTER TABLE "subscriptions" DROP CONSTRAINT "subscriptions_membershipPlanId_fkey";

-- DropForeignKey
ALTER TABLE "trainers" DROP CONSTRAINT "trainers_userId_fkey";

-- DropIndex
DROP INDEX "members_userId_idx";

-- DropIndex
DROP INDEX "members_userId_key";

-- DropIndex
DROP INDEX "subscriptions_memberId_idx";

-- DropIndex
DROP INDEX "subscriptions_membershipPlanId_idx";

-- DropIndex
DROP INDEX "trainers_userId_idx";

-- DropIndex
DROP INDEX "trainers_userId_key";

-- DropIndex
DROP INDEX "user_progress_recordedAt_idx";

-- DropIndex
DROP INDEX "workout_plans_isActive_idx";

-- AlterTable
ALTER TABLE "attendance" DROP COLUMN "createdAt",
DROP COLUMN "updatedAt",
ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "class_bookings" DROP COLUMN "bookedAt",
DROP COLUMN "updatedAt",
ADD COLUMN     "booked_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "class_schedules" DROP COLUMN "createdAt",
DROP COLUMN "updatedAt",
ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "classes" DROP COLUMN "createdAt",
DROP COLUMN "updatedAt",
ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "equipment" DROP COLUMN "createdAt",
DROP COLUMN "updatedAt",
ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "members" DROP COLUMN "bodyFat",
DROP COLUMN "createdAt",
DROP COLUMN "currentWeight",
DROP COLUMN "dateOfBirth",
DROP COLUMN "emergencyContact",
DROP COLUMN "targetWeight",
DROP COLUMN "updatedAt",
DROP COLUMN "userId",
ADD COLUMN     "body_fat" DOUBLE PRECISION,
ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "current_weight" DOUBLE PRECISION,
ADD COLUMN     "date_of_birth" TIMESTAMP(3),
ADD COLUMN     "emergency_contact" TEXT,
ADD COLUMN     "target_weight" DOUBLE PRECISION,
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "user_id" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "membership_plans" DROP COLUMN "accessToEquipment",
DROP COLUMN "accessToLocker",
DROP COLUMN "createdAt",
DROP COLUMN "nutritionConsultation",
DROP COLUMN "personalTrainingHours",
DROP COLUMN "unlimitedClasses",
DROP COLUMN "updatedAt",
ADD COLUMN     "access_to_equipment" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "access_to_locker" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "nutrition_consultation" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "personal_training_hours" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "unlimited_classes" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "subscriptions" DROP COLUMN "autoRenew",
DROP COLUMN "createdAt",
DROP COLUMN "endDate",
DROP COLUMN "memberId",
DROP COLUMN "membershipPlanId",
DROP COLUMN "renewalDate",
DROP COLUMN "startDate",
DROP COLUMN "updatedAt",
ADD COLUMN     "auto_renew" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "end_date" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "member_id" TEXT NOT NULL,
ADD COLUMN     "membership_plan_id" TEXT NOT NULL,
ADD COLUMN     "renewal_date" TIMESTAMP(3),
ADD COLUMN     "start_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "trainer_sessions" DROP COLUMN "createdAt",
DROP COLUMN "updatedAt",
ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "trainers" DROP COLUMN "createdAt",
DROP COLUMN "updatedAt",
DROP COLUMN "userId",
ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "user_id" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "user_progress" DROP COLUMN "recordedAt",
ADD COLUMN     "recorded_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "users" DROP COLUMN "createdAt",
DROP COLUMN "firstName",
DROP COLUMN "lastName",
DROP COLUMN "phone",
DROP COLUMN "updatedAt",
ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "first_name" TEXT NOT NULL,
ADD COLUMN     "last_name" TEXT NOT NULL,
ADD COLUMN     "phone_number" TEXT,
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "workout_plans" DROP COLUMN "createdAt",
DROP COLUMN "endDate",
DROP COLUMN "isActive",
DROP COLUMN "startDate",
DROP COLUMN "updatedAt",
ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "end_date" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "is_active" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "start_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "members_user_id_key" ON "members"("user_id");

-- CreateIndex
CREATE INDEX "members_user_id_idx" ON "members"("user_id");

-- CreateIndex
CREATE INDEX "subscriptions_member_id_idx" ON "subscriptions"("member_id");

-- CreateIndex
CREATE INDEX "subscriptions_membership_plan_id_idx" ON "subscriptions"("membership_plan_id");

-- CreateIndex
CREATE UNIQUE INDEX "trainers_user_id_key" ON "trainers"("user_id");

-- CreateIndex
CREATE INDEX "trainers_user_id_idx" ON "trainers"("user_id");

-- CreateIndex
CREATE INDEX "user_progress_recorded_at_idx" ON "user_progress"("recorded_at");

-- CreateIndex
CREATE INDEX "workout_plans_is_active_idx" ON "workout_plans"("is_active");

-- AddForeignKey
ALTER TABLE "subscriptions" ADD CONSTRAINT "subscriptions_member_id_fkey" FOREIGN KEY ("member_id") REFERENCES "members"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "subscriptions" ADD CONSTRAINT "subscriptions_membership_plan_id_fkey" FOREIGN KEY ("membership_plan_id") REFERENCES "membership_plans"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "members" ADD CONSTRAINT "members_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "trainers" ADD CONSTRAINT "trainers_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
