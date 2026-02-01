import { BookingStatus } from '@prisma/client';

export class ClassBookingResponseDto {
  id!: string;
  memberId!: string;
  classId!: string;
  status!: BookingStatus;
  createdAt!: Date;
  updatedAt!: Date;
}
