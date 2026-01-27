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
}
