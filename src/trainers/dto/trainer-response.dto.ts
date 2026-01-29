export class ClassSummaryDto {
  id!: string;
  name!: string;
  schedule!: Date;
  duration!: number;
  capacity!: number;
  classType!: string;
}

export class TrainerResponseDto {
  id!: string;
  email!: string;
  firstName!: string;
  lastName!: string;
  specializations!: string[];
  certifications!: string[];
  isActive!: boolean;
  createdAt!: Date;
  updatedAt!: Date;
  classes?: ClassSummaryDto[];
}
