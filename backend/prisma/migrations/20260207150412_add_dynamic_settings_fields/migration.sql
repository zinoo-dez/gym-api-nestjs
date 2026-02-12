-- AlterTable
ALTER TABLE "gym_settings" ADD COLUMN     "classes_bg_image" TEXT,
ADD COLUMN     "cta_bg_image" TEXT,
ADD COLUMN     "features_bg_image" TEXT,
ADD COLUMN     "font_family" TEXT NOT NULL DEFAULT 'Inter',
ADD COLUMN     "hero_bg_image" TEXT,
ADD COLUMN     "pricing_bg_image" TEXT,
ADD COLUMN     "trainers_bg_image" TEXT,
ADD COLUMN     "workouts_bg_image" TEXT;
