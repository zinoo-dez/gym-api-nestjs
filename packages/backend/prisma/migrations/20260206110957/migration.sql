-- CreateTable
CREATE TABLE "gym_settings" (
    "id" TEXT NOT NULL,
    "gym_name" TEXT NOT NULL,
    "tag_line" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "logo" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "favicon" TEXT NOT NULL,
    "primary_color" TEXT NOT NULL,
    "secondary_color" TEXT NOT NULL,
    "email_notification" BOOLEAN NOT NULL DEFAULT true,
    "sms_notification" BOOLEAN NOT NULL DEFAULT true,
    "new_member_notification" BOOLEAN NOT NULL DEFAULT true,
    "new_trainer_notification" BOOLEAN NOT NULL DEFAULT true,
    "new_membership_notification" BOOLEAN NOT NULL DEFAULT true,
    "new_payment_notification" BOOLEAN NOT NULL DEFAULT true,
    "new_session_notification" BOOLEAN NOT NULL DEFAULT true,
    "new_workout_plan_notification" BOOLEAN NOT NULL DEFAULT true,
    "new_progress_notification" BOOLEAN NOT NULL DEFAULT true,
    "new_attendance_notification" BOOLEAN NOT NULL DEFAULT true,
    "new_equipment_notification" BOOLEAN NOT NULL DEFAULT true,
    "new_gym_setting_notification" BOOLEAN NOT NULL DEFAULT true,
    "new_user_setting_notification" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "gym_settings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_settings" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "language" TEXT NOT NULL DEFAULT 'en',
    "theme" TEXT NOT NULL DEFAULT 'system',
    "notification" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_settings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "gym_settings_gym_name_key" ON "gym_settings"("gym_name");

-- CreateIndex
CREATE UNIQUE INDEX "gym_settings_phone_key" ON "gym_settings"("phone");

-- CreateIndex
CREATE UNIQUE INDEX "gym_settings_email_key" ON "gym_settings"("email");

-- CreateIndex
CREATE UNIQUE INDEX "user_settings_user_id_key" ON "user_settings"("user_id");

-- AddForeignKey
ALTER TABLE "user_settings" ADD CONSTRAINT "user_settings_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
