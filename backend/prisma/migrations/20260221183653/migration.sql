-- AlterTable
ALTER TABLE "equipments" ALTER COLUMN "last_maintenance_date" SET DEFAULT CURRENT_TIMESTAMP,
ALTER COLUMN "next_maintenance_date" SET DEFAULT CURRENT_TIMESTAMP;
