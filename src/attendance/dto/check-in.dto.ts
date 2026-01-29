import { IsUUID, IsEnum, IsOptional } from 'class-validator';
import { AttendanceType } from '@prisma/client';

export class CheckInDto {
  @IsUUID('4', { message: 'Member ID must be a valid UUID' })
  memberId!: string;

  @IsEnum(AttendanceType, {
    message:
      'Type must be a valid attendance type (GYM_VISIT, CLASS_ATTENDANCE)',
  })
  type!: AttendanceType;

  @IsOptional()
  @IsUUID('4', { message: 'Class ID must be a valid UUID' })
  classId?: string;
}
