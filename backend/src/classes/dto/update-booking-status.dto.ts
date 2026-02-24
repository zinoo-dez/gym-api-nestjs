import { BookingStatus } from '@prisma/client';
import { IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateBookingStatusDto {
  @ApiProperty({
    enum: BookingStatus,
    description: 'New booking status',
    example: BookingStatus.NO_SHOW,
  })
  @IsEnum(BookingStatus)
  status!: BookingStatus;
}
