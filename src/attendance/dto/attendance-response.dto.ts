import { AttendanceType } from '@prisma/client';

export class AttendanceResponseDto {
  id!: string;
  memberId!: string;
  classId?: string;
  checkInTime!: Date;
  checkOutTime?: Date;
  type!: AttendanceType;
  createdAt!: Date;
  member?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  class?: {
    id: string;
    name: string;
    schedule: Date;
  };
}
