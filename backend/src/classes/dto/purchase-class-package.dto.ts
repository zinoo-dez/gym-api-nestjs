import { IsString } from 'class-validator';

export class PurchaseClassPackageDto {
  @IsString({ message: 'Member ID must be a string' })
  memberId!: string;
}
