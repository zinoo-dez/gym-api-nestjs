export class ClassSummaryDto {
  id!: string;
  name!: string;
  duration!: number;
  capacity!: number;
  classType!: string;
}

export class TrainerResponseDto {
  id!: string;
  email!: string;
  firstName!: string;
  lastName!: string;
  avatarUrl?: string;
  specializations!: string[];
  certifications!: string[];
  isActive!: boolean;
  experience?: number;
  hourlyRate?: number;
  createdAt!: Date;
  updatedAt!: Date;
  classes?: ClassSummaryDto[];
}
