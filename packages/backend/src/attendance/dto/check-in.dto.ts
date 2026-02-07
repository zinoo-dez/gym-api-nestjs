import { IsString, IsEnum, IsOptional } from 'class-validator';
import { AttendanceType } from '@prisma/client';

export class CheckInDto {
  @IsString({ message: 'Member ID must be a valid string' })
  memberId!: string;

  @IsEnum(AttendanceType, {
    message:
      'Type must be a valid attendance type (GYM_VISIT, CLASS_ATTENDANCE)',
  })
  type!: AttendanceType;

  @IsOptional()
  @IsString({ message: 'Class schedule ID must be a valid string' })
  classScheduleId?: string;
}
