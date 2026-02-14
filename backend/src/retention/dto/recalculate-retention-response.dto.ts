import { ApiProperty } from '@nestjs/swagger';

export class RecalculateRetentionResponseDto {
  @ApiProperty()
  processed!: number;

  @ApiProperty()
  high!: number;

  @ApiProperty()
  medium!: number;

  @ApiProperty()
  low!: number;
}

