import { ApiProperty } from '@nestjs/swagger';

export class RetentionOverviewDto {
  @ApiProperty({ example: 12 })
  highRisk!: number;

  @ApiProperty({ example: 30 })
  mediumRisk!: number;

  @ApiProperty({ example: 88 })
  lowRisk!: number;

  @ApiProperty({ example: 5 })
  newHighThisWeek!: number;

  @ApiProperty({ example: 14 })
  openTasks!: number;

  @ApiProperty({ example: 130 })
  evaluatedMembers!: number;
}
