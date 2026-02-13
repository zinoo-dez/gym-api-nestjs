-- CreateTable
CREATE TABLE "gym_closures" (
    "id" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "reason" TEXT NOT NULL DEFAULT '',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "gym_closures_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "gym_closures_date_idx" ON "gym_closures"("date");
