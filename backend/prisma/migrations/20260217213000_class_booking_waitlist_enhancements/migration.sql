-- CreateTable
CREATE TABLE "class_favorites" (
  "id" TEXT NOT NULL,
  "member_id" TEXT NOT NULL,
  "class_id" TEXT NOT NULL,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "class_favorites_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "instructor_ratings" (
  "id" TEXT NOT NULL,
  "member_id" TEXT NOT NULL,
  "trainer_id" TEXT NOT NULL,
  "class_schedule_id" TEXT NOT NULL,
  "rating" INTEGER NOT NULL,
  "review" TEXT,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "instructor_ratings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "class_packages" (
  "id" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "description" TEXT,
  "pass_type" TEXT NOT NULL,
  "class_id" TEXT,
  "credits_included" INTEGER NOT NULL DEFAULT 0,
  "price" DOUBLE PRECISION NOT NULL,
  "validity_days" INTEGER,
  "monthly_unlimited" BOOLEAN NOT NULL DEFAULT false,
  "is_active" BOOLEAN NOT NULL DEFAULT true,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "class_packages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "member_class_passes" (
  "id" TEXT NOT NULL,
  "member_id" TEXT NOT NULL,
  "class_package_id" TEXT NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'active',
  "purchased_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "expires_at" TIMESTAMP(3) NOT NULL,
  "remaining_credits" INTEGER NOT NULL DEFAULT 0,
  "total_credits" INTEGER NOT NULL DEFAULT 0,
  "monthly_unlimited" BOOLEAN NOT NULL DEFAULT false,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "member_class_passes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "class_credit_transactions" (
  "id" TEXT NOT NULL,
  "member_id" TEXT NOT NULL,
  "member_class_pass_id" TEXT,
  "booking_id" TEXT,
  "transaction_type" TEXT NOT NULL,
  "credits_delta" INTEGER NOT NULL,
  "balance_after" INTEGER NOT NULL,
  "notes" TEXT,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "class_credit_transactions_pkey" PRIMARY KEY ("id")
);

-- Indexes
CREATE UNIQUE INDEX "class_favorites_member_id_class_id_key" ON "class_favorites"("member_id", "class_id");
CREATE INDEX "class_favorites_member_id_idx" ON "class_favorites"("member_id");
CREATE INDEX "class_favorites_class_id_idx" ON "class_favorites"("class_id");

CREATE UNIQUE INDEX "instructor_ratings_member_id_class_schedule_id_key" ON "instructor_ratings"("member_id", "class_schedule_id");
CREATE INDEX "instructor_ratings_trainer_id_idx" ON "instructor_ratings"("trainer_id");
CREATE INDEX "instructor_ratings_class_schedule_id_idx" ON "instructor_ratings"("class_schedule_id");

CREATE INDEX "class_packages_pass_type_idx" ON "class_packages"("pass_type");
CREATE INDEX "class_packages_class_id_idx" ON "class_packages"("class_id");
CREATE INDEX "class_packages_is_active_idx" ON "class_packages"("is_active");

CREATE INDEX "member_class_passes_member_id_idx" ON "member_class_passes"("member_id");
CREATE INDEX "member_class_passes_class_package_id_idx" ON "member_class_passes"("class_package_id");
CREATE INDEX "member_class_passes_status_idx" ON "member_class_passes"("status");
CREATE INDEX "member_class_passes_expires_at_idx" ON "member_class_passes"("expires_at");

CREATE INDEX "class_credit_transactions_member_id_idx" ON "class_credit_transactions"("member_id");
CREATE INDEX "class_credit_transactions_member_class_pass_id_idx" ON "class_credit_transactions"("member_class_pass_id");
CREATE INDEX "class_credit_transactions_booking_id_idx" ON "class_credit_transactions"("booking_id");
CREATE INDEX "class_credit_transactions_transaction_type_idx" ON "class_credit_transactions"("transaction_type");

-- Foreign keys
ALTER TABLE "class_favorites"
ADD CONSTRAINT "class_favorites_member_id_fkey"
FOREIGN KEY ("member_id") REFERENCES "members"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "class_favorites"
ADD CONSTRAINT "class_favorites_class_id_fkey"
FOREIGN KEY ("class_id") REFERENCES "classes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "instructor_ratings"
ADD CONSTRAINT "instructor_ratings_member_id_fkey"
FOREIGN KEY ("member_id") REFERENCES "members"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "instructor_ratings"
ADD CONSTRAINT "instructor_ratings_trainer_id_fkey"
FOREIGN KEY ("trainer_id") REFERENCES "trainers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "instructor_ratings"
ADD CONSTRAINT "instructor_ratings_class_schedule_id_fkey"
FOREIGN KEY ("class_schedule_id") REFERENCES "class_schedules"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "class_packages"
ADD CONSTRAINT "class_packages_class_id_fkey"
FOREIGN KEY ("class_id") REFERENCES "classes"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "member_class_passes"
ADD CONSTRAINT "member_class_passes_member_id_fkey"
FOREIGN KEY ("member_id") REFERENCES "members"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "member_class_passes"
ADD CONSTRAINT "member_class_passes_class_package_id_fkey"
FOREIGN KEY ("class_package_id") REFERENCES "class_packages"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "class_credit_transactions"
ADD CONSTRAINT "class_credit_transactions_member_id_fkey"
FOREIGN KEY ("member_id") REFERENCES "members"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "class_credit_transactions"
ADD CONSTRAINT "class_credit_transactions_member_class_pass_id_fkey"
FOREIGN KEY ("member_class_pass_id") REFERENCES "member_class_passes"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "class_credit_transactions"
ADD CONSTRAINT "class_credit_transactions_booking_id_fkey"
FOREIGN KEY ("booking_id") REFERENCES "class_bookings"("id") ON DELETE SET NULL ON UPDATE CASCADE;
