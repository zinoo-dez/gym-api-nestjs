export class ClassPackageResponseDto {
  id!: string;
  name!: string;
  description?: string;
  passType!: string;
  classId?: string;
  creditsIncluded!: number;
  price!: number;
  validityDays?: number;
  monthlyUnlimited!: boolean;
  isActive!: boolean;
  createdAt!: Date;
  updatedAt!: Date;
}
