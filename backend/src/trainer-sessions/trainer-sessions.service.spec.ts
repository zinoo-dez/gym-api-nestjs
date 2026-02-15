import { ForbiddenException } from '@nestjs/common';
import { SessionStatus, UserRole } from '@prisma/client';
import { TrainerSessionsService } from './trainer-sessions.service';

describe('TrainerSessionsService', () => {
  let service: TrainerSessionsService;
  let prismaMock: any;
  let notificationsMock: any;

  beforeEach(() => {
    prismaMock = {
      member: { findUnique: jest.fn() },
      trainer: { findUnique: jest.fn() },
      trainerSession: {
        create: jest.fn(),
        findUnique: jest.fn(),
        findMany: jest.fn(),
        update: jest.fn(),
      },
      userProgress: { create: jest.fn(), findMany: jest.fn() },
    };
    notificationsMock = { createForUser: jest.fn() };
    service = new TrainerSessionsService(prismaMock, notificationsMock);
  });

  it('creates session with mapped prisma fields and default status', async () => {
    prismaMock.member.findUnique.mockResolvedValue({
      id: 'member-1',
      userId: 'user-member-1',
      user: { firstName: 'Alice', lastName: 'Member' },
    });
    prismaMock.trainer.findUnique.mockResolvedValue({
      id: 'trainer-1',
      userId: 'user-trainer-1',
      user: { firstName: 'Tom', lastName: 'Trainer' },
    });
    prismaMock.trainerSession.create.mockResolvedValue({
      id: 'session-1',
      status: SessionStatus.SCHEDULED,
    });

    const result = await service.createSession(
      {
        memberId: 'member-1',
        trainerId: 'trainer-1',
        sessionDate: '2026-02-20T10:00:00.000Z',
        duration: 60,
        title: 'Strength Session',
        rate: 25000,
      },
      { userId: 'admin-1', role: UserRole.ADMIN },
    );

    expect(result).toMatchObject({ id: 'session-1' });
    expect(prismaMock.trainerSession.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          memberId: 'member-1',
          trainerId: 'trainer-1',
          duration: 60,
          title: 'Strength Session',
          rate: 25000,
          status: SessionStatus.SCHEDULED,
        }),
      }),
    );
    expect(notificationsMock.createForUser).toHaveBeenCalled();
  });

  it('blocks trainer from completing another trainer session', async () => {
    prismaMock.trainerSession.findUnique.mockResolvedValue({
      id: 'session-1',
      trainer: { userId: 'other-trainer-user' },
    });

    await expect(
      service.completeSession('session-1', {
        userId: 'trainer-user-1',
        role: UserRole.TRAINER,
      }),
    ).rejects.toBeInstanceOf(ForbiddenException);
  });

  it('applies member scoping while listing sessions for MEMBER role', async () => {
    prismaMock.member.findUnique.mockResolvedValue({ id: 'member-42' });
    prismaMock.trainerSession.findMany.mockResolvedValue([]);

    await service.listSessions(
      { trainerId: 'trainer-9', upcomingOnly: true },
      { userId: 'member-user-42', role: UserRole.MEMBER },
    );

    expect(prismaMock.trainerSession.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          memberId: 'member-42',
          trainerId: 'trainer-9',
        }),
      }),
    );
  });
});
