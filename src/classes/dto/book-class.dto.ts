import { IsUUID } from 'class-validator';

export class BookClassDto {
  @IsUUID('4', { message: 'Member ID must be a valid UUID' })
  memberId!: string;

  @IsUUID('4', { message: 'Class ID must be a valid UUID' })
  classId!: string;
}
