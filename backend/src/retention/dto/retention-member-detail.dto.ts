import { ApiProperty } from '@nestjs/swagger';
import { RetentionTaskStatus } from '@prisma/client';
import { RetentionMemberResponseDto } from './retention-member-response.dto';

class RetentionTaskItemDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  title!: string;

  @ApiProperty({ required: false, nullable: true })
  note?: string;

  @ApiProperty({ enum: RetentionTaskStatus })
  status!: RetentionTaskStatus;

  @ApiProperty()
  priority!: number;

  @ApiProperty({ required: false, nullable: true })
  dueDate?: Date;

  @ApiProperty()
  createdAt!: Date;

  @ApiProperty({ required: false, nullable: true })
  assignedToEmail?: string;
}

class MemberSubscriptionSummaryDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  status!: string;

  @ApiProperty()
  startDate!: Date;

  @ApiProperty()
  endDate!: Date;

  @ApiProperty({ required: false, nullable: true })
  planName?: string;
}

export class RetentionMemberDetailDto {
  @ApiProperty({ type: RetentionMemberResponseDto })
  risk!: RetentionMemberResponseDto;

  @ApiProperty({ type: [RetentionTaskItemDto] })
  tasks!: RetentionTaskItemDto[];

  @ApiProperty({ type: [MemberSubscriptionSummaryDto] })
  recentSubscriptions!: MemberSubscriptionSummaryDto[];
}

