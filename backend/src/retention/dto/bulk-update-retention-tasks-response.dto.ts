import { ApiProperty } from '@nestjs/swagger';

export class BulkUpdateRetentionTasksResponseDto {
  @ApiProperty({ example: 3 })
  updatedCount!: number;
}

