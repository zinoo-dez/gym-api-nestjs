export class FeatureResponseDto {
  id!: string;
  name!: string;
  description?: string;
  isSystem!: boolean;
  defaultName?: string;
  createdAt!: Date;
  updatedAt!: Date;
}
