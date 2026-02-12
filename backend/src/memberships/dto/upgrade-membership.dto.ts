import { IsUUID } from 'class-validator';

export class UpgradeMembershipDto {
  @IsUUID()
  newPlanId!: string;
}
