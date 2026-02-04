/*
  Warnings:

  - You are about to drop the column `checkInTime` on the `attendance` table. All the data in the column will be lost.
  - You are about to drop the column `checkOutTime` on the `attendance` table. All the data in the column will be lost.
  - You are about to drop the column `memberId` on the `attendance` table. All the data in the column will be lost.
  - You are about to drop the column `checkedInAt` on the `class_bookings` table. All the data in the column will be lost.
  - You are about to drop the column `classScheduleId` on the `class_bookings` table. All the data in the column will be lost.
  - You are about to drop the column `memberId` on the `class_bookings` table. All the data in the column will be lost.
  - You are about to drop the column `classId` on the `class_schedules` table. All the data in the column will be lost.
  - You are about to drop the column `daysOfWeek` on the `class_schedules` table. All the data in the column will be lost.
  - You are about to drop the column `endTime` on the `class_schedules` table. All the data in the column will be lost.
  - You are about to drop the column `isActive` on the `class_schedules` table. All the data in the column will be lost.
  - You are about to drop the column `startTime` on the `class_schedules` table. All the data in the column will be lost.
  - You are about to drop the column `trainerId` on the `class_schedules` table. All the data in the column will be lost.
  - You are about to drop the column `maxCapacity` on the `classes` table. All the data in the column will be lost.
  - You are about to drop the column `lastMaintenanceDate` on the `equipment` table. All the data in the column will be lost.
  - You are about to drop the column `maintenanceInterval` on the `equipment` table. All the data in the column will be lost.
  - You are about to drop the column `nextMaintenanceDate` on the `equipment` table. All the data in the column will be lost.
  - You are about to drop the column `memberId` on the `trainer_sessions` table. All the data in the column will be lost.
  - You are about to drop the column `sessionDate` on the `trainer_sessions` table. All the data in the column will be lost.
  - You are about to drop the column `trainerId` on the `trainer_sessions` table. All the data in the column will be lost.
  - You are about to drop the column `hourlyRate` on the `trainers` table. All the data in the column will be lost.
  - You are about to drop the column `benchPress` on the `user_progress` table. All the data in the column will be lost.
  - You are about to drop the column `bodyFat` on the `user_progress` table. All the data in the column will be lost.
  - You are about to drop the column `cardioEndurance` on the `user_progress` table. All the data in the column will be lost.
  - You are about to drop the column `deadlift` on the `user_progress` table. All the data in the column will be lost.
  - You are about to drop the column `memberId` on the `user_progress` table. All the data in the column will be lost.
  - You are about to drop the column `muscleMass` on the `user_progress` table. All the data in the column will be lost.
  - You are about to drop the column `memberId` on the `workout_plans` table. All the data in the column will be lost.
  - You are about to drop the column `nutritionTips` on the `workout_plans` table. All the data in the column will be lost.
  - You are about to drop the column `trainerId` on the `workout_plans` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[member_id,class_schedule_id]` on the table `class_bookings` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `member_id` to the `attendance` table without a default value. This is not possible if the table is not empty.
  - Added the required column `class_schedule_id` to the `class_bookings` table without a default value. This is not possible if the table is not empty.
  - Added the required column `member_id` to the `class_bookings` table without a default value. This is not possible if the table is not empty.
  - Added the required column `class_id` to the `class_schedules` table without a default value. This is not possible if the table is not empty.
  - Added the required column `days_of_week` to the `class_schedules` table without a default value. This is not possible if the table is not empty.
  - Added the required column `end_time` to the `class_schedules` table without a default value. This is not possible if the table is not empty.
  - Added the required column `start_time` to the `class_schedules` table without a default value. This is not possible if the table is not empty.
  - Added the required column `trainer_id` to the `class_schedules` table without a default value. This is not possible if the table is not empty.
  - Added the required column `max_capacity` to the `classes` table without a default value. This is not possible if the table is not empty.
  - Added the required column `member_id` to the `trainer_sessions` table without a default value. This is not possible if the table is not empty.
  - Added the required column `session_date` to the `trainer_sessions` table without a default value. This is not possible if the table is not empty.
  - Added the required column `trainer_id` to the `trainer_sessions` table without a default value. This is not possible if the table is not empty.
  - Added the required column `hourly_rate` to the `trainers` table without a default value. This is not possible if the table is not empty.
  - Added the required column `member_id` to the `user_progress` table without a default value. This is not possible if the table is not empty.
  - Added the required column `member_id` to the `workout_plans` table without a default value. This is not possible if the table is not empty.
  - Added the required column `trainer_id` to the `workout_plans` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "attendance" DROP CONSTRAINT "attendance_memberId_fkey";

-- DropForeignKey
ALTER TABLE "class_bookings" DROP CONSTRAINT "class_bookings_classScheduleId_fkey";

-- DropForeignKey
ALTER TABLE "class_bookings" DROP CONSTRAINT "class_bookings_memberId_fkey";

-- DropForeignKey
ALTER TABLE "class_schedules" DROP CONSTRAINT "class_schedules_classId_fkey";

-- DropForeignKey
ALTER TABLE "class_schedules" DROP CONSTRAINT "class_schedules_trainerId_fkey";

-- DropForeignKey
ALTER TABLE "subscriptions" DROP CONSTRAINT "subscriptions_membership_plan_id_fkey";

-- DropForeignKey
ALTER TABLE "trainer_sessions" DROP CONSTRAINT "trainer_sessions_memberId_fkey";

-- DropForeignKey
ALTER TABLE "trainer_sessions" DROP CONSTRAINT "trainer_sessions_trainerId_fkey";

-- DropForeignKey
ALTER TABLE "user_progress" DROP CONSTRAINT "user_progress_memberId_fkey";

-- DropForeignKey
ALTER TABLE "workout_plans" DROP CONSTRAINT "workout_plans_memberId_fkey";

-- DropForeignKey
ALTER TABLE "workout_plans" DROP CONSTRAINT "workout_plans_trainerId_fkey";

-- DropIndex
DROP INDEX "attendance_checkInTime_idx";

-- DropIndex
DROP INDEX "attendance_memberId_idx";

-- DropIndex
DROP INDEX "class_bookings_classScheduleId_idx";

-- DropIndex
DROP INDEX "class_bookings_memberId_classScheduleId_key";

-- DropIndex
DROP INDEX "class_bookings_memberId_idx";

-- DropIndex
DROP INDEX "class_schedules_classId_idx";

-- DropIndex
DROP INDEX "class_schedules_startTime_idx";

-- DropIndex
DROP INDEX "class_schedules_trainerId_idx";

-- DropIndex
DROP INDEX "trainer_sessions_memberId_idx";

-- DropIndex
DROP INDEX "trainer_sessions_sessionDate_idx";

-- DropIndex
DROP INDEX "trainer_sessions_trainerId_idx";

-- DropIndex
DROP INDEX "user_progress_memberId_idx";

-- DropIndex
DROP INDEX "workout_plans_memberId_idx";

-- DropIndex
DROP INDEX "workout_plans_trainerId_idx";

-- AlterTable
ALTER TABLE "attendance" DROP COLUMN "checkInTime",
DROP COLUMN "checkOutTime",
DROP COLUMN "memberId",
ADD COLUMN     "check_in_time" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "check_out_time" TIMESTAMP(3),
ADD COLUMN     "member_id" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "class_bookings" DROP COLUMN "checkedInAt",
DROP COLUMN "classScheduleId",
DROP COLUMN "memberId",
ADD COLUMN     "checked_in_at" TIMESTAMP(3),
ADD COLUMN     "class_schedule_id" TEXT NOT NULL,
ADD COLUMN     "member_id" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "class_schedules" DROP COLUMN "classId",
DROP COLUMN "daysOfWeek",
DROP COLUMN "endTime",
DROP COLUMN "isActive",
DROP COLUMN "startTime",
DROP COLUMN "trainerId",
ADD COLUMN     "class_id" TEXT NOT NULL,
ADD COLUMN     "days_of_week" TEXT NOT NULL,
ADD COLUMN     "end_time" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "is_active" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "start_time" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "trainer_id" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "classes" DROP COLUMN "maxCapacity",
ADD COLUMN     "max_capacity" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "equipment" DROP COLUMN "lastMaintenanceDate",
DROP COLUMN "maintenanceInterval",
DROP COLUMN "nextMaintenanceDate",
ADD COLUMN     "last_maintenance_date" TIMESTAMP(3),
ADD COLUMN     "maintenance_interval" INTEGER,
ADD COLUMN     "next_maintenance_date" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "trainer_sessions" DROP COLUMN "memberId",
DROP COLUMN "sessionDate",
DROP COLUMN "trainerId",
ADD COLUMN     "member_id" TEXT NOT NULL,
ADD COLUMN     "session_date" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "trainer_id" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "trainers" DROP COLUMN "hourlyRate",
ADD COLUMN     "hourly_rate" DOUBLE PRECISION NOT NULL;

-- AlterTable
ALTER TABLE "user_progress" DROP COLUMN "benchPress",
DROP COLUMN "bodyFat",
DROP COLUMN "cardioEndurance",
DROP COLUMN "deadlift",
DROP COLUMN "memberId",
DROP COLUMN "muscleMass",
ADD COLUMN     "bench_press" DOUBLE PRECISION,
ADD COLUMN     "body_fat" DOUBLE PRECISION,
ADD COLUMN     "cardio_endurance" TEXT,
ADD COLUMN     "dead_lift" DOUBLE PRECISION,
ADD COLUMN     "member_id" TEXT NOT NULL,
ADD COLUMN     "muscle_mass" DOUBLE PRECISION;

-- AlterTable
ALTER TABLE "workout_plans" DROP COLUMN "memberId",
DROP COLUMN "nutritionTips",
DROP COLUMN "trainerId",
ADD COLUMN     "member_id" TEXT NOT NULL,
ADD COLUMN     "nutrition_tips" TEXT,
ADD COLUMN     "trainer_id" TEXT NOT NULL;

-- CreateIndex
CREATE INDEX "attendance_member_id_idx" ON "attendance"("member_id");

-- CreateIndex
CREATE INDEX "attendance_check_in_time_idx" ON "attendance"("check_in_time");

-- CreateIndex
CREATE INDEX "class_bookings_member_id_idx" ON "class_bookings"("member_id");

-- CreateIndex
CREATE INDEX "class_bookings_class_schedule_id_idx" ON "class_bookings"("class_schedule_id");

-- CreateIndex
CREATE UNIQUE INDEX "class_bookings_member_id_class_schedule_id_key" ON "class_bookings"("member_id", "class_schedule_id");

-- CreateIndex
CREATE INDEX "class_schedules_class_id_idx" ON "class_schedules"("class_id");

-- CreateIndex
CREATE INDEX "class_schedules_trainer_id_idx" ON "class_schedules"("trainer_id");

-- CreateIndex
CREATE INDEX "class_schedules_start_time_idx" ON "class_schedules"("start_time");

-- CreateIndex
CREATE INDEX "trainer_sessions_member_id_idx" ON "trainer_sessions"("member_id");

-- CreateIndex
CREATE INDEX "trainer_sessions_trainer_id_idx" ON "trainer_sessions"("trainer_id");

-- CreateIndex
CREATE INDEX "trainer_sessions_session_date_idx" ON "trainer_sessions"("session_date");

-- CreateIndex
CREATE INDEX "user_progress_member_id_idx" ON "user_progress"("member_id");

-- CreateIndex
CREATE INDEX "workout_plans_member_id_idx" ON "workout_plans"("member_id");

-- CreateIndex
CREATE INDEX "workout_plans_trainer_id_idx" ON "workout_plans"("trainer_id");

-- AddForeignKey
ALTER TABLE "subscriptions" ADD CONSTRAINT "subscriptions_membership_plan_id_fkey" FOREIGN KEY ("membership_plan_id") REFERENCES "membership_plans"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "class_schedules" ADD CONSTRAINT "class_schedules_class_id_fkey" FOREIGN KEY ("class_id") REFERENCES "classes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "class_schedules" ADD CONSTRAINT "class_schedules_trainer_id_fkey" FOREIGN KEY ("trainer_id") REFERENCES "trainers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "class_bookings" ADD CONSTRAINT "class_bookings_member_id_fkey" FOREIGN KEY ("member_id") REFERENCES "members"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "class_bookings" ADD CONSTRAINT "class_bookings_class_schedule_id_fkey" FOREIGN KEY ("class_schedule_id") REFERENCES "class_schedules"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "trainer_sessions" ADD CONSTRAINT "trainer_sessions_member_id_fkey" FOREIGN KEY ("member_id") REFERENCES "members"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "trainer_sessions" ADD CONSTRAINT "trainer_sessions_trainer_id_fkey" FOREIGN KEY ("trainer_id") REFERENCES "trainers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "workout_plans" ADD CONSTRAINT "workout_plans_member_id_fkey" FOREIGN KEY ("member_id") REFERENCES "members"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "workout_plans" ADD CONSTRAINT "workout_plans_trainer_id_fkey" FOREIGN KEY ("trainer_id") REFERENCES "trainers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_progress" ADD CONSTRAINT "user_progress_member_id_fkey" FOREIGN KEY ("member_id") REFERENCES "members"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "attendance" ADD CONSTRAINT "attendance_member_id_fkey" FOREIGN KEY ("member_id") REFERENCES "members"("id") ON DELETE CASCADE ON UPDATE CASCADE;
