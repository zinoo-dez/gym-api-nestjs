import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class MemberSubscriptionPlanDto {
  @ApiProperty({
    description: 'Membership plan unique identifier',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  id!: string;

  @ApiProperty({
    description: 'Membership plan name',
    example: 'Premium',
  })
  name!: string;

  @ApiProperty({
    description: 'Membership plan price',
    example: 49.99,
  })
  price!: number;

  @ApiProperty({
    description: 'Plan duration in days',
    example: 30,
  })
  durationDays!: number;
}

export class MemberSubscriptionDto {
  @ApiProperty({
    description: 'Subscription unique identifier',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  id!: string;

  @ApiProperty({
    description: 'Subscription status',
    example: 'ACTIVE',
  })
  status!: string;

  @ApiProperty({
    description: 'Subscription start date',
    example: '2024-01-01T00:00:00.000Z',
  })
  startDate!: Date;

  @ApiProperty({
    description: 'Subscription end date',
    example: '2024-01-31T00:00:00.000Z',
  })
  endDate!: Date;

  @ApiPropertyOptional({ type: MemberSubscriptionPlanDto })
  membershipPlan?: MemberSubscriptionPlanDto;
}

export class MemberResponseDto {
  @ApiProperty({
    description: 'Member unique identifier',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  id!: string;

  @ApiProperty({
    description: 'Member email address',
    example: 'member@example.com',
  })
  email!: string;

  @ApiProperty({
    description: 'Member first name',
    example: 'John',
  })
  firstName!: string;

  @ApiProperty({
    description: 'Member last name',
    example: 'Doe',
  })
  lastName!: string;

  @ApiPropertyOptional({
    description: 'Member phone number',
    example: '+1234567890',
  })
  phone?: string;

  @ApiPropertyOptional({
    description: 'Member date of birth',
    example: '1990-01-15T00:00:00.000Z',
  })
  dateOfBirth?: Date;

  @ApiProperty({
    description: 'Whether the member account is active',
    example: true,
  })
  isActive!: boolean;

  @ApiProperty({
    description: 'Account creation timestamp',
    example: '2024-01-01T00:00:00.000Z',
  })
  createdAt!: Date;

  @ApiProperty({
    description: 'Account last update timestamp',
    example: '2024-01-15T00:00:00.000Z',
  })
  updatedAt!: Date;

  @ApiPropertyOptional({
    description: 'Latest membership subscription info',
    type: [MemberSubscriptionDto],
  })
  subscriptions?: MemberSubscriptionDto[];
}
