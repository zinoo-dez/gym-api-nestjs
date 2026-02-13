/*
  Warnings:

  - The values [FROZEN] on the enum `SubscriptionStatus` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `app_showcase_subtitle` on the `gym_settings` table. All the data in the column will be lost.
  - You are about to drop the column `app_showcase_title` on the `gym_settings` table. All the data in the column will be lost.
  - You are about to drop the column `background_color` on the `gym_settings` table. All the data in the column will be lost.
  - You are about to drop the column `classes_bg_image` on the `gym_settings` table. All the data in the column will be lost.
  - You are about to drop the column `classes_subtitle` on the `gym_settings` table. All the data in the column will be lost.
  - You are about to drop the column `classes_title` on the `gym_settings` table. All the data in the column will be lost.
  - You are about to drop the column `cta_bg_image` on the `gym_settings` table. All the data in the column will be lost.
  - You are about to drop the column `cta_button_label` on the `gym_settings` table. All the data in the column will be lost.
  - You are about to drop the column `cta_subtitle` on the `gym_settings` table. All the data in the column will be lost.
  - You are about to drop the column `cta_title` on the `gym_settings` table. All the data in the column will be lost.
  - You are about to drop the column `features` on the `gym_settings` table. All the data in the column will be lost.
  - You are about to drop the column `features_bg_image` on the `gym_settings` table. All the data in the column will be lost.
  - You are about to drop the column `features_subtitle` on the `gym_settings` table. All the data in the column will be lost.
  - You are about to drop the column `features_title` on the `gym_settings` table. All the data in the column will be lost.
  - You are about to drop the column `font_family` on the `gym_settings` table. All the data in the column will be lost.
  - You are about to drop the column `footer_tagline` on the `gym_settings` table. All the data in the column will be lost.
  - You are about to drop the column `hero_badge_text` on the `gym_settings` table. All the data in the column will be lost.
  - You are about to drop the column `hero_bg_image` on the `gym_settings` table. All the data in the column will be lost.
  - You are about to drop the column `hero_cta_primary` on the `gym_settings` table. All the data in the column will be lost.
  - You are about to drop the column `hero_cta_secondary` on the `gym_settings` table. All the data in the column will be lost.
  - You are about to drop the column `hero_subtitle` on the `gym_settings` table. All the data in the column will be lost.
  - You are about to drop the column `hero_title` on the `gym_settings` table. All the data in the column will be lost.
  - You are about to drop the column `new_attendance_notification` on the `gym_settings` table. All the data in the column will be lost.
  - You are about to drop the column `new_equipment_notification` on the `gym_settings` table. All the data in the column will be lost.
  - You are about to drop the column `new_gym_setting_notification` on the `gym_settings` table. All the data in the column will be lost.
  - You are about to drop the column `new_member_notification` on the `gym_settings` table. All the data in the column will be lost.
  - You are about to drop the column `new_membership_notification` on the `gym_settings` table. All the data in the column will be lost.
  - You are about to drop the column `new_payment_notification` on the `gym_settings` table. All the data in the column will be lost.
  - You are about to drop the column `new_progress_notification` on the `gym_settings` table. All the data in the column will be lost.
  - You are about to drop the column `new_session_notification` on the `gym_settings` table. All the data in the column will be lost.
  - You are about to drop the column `new_trainer_notification` on the `gym_settings` table. All the data in the column will be lost.
  - You are about to drop the column `new_user_setting_notification` on the `gym_settings` table. All the data in the column will be lost.
  - You are about to drop the column `new_workout_plan_notification` on the `gym_settings` table. All the data in the column will be lost.
  - You are about to drop the column `pricing_bg_image` on the `gym_settings` table. All the data in the column will be lost.
  - You are about to drop the column `pricing_subtitle` on the `gym_settings` table. All the data in the column will be lost.
  - You are about to drop the column `pricing_title` on the `gym_settings` table. All the data in the column will be lost.
  - You are about to drop the column `primary_color` on the `gym_settings` table. All the data in the column will be lost.
  - You are about to drop the column `secondary_color` on the `gym_settings` table. All the data in the column will be lost.
  - You are about to drop the column `text_color` on the `gym_settings` table. All the data in the column will be lost.
  - You are about to drop the column `trainers_bg_image` on the `gym_settings` table. All the data in the column will be lost.
  - You are about to drop the column `trainers_cta_label` on the `gym_settings` table. All the data in the column will be lost.
  - You are about to drop the column `trainers_subtitle` on the `gym_settings` table. All the data in the column will be lost.
  - You are about to drop the column `trainers_title` on the `gym_settings` table. All the data in the column will be lost.
  - You are about to drop the column `workouts_bg_image` on the `gym_settings` table. All the data in the column will be lost.
  - You are about to drop the column `workouts_cta_label` on the `gym_settings` table. All the data in the column will be lost.
  - You are about to drop the column `workouts_subtitle` on the `gym_settings` table. All the data in the column will be lost.
  - You are about to drop the column `workouts_title` on the `gym_settings` table. All the data in the column will be lost.
  - You are about to drop the column `body_fat` on the `members` table. All the data in the column will be lost.
  - You are about to drop the column `access_to_equipment` on the `membership_plans` table. All the data in the column will be lost.
  - You are about to drop the column `access_to_locker` on the `membership_plans` table. All the data in the column will be lost.
  - You are about to drop the column `nutrition_consultation` on the `membership_plans` table. All the data in the column will be lost.
  - You are about to drop the column `personal_training_hours` on the `membership_plans` table. All the data in the column will be lost.
  - You are about to drop the column `unlimited_classes` on the `membership_plans` table. All the data in the column will be lost.
  - You are about to drop the column `discount_amount` on the `subscriptions` table. All the data in the column will be lost.
  - You are about to drop the column `discount_code_id` on the `subscriptions` table. All the data in the column will be lost.
  - You are about to drop the column `final_price` on the `subscriptions` table. All the data in the column will be lost.
  - You are about to drop the column `original_price` on the `subscriptions` table. All the data in the column will be lost.
  - You are about to drop the column `availability` on the `trainers` table. All the data in the column will be lost.
  - You are about to drop the column `avatar` on the `users` table. All the data in the column will be lost.
  - You are about to drop the `discount_codes` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `equipment` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `features` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `gym_closures` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `gym_operating_hours` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `membership_plan_features` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `notifications` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[phone_number]` on the table `users` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('PENDING', 'COMPLETED', 'FAILED', 'REFUNDED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "PaymentMethod" AS ENUM ('CASH', 'CREDIT_CARD', 'DEBIT_CARD', 'BANK_TRANSFER', 'MOBILE_PAYMENT', 'OTHER');

-- CreateEnum
CREATE TYPE "InvoiceStatus" AS ENUM ('DRAFT', 'SENT', 'PAID', 'OVERDUE', 'CANCELLED');

-- CreateEnum
CREATE TYPE "StaffRole" AS ENUM ('MANAGER', 'RECEPTIONIST', 'MAINTENANCE', 'CLEANING', 'SECURITY');

-- CreateEnum
CREATE TYPE "ShiftStatus" AS ENUM ('SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "NotificationType" AS ENUM ('EMAIL', 'SMS', 'PUSH', 'IN_APP');

-- CreateEnum
CREATE TYPE "NotificationCategory" AS ENUM ('BILLING', 'MARKETING', 'CLASS_REMINDER', 'PT_SESSION', 'ACCOUNT_ACTIVITY', 'ANNOUNCEMENT', 'WORKOUT_PROGRESS', 'ATTENDANCE');

-- AlterEnum
ALTER TYPE "BookingStatus" ADD VALUE 'WAITLISTED';

-- AlterEnum
BEGIN;
CREATE TYPE "SubscriptionStatus_new" AS ENUM ('ACTIVE', 'EXPIRED', 'CANCELLED', 'PENDING');
ALTER TABLE "public"."subscriptions" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "subscriptions" ALTER COLUMN "status" TYPE "SubscriptionStatus_new" USING ("status"::text::"SubscriptionStatus_new");
ALTER TYPE "SubscriptionStatus" RENAME TO "SubscriptionStatus_old";
ALTER TYPE "SubscriptionStatus_new" RENAME TO "SubscriptionStatus";
DROP TYPE "public"."SubscriptionStatus_old";
ALTER TABLE "subscriptions" ALTER COLUMN "status" SET DEFAULT 'ACTIVE';
COMMIT;

-- DropForeignKey
ALTER TABLE "membership_plan_features" DROP CONSTRAINT "membership_plan_features_feature_id_fkey";

-- DropForeignKey
ALTER TABLE "membership_plan_features" DROP CONSTRAINT "membership_plan_features_membership_plan_id_fkey";

-- DropForeignKey
ALTER TABLE "notifications" DROP CONSTRAINT "notifications_user_id_fkey";

-- DropForeignKey
ALTER TABLE "subscriptions" DROP CONSTRAINT "subscriptions_discount_code_id_fkey";

-- DropIndex
DROP INDEX "subscriptions_discount_code_id_idx";

-- AlterTable
ALTER TABLE "gym_settings" DROP COLUMN "app_showcase_subtitle",
DROP COLUMN "app_showcase_title",
DROP COLUMN "background_color",
DROP COLUMN "classes_bg_image",
DROP COLUMN "classes_subtitle",
DROP COLUMN "classes_title",
DROP COLUMN "cta_bg_image",
DROP COLUMN "cta_button_label",
DROP COLUMN "cta_subtitle",
DROP COLUMN "cta_title",
DROP COLUMN "features",
DROP COLUMN "features_bg_image",
DROP COLUMN "features_subtitle",
DROP COLUMN "features_title",
DROP COLUMN "font_family",
DROP COLUMN "footer_tagline",
DROP COLUMN "hero_badge_text",
DROP COLUMN "hero_bg_image",
DROP COLUMN "hero_cta_primary",
DROP COLUMN "hero_cta_secondary",
DROP COLUMN "hero_subtitle",
DROP COLUMN "hero_title",
DROP COLUMN "new_attendance_notification",
DROP COLUMN "new_equipment_notification",
DROP COLUMN "new_gym_setting_notification",
DROP COLUMN "new_member_notification",
DROP COLUMN "new_membership_notification",
DROP COLUMN "new_payment_notification",
DROP COLUMN "new_progress_notification",
DROP COLUMN "new_session_notification",
DROP COLUMN "new_trainer_notification",
DROP COLUMN "new_user_setting_notification",
DROP COLUMN "new_workout_plan_notification",
DROP COLUMN "pricing_bg_image",
DROP COLUMN "pricing_subtitle",
DROP COLUMN "pricing_title",
DROP COLUMN "primary_color",
DROP COLUMN "secondary_color",
DROP COLUMN "text_color",
DROP COLUMN "trainers_bg_image",
DROP COLUMN "trainers_cta_label",
DROP COLUMN "trainers_subtitle",
DROP COLUMN "trainers_title",
DROP COLUMN "workouts_bg_image",
DROP COLUMN "workouts_cta_label",
DROP COLUMN "workouts_subtitle",
DROP COLUMN "workouts_title",
ALTER COLUMN "gym_name" DROP DEFAULT,
ALTER COLUMN "tag_line" DROP DEFAULT,
ALTER COLUMN "address" DROP DEFAULT,
ALTER COLUMN "phone" DROP DEFAULT,
ALTER COLUMN "email" DROP DEFAULT,
ALTER COLUMN "logo" DROP DEFAULT,
ALTER COLUMN "description" DROP DEFAULT,
ALTER COLUMN "favicon" DROP DEFAULT;

-- AlterTable
ALTER TABLE "members" DROP COLUMN "body_fat";

-- AlterTable
ALTER TABLE "membership_plans" DROP COLUMN "access_to_equipment",
DROP COLUMN "access_to_locker",
DROP COLUMN "nutrition_consultation",
DROP COLUMN "personal_training_hours",
DROP COLUMN "unlimited_classes";

-- AlterTable
ALTER TABLE "subscriptions" DROP COLUMN "discount_amount",
DROP COLUMN "discount_code_id",
DROP COLUMN "final_price",
DROP COLUMN "original_price";

-- AlterTable
ALTER TABLE "trainers" DROP COLUMN "availability";

-- AlterTable
ALTER TABLE "users" DROP COLUMN "avatar";

-- DropTable
DROP TABLE "discount_codes";

-- DropTable
DROP TABLE "equipment";

-- DropTable
DROP TABLE "features";

-- DropTable
DROP TABLE "gym_closures";

-- DropTable
DROP TABLE "gym_operating_hours";

-- DropTable
DROP TABLE "membership_plan_features";

-- DropTable
DROP TABLE "notifications";

-- DropEnum
DROP TYPE "DiscountType";

-- DropEnum
DROP TYPE "FeatureLevel";

-- CreateTable
CREATE TABLE "class_waitlist" (
    "id" TEXT NOT NULL,
    "member_id" TEXT NOT NULL,
    "class_schedule_id" TEXT NOT NULL,
    "position" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'waiting',
    "notified_at" TIMESTAMP(3),
    "expires_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "class_waitlist_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "equipments" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "description" TEXT,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "last_maintenance_date" TIMESTAMP(3),
    "next_maintenance_date" TIMESTAMP(3),
    "maintenance_interval" INTEGER,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "equipments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payments" (
    "id" TEXT NOT NULL,
    "member_id" TEXT NOT NULL,
    "invoice_id" TEXT,
    "amount" DOUBLE PRECISION NOT NULL,
    "payment_method" "PaymentMethod" NOT NULL,
    "status" "PaymentStatus" NOT NULL DEFAULT 'PENDING',
    "transaction_ref" TEXT,
    "description" TEXT,
    "paid_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "payments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "invoices" (
    "id" TEXT NOT NULL,
    "member_id" TEXT NOT NULL,
    "invoice_number" TEXT NOT NULL,
    "status" "InvoiceStatus" NOT NULL DEFAULT 'DRAFT',
    "subtotal" DOUBLE PRECISION NOT NULL,
    "tax" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "discount" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "total" DOUBLE PRECISION NOT NULL,
    "due_date" TIMESTAMP(3) NOT NULL,
    "paid_at" TIMESTAMP(3),
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "invoices_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "invoice_items" (
    "id" TEXT NOT NULL,
    "invoice_id" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "unit_price" DOUBLE PRECISION NOT NULL,
    "total" DOUBLE PRECISION NOT NULL,
    "item_type" TEXT NOT NULL,
    "item_id" TEXT,

    CONSTRAINT "invoice_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "discounts" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "type" TEXT NOT NULL,
    "value" DOUBLE PRECISION NOT NULL,
    "min_purchase" DOUBLE PRECISION,
    "max_uses" INTEGER,
    "used_count" INTEGER NOT NULL DEFAULT 0,
    "valid_from" TIMESTAMP(3) NOT NULL,
    "valid_until" TIMESTAMP(3) NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "applicable_plans" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "discounts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "staff" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "staff_role" "StaffRole" NOT NULL,
    "employee_id" TEXT NOT NULL,
    "hire_date" TIMESTAMP(3) NOT NULL,
    "department" TEXT,
    "position" TEXT NOT NULL,
    "emergency_contact" TEXT,
    "address" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "staff_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "staff_shifts" (
    "id" TEXT NOT NULL,
    "staff_id" TEXT NOT NULL,
    "status" "ShiftStatus" NOT NULL DEFAULT 'SCHEDULED',
    "scheduled_start" TIMESTAMP(3) NOT NULL,
    "scheduled_end" TIMESTAMP(3) NOT NULL,
    "actual_start" TIMESTAMP(3),
    "actual_end" TIMESTAMP(3),
    "break_minutes" INTEGER NOT NULL DEFAULT 0,
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "staff_shifts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "waiver_templates" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "content" TEXT NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 1,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "is_required" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "waiver_templates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "member_waivers" (
    "id" TEXT NOT NULL,
    "member_id" TEXT NOT NULL,
    "waiver_template_id" TEXT NOT NULL,
    "signed_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "signature_data" TEXT,
    "ip_address" TEXT,
    "user_agent" TEXT,
    "version" INTEGER NOT NULL,

    CONSTRAINT "member_waivers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notification_preferences" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "category" "NotificationCategory" NOT NULL,
    "email_enabled" BOOLEAN NOT NULL DEFAULT true,
    "sms_enabled" BOOLEAN NOT NULL DEFAULT false,
    "push_enabled" BOOLEAN NOT NULL DEFAULT true,
    "in_app_enabled" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "notification_preferences_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notification_templates" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" "NotificationType" NOT NULL,
    "category" "NotificationCategory" NOT NULL DEFAULT 'ANNOUNCEMENT',
    "subject" TEXT,
    "body" TEXT NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "notification_templates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notification_logs" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "type" "NotificationType" NOT NULL,
    "category" "NotificationCategory" NOT NULL DEFAULT 'ANNOUNCEMENT',
    "subject" TEXT,
    "content" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "sent_at" TIMESTAMP(3),
    "read_at" TIMESTAMP(3),
    "fail_reason" TEXT,
    "metadata" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notification_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "push_subscriptions" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "endpoint" TEXT NOT NULL,
    "p256dh" TEXT NOT NULL,
    "auth" TEXT NOT NULL,
    "device_type" TEXT,
    "device_name" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "push_subscriptions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "class_waitlist_class_schedule_id_idx" ON "class_waitlist"("class_schedule_id");

-- CreateIndex
CREATE INDEX "class_waitlist_status_idx" ON "class_waitlist"("status");

-- CreateIndex
CREATE UNIQUE INDEX "class_waitlist_member_id_class_schedule_id_key" ON "class_waitlist"("member_id", "class_schedule_id");

-- CreateIndex
CREATE INDEX "equipments_category_idx" ON "equipments"("category");

-- CreateIndex
CREATE INDEX "equipments_isActive_idx" ON "equipments"("isActive");

-- CreateIndex
CREATE UNIQUE INDEX "payments_transaction_ref_key" ON "payments"("transaction_ref");

-- CreateIndex
CREATE INDEX "payments_member_id_idx" ON "payments"("member_id");

-- CreateIndex
CREATE INDEX "payments_status_idx" ON "payments"("status");

-- CreateIndex
CREATE INDEX "payments_paid_at_idx" ON "payments"("paid_at");

-- CreateIndex
CREATE UNIQUE INDEX "invoices_invoice_number_key" ON "invoices"("invoice_number");

-- CreateIndex
CREATE INDEX "invoices_member_id_idx" ON "invoices"("member_id");

-- CreateIndex
CREATE INDEX "invoices_status_idx" ON "invoices"("status");

-- CreateIndex
CREATE INDEX "invoices_due_date_idx" ON "invoices"("due_date");

-- CreateIndex
CREATE INDEX "invoice_items_invoice_id_idx" ON "invoice_items"("invoice_id");

-- CreateIndex
CREATE UNIQUE INDEX "discounts_code_key" ON "discounts"("code");

-- CreateIndex
CREATE INDEX "discounts_code_idx" ON "discounts"("code");

-- CreateIndex
CREATE INDEX "discounts_is_active_idx" ON "discounts"("is_active");

-- CreateIndex
CREATE UNIQUE INDEX "staff_user_id_key" ON "staff"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "staff_employee_id_key" ON "staff"("employee_id");

-- CreateIndex
CREATE INDEX "staff_staff_role_idx" ON "staff"("staff_role");

-- CreateIndex
CREATE INDEX "staff_department_idx" ON "staff"("department");

-- CreateIndex
CREATE INDEX "staff_shifts_staff_id_idx" ON "staff_shifts"("staff_id");

-- CreateIndex
CREATE INDEX "staff_shifts_scheduled_start_idx" ON "staff_shifts"("scheduled_start");

-- CreateIndex
CREATE INDEX "staff_shifts_status_idx" ON "staff_shifts"("status");

-- CreateIndex
CREATE INDEX "waiver_templates_is_active_idx" ON "waiver_templates"("is_active");

-- CreateIndex
CREATE INDEX "member_waivers_member_id_idx" ON "member_waivers"("member_id");

-- CreateIndex
CREATE UNIQUE INDEX "member_waivers_member_id_waiver_template_id_key" ON "member_waivers"("member_id", "waiver_template_id");

-- CreateIndex
CREATE UNIQUE INDEX "notification_preferences_user_id_category_key" ON "notification_preferences"("user_id", "category");

-- CreateIndex
CREATE UNIQUE INDEX "notification_templates_name_key" ON "notification_templates"("name");

-- CreateIndex
CREATE INDEX "notification_templates_type_idx" ON "notification_templates"("type");

-- CreateIndex
CREATE INDEX "notification_templates_category_idx" ON "notification_templates"("category");

-- CreateIndex
CREATE INDEX "notification_logs_user_id_idx" ON "notification_logs"("user_id");

-- CreateIndex
CREATE INDEX "notification_logs_type_idx" ON "notification_logs"("type");

-- CreateIndex
CREATE INDEX "notification_logs_category_idx" ON "notification_logs"("category");

-- CreateIndex
CREATE INDEX "notification_logs_status_idx" ON "notification_logs"("status");

-- CreateIndex
CREATE INDEX "notification_logs_sent_at_idx" ON "notification_logs"("sent_at");

-- CreateIndex
CREATE UNIQUE INDEX "push_subscriptions_endpoint_key" ON "push_subscriptions"("endpoint");

-- CreateIndex
CREATE INDEX "push_subscriptions_user_id_idx" ON "push_subscriptions"("user_id");

-- CreateIndex
CREATE INDEX "push_subscriptions_is_active_idx" ON "push_subscriptions"("is_active");

-- CreateIndex
CREATE UNIQUE INDEX "users_phone_number_key" ON "users"("phone_number");

-- AddForeignKey
ALTER TABLE "class_waitlist" ADD CONSTRAINT "class_waitlist_member_id_fkey" FOREIGN KEY ("member_id") REFERENCES "members"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "class_waitlist" ADD CONSTRAINT "class_waitlist_class_schedule_id_fkey" FOREIGN KEY ("class_schedule_id") REFERENCES "class_schedules"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payments" ADD CONSTRAINT "payments_member_id_fkey" FOREIGN KEY ("member_id") REFERENCES "members"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payments" ADD CONSTRAINT "payments_invoice_id_fkey" FOREIGN KEY ("invoice_id") REFERENCES "invoices"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_member_id_fkey" FOREIGN KEY ("member_id") REFERENCES "members"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invoice_items" ADD CONSTRAINT "invoice_items_invoice_id_fkey" FOREIGN KEY ("invoice_id") REFERENCES "invoices"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "staff" ADD CONSTRAINT "staff_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "staff_shifts" ADD CONSTRAINT "staff_shifts_staff_id_fkey" FOREIGN KEY ("staff_id") REFERENCES "staff"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "member_waivers" ADD CONSTRAINT "member_waivers_member_id_fkey" FOREIGN KEY ("member_id") REFERENCES "members"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "member_waivers" ADD CONSTRAINT "member_waivers_waiver_template_id_fkey" FOREIGN KEY ("waiver_template_id") REFERENCES "waiver_templates"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notification_preferences" ADD CONSTRAINT "notification_preferences_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
