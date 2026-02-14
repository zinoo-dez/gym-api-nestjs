import { ApiProperty } from '@nestjs/swagger';
import { RetentionTaskStatus } from '@prisma/client';

export class RetentionTaskResponseDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  memberId!: string;

  @ApiProperty()
  memberName!: string;

  @ApiProperty()
  memberEmail!: string;

  @ApiProperty({ required: false, nullable: true })
  assignedToId?: string;

  @ApiProperty({ required: false, nullable: true })
  assignedToEmail?: string;

  @ApiProperty({ enum: RetentionTaskStatus })
  status!: RetentionTaskStatus;

  @ApiProperty()
  priority!: number;

  @ApiProperty()
  title!: string;

  @ApiProperty({ required: false, nullable: true })
  note?: string;

  @ApiProperty({ required: false, nullable: true })
  dueDate?: Date;

  @ApiProperty({ required: false, nullable: true })
  resolvedAt?: Date;

  @ApiProperty()
  createdAt!: Date;

  @ApiProperty()
  updatedAt!: Date;
}

