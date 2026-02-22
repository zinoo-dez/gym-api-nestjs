-- Alter existing equipment table to support full asset management
ALTER TABLE "equipments"
  ADD COLUMN "brand_model" TEXT NOT NULL DEFAULT '',
  ADD COLUMN "serial_number" TEXT,
  ADD COLUMN "purchase_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  ADD COLUMN "purchase_cost" DOUBLE PRECISION NOT NULL DEFAULT 0,
  ADD COLUMN "warranty_expiry_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  ADD COLUMN "condition" TEXT NOT NULL DEFAULT 'good',
  ADD COLUMN "maintenance_frequency" TEXT NOT NULL DEFAULT 'monthly',
  ADD COLUMN "assigned_area" TEXT NOT NULL DEFAULT '',
  ADD COLUMN "notes" TEXT NOT NULL DEFAULT '';

UPDATE "equipments"
SET
  "category" = CASE
    WHEN LOWER("category") LIKE '%cardio%' THEN 'cardio'
    WHEN LOWER("category") LIKE '%strength%' THEN 'strength'
    WHEN LOWER("category") LIKE '%free%' THEN 'free_weights'
    ELSE 'accessories'
  END,
  "last_maintenance_date" = COALESCE("last_maintenance_date", "created_at"),
  "next_maintenance_date" = COALESCE("next_maintenance_date", "created_at"),
  "purchase_date" = COALESCE("purchase_date", "created_at"),
  "warranty_expiry_date" = COALESCE("warranty_expiry_date", "created_at");

ALTER TABLE "equipments"
  ALTER COLUMN "last_maintenance_date" SET NOT NULL,
  ALTER COLUMN "next_maintenance_date" SET NOT NULL;

-- Maintenance history per equipment
CREATE TABLE "equipment_maintenance_logs" (
  "id" TEXT NOT NULL,
  "equipment_id" TEXT NOT NULL,
  "date" TIMESTAMP(3) NOT NULL,
  "type" TEXT NOT NULL,
  "description" TEXT NOT NULL,
  "cost" DOUBLE PRECISION NOT NULL DEFAULT 0,
  "performed_by" TEXT NOT NULL,
  "next_due_date" TIMESTAMP(3),
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "equipment_maintenance_logs_pkey" PRIMARY KEY ("id")
);

-- Audit history for operational changes
CREATE TABLE "equipment_audit_logs" (
  "id" TEXT NOT NULL,
  "equipment_id" TEXT NOT NULL,
  "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "action" TEXT NOT NULL,
  "description" TEXT NOT NULL,
  "performed_by" TEXT NOT NULL,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "equipment_audit_logs_pkey" PRIMARY KEY ("id")
);

-- Foreign keys
ALTER TABLE "equipment_maintenance_logs"
  ADD CONSTRAINT "equipment_maintenance_logs_equipment_id_fkey"
  FOREIGN KEY ("equipment_id") REFERENCES "equipments"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "equipment_audit_logs"
  ADD CONSTRAINT "equipment_audit_logs_equipment_id_fkey"
  FOREIGN KEY ("equipment_id") REFERENCES "equipments"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;

-- Indexes
CREATE INDEX "equipments_condition_idx" ON "equipments"("condition");
CREATE INDEX "equipments_next_maintenance_date_idx" ON "equipments"("next_maintenance_date");
CREATE INDEX "equipments_warranty_expiry_date_idx" ON "equipments"("warranty_expiry_date");

CREATE INDEX "equipment_maintenance_logs_equipment_id_idx" ON "equipment_maintenance_logs"("equipment_id");
CREATE INDEX "equipment_maintenance_logs_date_idx" ON "equipment_maintenance_logs"("date");

CREATE INDEX "equipment_audit_logs_equipment_id_idx" ON "equipment_audit_logs"("equipment_id");
CREATE INDEX "equipment_audit_logs_date_idx" ON "equipment_audit_logs"("date");
