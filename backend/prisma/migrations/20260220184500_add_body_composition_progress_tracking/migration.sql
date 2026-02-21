-- CreateEnum
CREATE TYPE "ProgressPhotoPose" AS ENUM ('FRONT', 'SIDE', 'BACK', 'FLEXED', 'OTHER');

-- CreateEnum
CREATE TYPE "ProgressPhotoPhase" AS ENUM ('BEFORE', 'AFTER', 'PROGRESS');

-- CreateEnum
CREATE TYPE "ProgressGoalType" AS ENUM ('WEIGHT', 'STRENGTH', 'BODY_COMPOSITION', 'MEASUREMENT');

-- CreateEnum
CREATE TYPE "ProgressMetric" AS ENUM (
  'WEIGHT',
  'BMI',
  'BODY_FAT',
  'MUSCLE_MASS',
  'CHEST',
  'WAIST',
  'HIPS',
  'LEFT_ARM',
  'RIGHT_ARM',
  'LEFT_THIGH',
  'RIGHT_THIGH',
  'LEFT_CALF',
  'RIGHT_CALF',
  'BENCH_PRESS',
  'SQUAT',
  'DEADLIFT',
  'CUSTOM'
);

-- CreateEnum
CREATE TYPE "ProgressGoalStatus" AS ENUM ('ACTIVE', 'ACHIEVED', 'PAUSED', 'CANCELLED');

-- AlterTable
ALTER TABLE "user_progress"
ADD COLUMN "notes" TEXT,
ADD COLUMN "neck" DOUBLE PRECISION,
ADD COLUMN "chest" DOUBLE PRECISION,
ADD COLUMN "waist" DOUBLE PRECISION,
ADD COLUMN "hips" DOUBLE PRECISION,
ADD COLUMN "left_arm" DOUBLE PRECISION,
ADD COLUMN "right_arm" DOUBLE PRECISION,
ADD COLUMN "left_thigh" DOUBLE PRECISION,
ADD COLUMN "right_thigh" DOUBLE PRECISION,
ADD COLUMN "left_calf" DOUBLE PRECISION,
ADD COLUMN "right_calf" DOUBLE PRECISION;

-- CreateTable
CREATE TABLE "progress_photos" (
  "id" TEXT NOT NULL,
  "member_id" TEXT NOT NULL,
  "photo_url" TEXT NOT NULL,
  "pose" "ProgressPhotoPose" NOT NULL DEFAULT 'FRONT',
  "phase" "ProgressPhotoPhase" NOT NULL DEFAULT 'PROGRESS',
  "captured_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "note" TEXT,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "progress_photos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "progress_goals" (
  "id" TEXT NOT NULL,
  "member_id" TEXT NOT NULL,
  "type" "ProgressGoalType" NOT NULL,
  "metric" "ProgressMetric" NOT NULL,
  "title" TEXT NOT NULL,
  "description" TEXT,
  "unit" TEXT,
  "start_value" DOUBLE PRECISION NOT NULL,
  "target_value" DOUBLE PRECISION NOT NULL,
  "current_value" DOUBLE PRECISION NOT NULL,
  "status" "ProgressGoalStatus" NOT NULL DEFAULT 'ACTIVE',
  "start_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "target_date" TIMESTAMP(3),
  "achieved_at" TIMESTAMP(3),
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "progress_goals_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "progress_milestones" (
  "id" TEXT NOT NULL,
  "member_id" TEXT NOT NULL,
  "goal_id" TEXT,
  "title" TEXT NOT NULL,
  "description" TEXT,
  "reached_value" DOUBLE PRECISION,
  "unit" TEXT,
  "share_token" TEXT,
  "achieved_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "progress_milestones_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "progress_photos_member_id_idx" ON "progress_photos"("member_id");

-- CreateIndex
CREATE INDEX "progress_photos_captured_at_idx" ON "progress_photos"("captured_at");

-- CreateIndex
CREATE INDEX "progress_photos_phase_idx" ON "progress_photos"("phase");

-- CreateIndex
CREATE INDEX "progress_goals_member_id_idx" ON "progress_goals"("member_id");

-- CreateIndex
CREATE INDEX "progress_goals_status_idx" ON "progress_goals"("status");

-- CreateIndex
CREATE INDEX "progress_goals_target_date_idx" ON "progress_goals"("target_date");

-- CreateIndex
CREATE UNIQUE INDEX "progress_milestones_share_token_key" ON "progress_milestones"("share_token");

-- CreateIndex
CREATE INDEX "progress_milestones_member_id_idx" ON "progress_milestones"("member_id");

-- CreateIndex
CREATE INDEX "progress_milestones_goal_id_idx" ON "progress_milestones"("goal_id");

-- CreateIndex
CREATE INDEX "progress_milestones_achieved_at_idx" ON "progress_milestones"("achieved_at");

-- AddForeignKey
ALTER TABLE "progress_photos"
ADD CONSTRAINT "progress_photos_member_id_fkey"
FOREIGN KEY ("member_id") REFERENCES "members"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "progress_goals"
ADD CONSTRAINT "progress_goals_member_id_fkey"
FOREIGN KEY ("member_id") REFERENCES "members"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "progress_milestones"
ADD CONSTRAINT "progress_milestones_member_id_fkey"
FOREIGN KEY ("member_id") REFERENCES "members"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "progress_milestones"
ADD CONSTRAINT "progress_milestones_goal_id_fkey"
FOREIGN KEY ("goal_id") REFERENCES "progress_goals"("id") ON DELETE SET NULL ON UPDATE CASCADE;
