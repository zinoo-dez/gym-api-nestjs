# Workout Plan Version History

## Overview

The workout plan version history feature automatically tracks changes to workout plans over time. Every time a workout plan is updated, the previous version is stored in the database, allowing you to view the complete history of changes.

## How It Works

1. **Automatic Version Storage**: When you update a workout plan using the `PATCH /workout-plans/:id` endpoint, the system automatically:
   - Stores the current state as a new version before applying the update
   - Increments the version number
   - Preserves all exercise data as a JSON snapshot

2. **Version Numbering**: Versions are numbered sequentially starting from 1:
   - Version 1: Created after the first update
   - Version 2: Created after the second update
   - And so on...

## API Endpoints

### Get Version History

Retrieve all versions of a workout plan:

```
GET /workout-plans/:id/versions
```

**Response:**

```json
[
  {
    "id": "version-uuid",
    "workoutPlanId": "plan-uuid",
    "version": 2,
    "name": "Updated Plan Name",
    "description": "Updated description",
    "goal": "MUSCLE_GAIN",
    "exercises": [
      {
        "id": "exercise-uuid",
        "name": "Bench Press",
        "sets": 3,
        "reps": 10,
        "targetMuscles": ["chest", "triceps"],
        "order": 0
      }
    ],
    "createdAt": "2024-01-28T12:00:00Z"
  },
  {
    "id": "version-uuid",
    "workoutPlanId": "plan-uuid",
    "version": 1,
    "name": "Original Plan Name",
    "description": "Original description",
    "goal": "MUSCLE_GAIN",
    "exercises": [...],
    "createdAt": "2024-01-27T12:00:00Z"
  }
]
```

### Get Specific Version

Retrieve a specific version of a workout plan:

```
GET /workout-plans/:id/versions/:version
```

**Example:**

```
GET /workout-plans/abc-123/versions/1
```

**Response:**

```json
{
  "id": "version-uuid",
  "workoutPlanId": "plan-uuid",
  "version": 1,
  "name": "Original Plan Name",
  "description": "Original description",
  "goal": "MUSCLE_GAIN",
  "exercises": [...],
  "createdAt": "2024-01-27T12:00:00Z"
}
```

## Use Cases

1. **Track Progress**: View how a member's workout plan has evolved over time
2. **Audit Trail**: Maintain a complete history of all changes for compliance
3. **Rollback Reference**: Use historical versions as reference when creating new plans
4. **Performance Analysis**: Compare different versions to see what worked best

## Database Schema

The version history is stored in the `WorkoutPlanVersion` table:

```prisma
model WorkoutPlanVersion {
  id            String      @id @default(uuid())
  workoutPlanId String
  workoutPlan   WorkoutPlan @relation(fields: [workoutPlanId], references: [id], onDelete: Cascade)
  version       Int
  name          String
  description   String?
  goal          WorkoutGoal
  exercises     Json // JSON snapshot of exercises
  createdAt     DateTime    @default(now())

  @@index([workoutPlanId, version])
  @@unique([workoutPlanId, version])
}
```

## Notes

- Versions are created only when a workout plan is updated, not when it's first created
- Deleting a workout plan will cascade delete all its versions
- Exercise data is stored as JSON to preserve the exact state at the time of the version
- Versions are ordered by version number in descending order (newest first)
