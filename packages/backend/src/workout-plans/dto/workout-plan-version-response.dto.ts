import { WorkoutGoal } from '../../common/enums';

export class WorkoutPlanVersionResponseDto {
  id!: string;
  workoutPlanId!: string;
  version!: number;
  name!: string;
  description?: string;
  goal!: WorkoutGoal;
  exercises!: any[]; // JSON snapshot of exercises
  createdAt!: Date;
}
