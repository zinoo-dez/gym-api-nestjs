import { IsUUID, IsEnum, IsOptional } from 'class-validator';
import { AttendanceType } from '@prisma/client';

export class CheckInDto {
  @IsUUID()
  memberId!: string;

  @IsEnum(AttendanceType)
  type!: AttendanceType;

  @IsOptional()
  @IsUUID()
  classId?: string;
}
