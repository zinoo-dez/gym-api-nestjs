-- AlterTable
ALTER TABLE "members" ADD COLUMN "qr_code_token" TEXT,
ADD COLUMN "qr_code_generated_at" TIMESTAMP(3);

-- CreateIndex
CREATE UNIQUE INDEX "members_qr_code_token_key" ON "members"("qr_code_token");
