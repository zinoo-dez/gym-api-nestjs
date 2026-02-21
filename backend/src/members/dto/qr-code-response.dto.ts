import { ApiProperty } from '@nestjs/swagger';

export class QrCodeResponseDto {
  @ApiProperty({
    description: 'QR code token',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  qrCodeToken!: string;

  @ApiProperty({
    description: 'QR code as base64 data URL',
    example: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA...',
  })
  qrCodeDataUrl!: string;

  @ApiProperty({
    description: 'When the QR code was generated',
    example: '2026-02-17T10:30:00.000Z',
  })
  generatedAt!: Date;

  @ApiProperty({
    description: 'Member information',
  })
  member!: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    membershipStatus: string;
  };
}
