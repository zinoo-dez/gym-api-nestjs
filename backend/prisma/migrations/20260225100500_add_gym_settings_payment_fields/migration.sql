-- AlterTable
ALTER TABLE "gym_settings"
ADD COLUMN "currency" TEXT NOT NULL DEFAULT 'USD',
ADD COLUMN "tax_percentage" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN "stripe_public_key" TEXT NOT NULL DEFAULT '',
ADD COLUMN "stripe_secret_key" TEXT NOT NULL DEFAULT '',
ADD COLUMN "paypal_client_id" TEXT NOT NULL DEFAULT '',
ADD COLUMN "paypal_secret" TEXT NOT NULL DEFAULT '';
