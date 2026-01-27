export class ClassResponseDto {
  id!: string;
  name!: string;
  description?: string;
  trainerId!: string;
  trainerName?: string;
  schedule!: Date;
  duration!: number;
  capacity!: number;
  classType!: string;
  isActive!: boolean;
  availableSlots?: number;
  createdAt!: Date;
  updatedAt!: Date;
}
