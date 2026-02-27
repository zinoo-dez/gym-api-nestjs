import { IsString } from 'class-validator';

export class BookClassDto {
  @IsString({ message: 'Member ID must be a string' })
  memberId!: string;

  @IsString({ message: 'Class schedule ID must be a string' })
  classScheduleId!: string;
}
