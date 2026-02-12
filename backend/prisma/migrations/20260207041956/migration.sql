-- CreateEnum
CREATE TYPE "DiscountType" AS ENUM ('PERCENT', 'FIXED');

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

-- CreateIndex
CREATE UNIQUE INDEX "discount_codes_code_key" ON "discount_codes"("code");

-- CreateIndex
CREATE INDEX "discount_codes_code_idx" ON "discount_codes"("code");

-- CreateIndex
CREATE INDEX "discount_codes_is_active_idx" ON "discount_codes"("is_active");

-- CreateIndex
CREATE INDEX "subscriptions_discount_code_id_idx" ON "subscriptions"("discount_code_id");

-- AddForeignKey
ALTER TABLE "subscriptions" ADD CONSTRAINT "subscriptions_discount_code_id_fkey" FOREIGN KEY ("discount_code_id") REFERENCES "discount_codes"("id") ON DELETE SET NULL ON UPDATE CASCADE;
