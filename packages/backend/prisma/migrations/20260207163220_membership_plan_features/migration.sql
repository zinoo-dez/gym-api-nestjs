-- CreateEnum
CREATE TYPE "FeatureLevel" AS ENUM ('BASIC', 'STANDARD', 'PREMIUM');

-- CreateTable
CREATE TABLE "features" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "features_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "membership_plan_features" (
    "id" TEXT NOT NULL,
    "membership_plan_id" TEXT NOT NULL,
    "feature_id" TEXT NOT NULL,
    "level" "FeatureLevel" NOT NULL DEFAULT 'BASIC',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "membership_plan_features_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "features_name_key" ON "features"("name");

-- CreateIndex
CREATE INDEX "features_name_idx" ON "features"("name");

-- CreateIndex
CREATE INDEX "membership_plan_features_membership_plan_id_idx" ON "membership_plan_features"("membership_plan_id");

-- CreateIndex
CREATE INDEX "membership_plan_features_feature_id_idx" ON "membership_plan_features"("feature_id");

-- CreateIndex
CREATE UNIQUE INDEX "membership_plan_features_membership_plan_id_feature_id_key" ON "membership_plan_features"("membership_plan_id", "feature_id");

-- AddForeignKey
ALTER TABLE "membership_plan_features" ADD CONSTRAINT "membership_plan_features_membership_plan_id_fkey" FOREIGN KEY ("membership_plan_id") REFERENCES "membership_plans"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "membership_plan_features" ADD CONSTRAINT "membership_plan_features_feature_id_fkey" FOREIGN KEY ("feature_id") REFERENCES "features"("id") ON DELETE CASCADE ON UPDATE CASCADE;
