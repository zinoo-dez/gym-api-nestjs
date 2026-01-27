import { IsUUID } from 'class-validator';

export class BookClassDto {
  @IsUUID()
  memberId!: string;

  @IsUUID()
  classId!: string;
}
