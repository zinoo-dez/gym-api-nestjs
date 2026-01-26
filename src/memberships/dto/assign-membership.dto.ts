import { IsUUID, IsDateString } from 'class-validator';

export class AssignMembershipDto {
  @IsUUID()
  memberId!: string;

  @IsUUID()
  planId!: string;

  @IsDateString()
  startDate!: string;
}
