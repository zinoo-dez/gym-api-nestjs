import { WorkoutGoal } from '../../common/enums';

export class ExerciseResponseDto {
  id!: string;
  name!: string;
  description?: string;
  sets!: number;
  reps!: number;
  duration?: number;
  targetMuscles!: string[];
  order!: number;
  createdAt!: Date;
  updatedAt!: Date;
}

export class WorkoutPlanResponseDto {
  id!: string;
  name!: string;
  description?: string;
  memberId!: string;
  trainerId!: string;
  goal!: WorkoutGoal;
  isActive!: boolean;
  createdAt!: Date;
  updatedAt!: Date;
  exercises?: ExerciseResponseDto[];
}
