export class MembershipPlanResponseDto {
  id!: string;
  name!: string;
  description?: string;
  durationDays!: number;
  price!: number;
  unlimitedClasses!: boolean;
  personalTrainingHours!: number;
  accessToEquipment!: boolean;
  accessToLocker!: boolean;
  nutritionConsultation!: boolean;
  createdAt!: Date;
  updatedAt!: Date;
}
