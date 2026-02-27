import { IsString } from 'class-validator';

export class UpgradeMembershipDto {
  @IsString()
  newPlanId!: string;
}
