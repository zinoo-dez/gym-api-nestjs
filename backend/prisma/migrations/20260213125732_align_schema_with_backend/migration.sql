-- CreateEnum
CREATE TYPE "DiscountType" AS ENUM ('PERCENTAGE', 'FIXED');

-- AlterEnum
ALTER TYPE "SubscriptionStatus" ADD VALUE 'FROZEN';

-- AlterTable
ALTER TABLE "gym_settings" ADD COLUMN     "app_showcase_subtitle" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "app_showcase_title" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "background_color" TEXT NOT NULL DEFAULT '#0a0a0a',
ADD COLUMN     "classes_bg_image" TEXT DEFAULT '',
ADD COLUMN     "classes_subtitle" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "classes_title" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "cta_bg_image" TEXT DEFAULT '',
ADD COLUMN     "cta_button_label" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "cta_subtitle" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "cta_title" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "features" JSONB DEFAULT '[]',
ADD COLUMN     "features_bg_image" TEXT DEFAULT '',
ADD COLUMN     "features_subtitle" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "features_title" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "font_family" TEXT NOT NULL DEFAULT 'Inter',
ADD COLUMN     "footer_tagline" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "hero_badge_text" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "hero_bg_image" TEXT DEFAULT '',
ADD COLUMN     "hero_cta_primary" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "hero_cta_secondary" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "hero_subtitle" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "hero_title" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "new_attendance_notification" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "new_equipment_notification" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "new_gym_setting_notification" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "new_member_notification" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "new_membership_notification" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "new_payment_notification" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "new_progress_notification" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "new_session_notification" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "new_trainer_notification" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "new_user_setting_notification" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "new_workout_plan_notification" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "pricing_bg_image" TEXT DEFAULT '',
ADD COLUMN     "pricing_subtitle" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "pricing_title" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "primary_color" TEXT NOT NULL DEFAULT '#22c55e',
ADD COLUMN     "secondary_color" TEXT NOT NULL DEFAULT '#4ade80',
ADD COLUMN     "text_color" TEXT NOT NULL DEFAULT '#ffffff',
ADD COLUMN     "trainers_bg_image" TEXT DEFAULT '',
ADD COLUMN     "trainers_cta_label" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "trainers_subtitle" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "trainers_title" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "workouts_bg_image" TEXT DEFAULT '',
ADD COLUMN     "workouts_cta_label" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "workouts_subtitle" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "workouts_title" TEXT NOT NULL DEFAULT '',
ALTER COLUMN "gym_name" SET DEFAULT 'My Gym',
ALTER COLUMN "tag_line" SET DEFAULT '',
ALTER COLUMN "address" SET DEFAULT '',
ALTER COLUMN "phone" SET DEFAULT '',
ALTER COLUMN "email" SET DEFAULT '',
ALTER COLUMN "logo" SET DEFAULT '',
ALTER COLUMN "description" SET DEFAULT '',
ALTER COLUMN "favicon" SET DEFAULT '';

-- AlterTable
ALTER TABLE "membership_plans" ADD COLUMN     "access_to_equipment" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "access_to_locker" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "nutrition_consultation" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "personal_training_hours" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "unlimited_classes" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "subscriptions" ADD COLUMN     "discount_amount" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "discount_code_id" TEXT,
ADD COLUMN     "final_price" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "original_price" DOUBLE PRECISION NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE "discount_codes" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "description" TEXT,
    "type" "DiscountType" NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "max_redemptions" INTEGER,
    "used_count" INTEGER NOT NULL DEFAULT 0,
    "starts_at" TIMESTAMP(3),
    "ends_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "discount_codes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "gym_operating_hours" (
    "id" TEXT NOT NULL,
    "day_of_week" INTEGER NOT NULL,
    "open_time" TEXT NOT NULL,
    "close_time" TEXT NOT NULL,
    "is_closed" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "gym_operating_hours_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notifications" (
    "id" TEXT NOT NULL,
    "user_id" TEXT,
    "role" "UserRole",
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'info',
    "read" BOOLEAN NOT NULL DEFAULT false,
    "action_url" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "discount_codes_code_key" ON "discount_codes"("code");

-- CreateIndex
CREATE INDEX "discount_codes_code_idx" ON "discount_codes"("code");

-- CreateIndex
CREATE INDEX "discount_codes_is_active_idx" ON "discount_codes"("is_active");

-- CreateIndex
CREATE UNIQUE INDEX "gym_operating_hours_day_of_week_key" ON "gym_operating_hours"("day_of_week");

-- CreateIndex
CREATE INDEX "notifications_user_id_idx" ON "notifications"("user_id");

-- CreateIndex
CREATE INDEX "notifications_role_idx" ON "notifications"("role");

-- CreateIndex
CREATE INDEX "notifications_read_idx" ON "notifications"("read");

-- CreateIndex
CREATE INDEX "subscriptions_discount_code_id_idx" ON "subscriptions"("discount_code_id");

-- AddForeignKey
ALTER TABLE "subscriptions" ADD CONSTRAINT "subscriptions_discount_code_id_fkey" FOREIGN KEY ("discount_code_id") REFERENCES "discount_codes"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
