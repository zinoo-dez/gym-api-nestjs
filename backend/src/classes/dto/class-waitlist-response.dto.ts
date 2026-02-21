export class ClassWaitlistResponseDto {
  id!: string;
  memberId!: string;
  classScheduleId!: string;
  position!: number;
  status!: string;
  notifiedAt?: Date;
  expiresAt?: Date;
  createdAt!: Date;
  updatedAt!: Date;
}
