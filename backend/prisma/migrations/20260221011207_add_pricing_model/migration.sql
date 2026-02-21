-- CreateEnum
CREATE TYPE "PricingCategory" AS ENUM ('MEMBERSHIP', 'CLASS', 'MERCHANDISE');

-- CreateTable
CREATE TABLE "pricing" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "category" "PricingCategory" NOT NULL,
    "price" DECIMAL(10,2) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "duration" INTEGER,
    "features" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "pricing_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "pricing_category_idx" ON "pricing"("category");

-- CreateIndex
CREATE INDEX "pricing_is_active_idx" ON "pricing"("is_active");

-- CreateIndex
CREATE INDEX "pricing_sort_order_idx" ON "pricing"("sort_order");
