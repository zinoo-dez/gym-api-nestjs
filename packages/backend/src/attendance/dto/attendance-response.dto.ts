import { AttendanceType } from '@prisma/client';

export class AttendanceResponseDto {
  id!: string;
  memberId!: string;
  classScheduleId?: string;
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
  classSchedule?: {
    id: string;
    classId: string;
    className: string;
    startTime: Date;
    endTime: Date;
  };
}
