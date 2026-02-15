-- CreateTable
CREATE TABLE "retention_task_history" (
    "id" TEXT NOT NULL,
    "task_id" TEXT NOT NULL,
    "changed_by_user_id" TEXT,
    "from_status" "RetentionTaskStatus",
    "to_status" "RetentionTaskStatus",
    "from_priority" INTEGER,
    "to_priority" INTEGER,
    "from_assigned_to_user_id" TEXT,
    "to_assigned_to_user_id" TEXT,
    "from_note" TEXT,
    "to_note" TEXT,
    "from_due_date" TIMESTAMP(3),
    "to_due_date" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "retention_task_history_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "retention_task_history_task_id_idx" ON "retention_task_history"("task_id");

-- CreateIndex
CREATE INDEX "retention_task_history_changed_by_user_id_idx" ON "retention_task_history"("changed_by_user_id");

-- CreateIndex
CREATE INDEX "retention_task_history_created_at_idx" ON "retention_task_history"("created_at");

-- AddForeignKey
ALTER TABLE "retention_task_history" ADD CONSTRAINT "retention_task_history_task_id_fkey" FOREIGN KEY ("task_id") REFERENCES "retention_tasks"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "retention_task_history" ADD CONSTRAINT "retention_task_history_changed_by_user_id_fkey" FOREIGN KEY ("changed_by_user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
