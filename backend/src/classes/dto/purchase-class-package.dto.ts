import { IsUUID } from 'class-validator';

export class PurchaseClassPackageDto {
  @IsUUID('4', { message: 'Member ID must be a valid UUID' })
  memberId!: string;
}
