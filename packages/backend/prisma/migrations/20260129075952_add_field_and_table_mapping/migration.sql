/*
  Warnings:

  - The values [gym_visit,class_attendance] on the enum `attendance_type` will be removed. If these variants are still used in the database, this will fail.
  - The values [confirmed,cancelled,attended] on the enum `booking_status` will be removed. If these variants are still used in the database, this will fail.
  - The values [active,expired,cancelled] on the enum `membership_status` will be removed. If these variants are still used in the database, this will fail.
  - The values [basic,premium,vip] on the enum `membership_type` will be removed. If these variants are still used in the database, this will fail.
  - The values [admin,trainer,member] on the enum `role` will be removed. If these variants are still used in the database, this will fail.
  - The values [weight_loss,muscle_gain,endurance,flexibility] on the enum `workout_goal` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "attendance_type_new" AS ENUM ('GYM_VISIT', 'CLASS_ATTENDANCE');
ALTER TABLE "attendance" ALTER COLUMN "type" TYPE "attendance_type_new" USING ("type"::text::"attendance_type_new");
ALTER TYPE "attendance_type" RENAME TO "attendance_type_old";
ALTER TYPE "attendance_type_new" RENAME TO "attendance_type";
DROP TYPE "public"."attendance_type_old";
COMMIT;

-- AlterEnum
BEGIN;
CREATE TYPE "booking_status_new" AS ENUM ('CONFIRMED', 'CANCELLED', 'ATTENDED');
ALTER TABLE "public"."class_bookings" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "class_bookings" ALTER COLUMN "status" TYPE "booking_status_new" USING ("status"::text::"booking_status_new");
ALTER TYPE "booking_status" RENAME TO "booking_status_old";
ALTER TYPE "booking_status_new" RENAME TO "booking_status";
DROP TYPE "public"."booking_status_old";
ALTER TABLE "class_bookings" ALTER COLUMN "status" SET DEFAULT 'CONFIRMED';
COMMIT;

-- AlterEnum
BEGIN;
CREATE TYPE "membership_status_new" AS ENUM ('ACTIVE', 'EXPIRED', 'CANCELLED');
ALTER TABLE "public"."memberships" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "memberships" ALTER COLUMN "status" TYPE "membership_status_new" USING ("status"::text::"membership_status_new");
ALTER TYPE "membership_status" RENAME TO "membership_status_old";
ALTER TYPE "membership_status_new" RENAME TO "membership_status";
DROP TYPE "public"."membership_status_old";
ALTER TABLE "memberships" ALTER COLUMN "status" SET DEFAULT 'ACTIVE';
COMMIT;

-- AlterEnum
BEGIN;
CREATE TYPE "membership_type_new" AS ENUM ('BASIC', 'PREMIUM', 'VIP');
ALTER TABLE "membership_plans" ALTER COLUMN "type" TYPE "membership_type_new" USING ("type"::text::"membership_type_new");
ALTER TYPE "membership_type" RENAME TO "membership_type_old";
ALTER TYPE "membership_type_new" RENAME TO "membership_type";
DROP TYPE "public"."membership_type_old";
COMMIT;

-- AlterEnum
BEGIN;
CREATE TYPE "role_new" AS ENUM ('ADMIN', 'TRAINER', 'MEMBER');
ALTER TABLE "public"."users" ALTER COLUMN "role" DROP DEFAULT;
ALTER TABLE "users" ALTER COLUMN "role" TYPE "role_new" USING ("role"::text::"role_new");
ALTER TYPE "role" RENAME TO "role_old";
ALTER TYPE "role_new" RENAME TO "role";
DROP TYPE "public"."role_old";
ALTER TABLE "users" ALTER COLUMN "role" SET DEFAULT 'MEMBER';
COMMIT;

-- AlterEnum
BEGIN;
CREATE TYPE "workout_goal_new" AS ENUM ('WEIGHT_LOSS', 'MUSCLE_GAIN', 'ENDURANCE', 'FLEXIBILITY');
ALTER TABLE "workout_plans" ALTER COLUMN "goal" TYPE "workout_goal_new" USING ("goal"::text::"workout_goal_new");
ALTER TABLE "workout_plan_versions" ALTER COLUMN "goal" TYPE "workout_goal_new" USING ("goal"::text::"workout_goal_new");
ALTER TYPE "workout_goal" RENAME TO "workout_goal_old";
ALTER TYPE "workout_goal_new" RENAME TO "workout_goal";
DROP TYPE "public"."workout_goal_old";
COMMIT;

-- AlterTable
ALTER TABLE "class_bookings" ALTER COLUMN "status" SET DEFAULT 'CONFIRMED';

-- AlterTable
ALTER TABLE "memberships" ALTER COLUMN "status" SET DEFAULT 'ACTIVE';

-- AlterTable
ALTER TABLE "users" ALTER COLUMN "role" SET DEFAULT 'MEMBER';
