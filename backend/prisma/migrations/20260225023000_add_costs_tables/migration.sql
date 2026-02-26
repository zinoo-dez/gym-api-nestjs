-- CreateTable
CREATE TABLE "costs" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "cost_type" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "tax_amount" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "payment_method" TEXT NOT NULL,
    "billing_period" TEXT NOT NULL,
    "cost_date" TIMESTAMP(3) NOT NULL,
    "due_date" TIMESTAMP(3) NOT NULL,
    "paid_date" TIMESTAMP(3),
    "payment_status" TEXT NOT NULL DEFAULT 'pending',
    "budget_group" TEXT NOT NULL DEFAULT '',
    "vendor" TEXT NOT NULL DEFAULT '',
    "reference_number" TEXT NOT NULL DEFAULT '',
    "notes" TEXT NOT NULL DEFAULT '',
    "created_by" TEXT NOT NULL DEFAULT 'System',
    "status" TEXT NOT NULL DEFAULT 'active',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "costs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cost_audit_logs" (
    "id" TEXT NOT NULL,
    "cost_id" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "action" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "performed_by" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "cost_audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "costs_category_idx" ON "costs"("category");

-- CreateIndex
CREATE INDEX "costs_cost_type_idx" ON "costs"("cost_type");

-- CreateIndex
CREATE INDEX "costs_cost_date_idx" ON "costs"("cost_date");

-- CreateIndex
CREATE INDEX "costs_due_date_idx" ON "costs"("due_date");

-- CreateIndex
CREATE INDEX "costs_payment_status_idx" ON "costs"("payment_status");

-- CreateIndex
CREATE INDEX "costs_status_idx" ON "costs"("status");

-- CreateIndex
CREATE INDEX "cost_audit_logs_cost_id_idx" ON "cost_audit_logs"("cost_id");

-- CreateIndex
CREATE INDEX "cost_audit_logs_date_idx" ON "cost_audit_logs"("date");

-- AddForeignKey
ALTER TABLE "cost_audit_logs" ADD CONSTRAINT "cost_audit_logs_cost_id_fkey"
FOREIGN KEY ("cost_id") REFERENCES "costs"("id") ON DELETE CASCADE ON UPDATE CASCADE;
