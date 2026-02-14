import { ApiProperty } from '@nestjs/swagger';
import { RetentionRiskLevel } from '@prisma/client';

export class RetentionMemberResponseDto {
  @ApiProperty()
  memberId!: string;

  @ApiProperty()
  fullName!: string;

  @ApiProperty()
  email!: string;

  @ApiProperty({ enum: RetentionRiskLevel })
  riskLevel!: RetentionRiskLevel;

  @ApiProperty({ example: 65 })
  score!: number;

  @ApiProperty({ type: [String] })
  reasons!: string[];

  @ApiProperty({ nullable: true, required: false })
  lastCheckInAt?: Date;

  @ApiProperty({ nullable: true, required: false })
  daysSinceCheckIn?: number;

  @ApiProperty({ nullable: true, required: false })
  subscriptionEndsAt?: Date;

  @ApiProperty()
  unpaidPendingCount!: number;

  @ApiProperty()
  lastEvaluatedAt!: Date;
}

