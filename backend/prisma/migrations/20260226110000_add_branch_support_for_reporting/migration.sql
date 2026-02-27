-- CreateTable
CREATE TABLE "branches" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "address" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "branches_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "branches_code_key" ON "branches"("code");

-- CreateIndex
CREATE INDEX "branches_is_active_idx" ON "branches"("is_active");

-- AlterTable
ALTER TABLE "members" ADD COLUMN "branch_id" TEXT;
ALTER TABLE "class_schedules" ADD COLUMN "branch_id" TEXT;
ALTER TABLE "equipments" ADD COLUMN "branch_id" TEXT;
ALTER TABLE "product_sales" ADD COLUMN "branch_id" TEXT;

-- CreateIndex
CREATE INDEX "members_branch_id_idx" ON "members"("branch_id");

-- CreateIndex
CREATE INDEX "class_schedules_branch_id_idx" ON "class_schedules"("branch_id");

-- CreateIndex
CREATE INDEX "equipments_branch_id_idx" ON "equipments"("branch_id");

-- CreateIndex
CREATE INDEX "product_sales_branch_id_idx" ON "product_sales"("branch_id");

-- AddForeignKey
ALTER TABLE "members" ADD CONSTRAINT "members_branch_id_fkey" FOREIGN KEY ("branch_id") REFERENCES "branches"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "class_schedules" ADD CONSTRAINT "class_schedules_branch_id_fkey" FOREIGN KEY ("branch_id") REFERENCES "branches"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "equipments" ADD CONSTRAINT "equipments_branch_id_fkey" FOREIGN KEY ("branch_id") REFERENCES "branches"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_sales" ADD CONSTRAINT "product_sales_branch_id_fkey" FOREIGN KEY ("branch_id") REFERENCES "branches"("id") ON DELETE SET NULL ON UPDATE CASCADE;
