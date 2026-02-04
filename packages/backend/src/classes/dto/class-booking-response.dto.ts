import { BookingStatus } from '@prisma/client';

export class ClassBookingResponseDto {
  id!: string;
  memberId!: string;
  classScheduleId!: string;
  status!: BookingStatus;
  createdAt!: Date;
  updatedAt!: Date;
}
