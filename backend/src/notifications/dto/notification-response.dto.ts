import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class NotificationResponseDto {
  @ApiProperty({
    description: 'Notification unique identifier',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  id!: string;

  @ApiProperty({ description: 'Notification title', example: 'New member' })
  title!: string;

  @ApiProperty({ description: 'Notification message', example: 'John joined' })
  message!: string;

  @ApiProperty({ description: 'Notification type', example: 'success' })
  type!: string;

  @ApiProperty({ description: 'Read status', example: false })
  read!: boolean;

  @ApiPropertyOptional({ description: 'Action URL', example: '/admin/members' })
  actionUrl?: string;

  @ApiPropertyOptional({ description: 'Target role', example: 'ADMIN' })
  role?: string;

  @ApiProperty({
    description: 'Created at',
    example: '2024-01-01T00:00:00.000Z',
  })
  createdAt!: Date;
}
