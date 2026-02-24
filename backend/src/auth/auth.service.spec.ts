import { UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { NotificationType } from '@prisma/client';

describe('AuthService password reset', () => {
  const prismaMock = {
    user: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
  } as any;

  const jwtServiceMock = {
    signAsync: jest.fn(),
    verify: jest.fn(),
  } as any;

  const notificationsServiceMock = {
    createForUser: jest.fn(),
  } as any;

  const configServiceMock = {
    get: jest.fn(),
  } as any;

  const service = new AuthService(
    prismaMock,
    jwtServiceMock,
    notificationsServiceMock,
    configServiceMock,
  );

  beforeEach(() => {
    jest.clearAllMocks();
    configServiceMock.get.mockImplementation((key: string) => {
      if (key === 'PASSWORD_RESET_TOKEN_EXPIRES_IN') return '15m';
      if (key === 'FRONTEND_URL') return 'http://localhost:5173';
      return undefined;
    });
  });

  it('generates reset token and notification on forgot password', async () => {
    prismaMock.user.findUnique.mockResolvedValue({
      id: 'user_1',
      email: 'member@example.com',
      updatedAt: new Date('2026-02-24T00:00:00.000Z'),
      firstName: 'Member',
    });
    jwtServiceMock.signAsync.mockResolvedValue('reset-token');

    await service.forgotPassword({ email: 'member@example.com' });

    expect(jwtServiceMock.signAsync).toHaveBeenCalled();
    expect(notificationsServiceMock.createForUser).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: 'user_1',
        type: NotificationType.IN_APP,
      }),
    );
  });

  it('resets password with valid token payload', async () => {
    jwtServiceMock.verify.mockReturnValue({
      sub: 'user_1',
      email: 'member@example.com',
      typ: 'password_reset',
      pwdChangedAt: new Date('2026-02-24T00:00:00.000Z').getTime(),
    });
    prismaMock.user.findUnique.mockResolvedValue({
      id: 'user_1',
      email: 'member@example.com',
      updatedAt: new Date('2026-02-24T00:00:00.000Z'),
    });
    prismaMock.user.update.mockResolvedValue({});

    const result = await service.resetPassword({
      token: 'valid',
      newPassword: 'SecurePass123!',
    });

    expect(prismaMock.user.update).toHaveBeenCalled();
    expect(result).toEqual({ message: 'Password reset successfully' });
  });

  it('rejects reset when token type is invalid', async () => {
    jwtServiceMock.verify.mockReturnValue({
      sub: 'user_1',
      email: 'member@example.com',
      typ: 'access',
      pwdChangedAt: Date.now(),
    });

    await expect(
      service.resetPassword({ token: 'bad', newPassword: 'SecurePass123!' }),
    ).rejects.toBeInstanceOf(UnauthorizedException);
  });
});
