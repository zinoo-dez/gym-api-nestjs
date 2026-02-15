-- Create enums
CREATE TYPE "ProductCategory" AS ENUM (
  'SUPPLEMENT',
  'MERCHANDISE',
  'PROTEIN_SHAKE',
  'OTHER'
);

CREATE TYPE "PosPaymentMethod" AS ENUM (
  'CASH',
  'CARD',
  'KBZ_PAY',
  'AYA_PAY',
  'WAVE_MONEY',
  'BANK_TRANSFER'
);

CREATE TYPE "ProductSaleStatus" AS ENUM (
  'COMPLETED',
  'REFUNDED',
  'VOIDED'
);

CREATE TYPE "StockMovementType" AS ENUM (
  'RESTOCK',
  'SALE',
  'ADJUSTMENT',
  'RETURN'
);

-- Create tables
CREATE TABLE "products" (
  "id" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "sku" TEXT NOT NULL,
  "category" "ProductCategory" NOT NULL DEFAULT 'OTHER',
  "description" TEXT,
  "sale_price" DOUBLE PRECISION NOT NULL,
  "cost_price" DOUBLE PRECISION,
  "stock_quantity" INTEGER NOT NULL DEFAULT 0,
  "low_stock_threshold" INTEGER NOT NULL DEFAULT 5,
  "is_active" BOOLEAN NOT NULL DEFAULT true,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "products_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "product_sales" (
  "id" TEXT NOT NULL,
  "sale_number" TEXT NOT NULL,
  "member_id" TEXT,
  "processed_by_user_id" TEXT,
  "payment_method" "PosPaymentMethod" NOT NULL DEFAULT 'CASH',
  "status" "ProductSaleStatus" NOT NULL DEFAULT 'COMPLETED',
  "subtotal" DOUBLE PRECISION NOT NULL,
  "discount" DOUBLE PRECISION NOT NULL DEFAULT 0,
  "tax" DOUBLE PRECISION NOT NULL DEFAULT 0,
  "total" DOUBLE PRECISION NOT NULL,
  "notes" TEXT,
  "sold_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "product_sales_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "product_sale_items" (
  "id" TEXT NOT NULL,
  "sale_id" TEXT NOT NULL,
  "product_id" TEXT NOT NULL,
  "quantity" INTEGER NOT NULL,
  "unit_price" DOUBLE PRECISION NOT NULL,
  "line_total" DOUBLE PRECISION NOT NULL,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "product_sale_items_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "inventory_stock_movements" (
  "id" TEXT NOT NULL,
  "product_id" TEXT NOT NULL,
  "movement_type" "StockMovementType" NOT NULL,
  "quantity_delta" INTEGER NOT NULL,
  "previous_quantity" INTEGER NOT NULL,
  "new_quantity" INTEGER NOT NULL,
  "reference_type" TEXT,
  "reference_id" TEXT,
  "note" TEXT,
  "created_by_user_id" TEXT,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "inventory_stock_movements_pkey" PRIMARY KEY ("id")
);

-- Create indexes
CREATE UNIQUE INDEX "products_sku_key" ON "products"("sku");
CREATE INDEX "products_name_idx" ON "products"("name");
CREATE INDEX "products_sku_idx" ON "products"("sku");
CREATE INDEX "products_category_idx" ON "products"("category");
CREATE INDEX "products_is_active_idx" ON "products"("is_active");
CREATE INDEX "products_stock_quantity_idx" ON "products"("stock_quantity");

CREATE UNIQUE INDEX "product_sales_sale_number_key" ON "product_sales"("sale_number");
CREATE INDEX "product_sales_member_id_idx" ON "product_sales"("member_id");
CREATE INDEX "product_sales_processed_by_user_id_idx" ON "product_sales"("processed_by_user_id");
CREATE INDEX "product_sales_sold_at_idx" ON "product_sales"("sold_at");
CREATE INDEX "product_sales_status_idx" ON "product_sales"("status");
CREATE INDEX "product_sales_payment_method_idx" ON "product_sales"("payment_method");

CREATE INDEX "product_sale_items_sale_id_idx" ON "product_sale_items"("sale_id");
CREATE INDEX "product_sale_items_product_id_idx" ON "product_sale_items"("product_id");

CREATE INDEX "inventory_stock_movements_product_id_idx" ON "inventory_stock_movements"("product_id");
CREATE INDEX "inventory_stock_movements_movement_type_idx" ON "inventory_stock_movements"("movement_type");
CREATE INDEX "inventory_stock_movements_created_by_user_id_idx" ON "inventory_stock_movements"("created_by_user_id");
CREATE INDEX "inventory_stock_movements_created_at_idx" ON "inventory_stock_movements"("created_at");

-- Add foreign keys
ALTER TABLE "product_sales"
ADD CONSTRAINT "product_sales_member_id_fkey"
FOREIGN KEY ("member_id") REFERENCES "members"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "product_sales"
ADD CONSTRAINT "product_sales_processed_by_user_id_fkey"
FOREIGN KEY ("processed_by_user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "product_sale_items"
ADD CONSTRAINT "product_sale_items_sale_id_fkey"
FOREIGN KEY ("sale_id") REFERENCES "product_sales"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "product_sale_items"
ADD CONSTRAINT "product_sale_items_product_id_fkey"
FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "inventory_stock_movements"
ADD CONSTRAINT "inventory_stock_movements_product_id_fkey"
FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "inventory_stock_movements"
ADD CONSTRAINT "inventory_stock_movements_created_by_user_id_fkey"
FOREIGN KEY ("created_by_user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
