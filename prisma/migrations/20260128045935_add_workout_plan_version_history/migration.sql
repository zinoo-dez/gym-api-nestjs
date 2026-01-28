-- CreateTable
CREATE TABLE "WorkoutPlanVersion" (
    "id" TEXT NOT NULL,
    "workoutPlanId" TEXT NOT NULL,
    "version" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "goal" "WorkoutGoal" NOT NULL,
    "exercises" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "WorkoutPlanVersion_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "WorkoutPlanVersion_workoutPlanId_version_idx" ON "WorkoutPlanVersion"("workoutPlanId", "version");

-- CreateIndex
CREATE UNIQUE INDEX "WorkoutPlanVersion_workoutPlanId_version_key" ON "WorkoutPlanVersion"("workoutPlanId", "version");

-- AddForeignKey
ALTER TABLE "WorkoutPlanVersion" ADD CONSTRAINT "WorkoutPlanVersion_workoutPlanId_fkey" FOREIGN KEY ("workoutPlanId") REFERENCES "WorkoutPlan"("id") ON DELETE CASCADE ON UPDATE CASCADE;
