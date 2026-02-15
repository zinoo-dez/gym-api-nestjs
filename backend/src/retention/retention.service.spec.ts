import { RetentionService } from './retention.service';
import { BadRequestException } from '@nestjs/common';

describe('RetentionService scoring rules', () => {
  let service: RetentionService;

  beforeEach(() => {
    const prismaMock = {} as any;
    const notificationsMock = {} as any;
    service = new RetentionService(prismaMock, notificationsMock);
  });

  it('marks member MEDIUM when no check-in history only', () => {
    const snapshot = (service as any).buildSnapshot({
      memberId: 'm-1',
      firstName: 'Alice',
      lastName: 'Member',
      email: 'alice@gym.com',
      unpaidPendingCount: 0,
      hasRecentRejectedPayment: false,
    });

    expect(snapshot.riskLevel).toBe('MEDIUM');
    expect(snapshot.score).toBe(50);
    expect(snapshot.reasons).toContain('NO_CHECKIN_HISTORY');
  });

  it('marks member LOW with recent check-in and healthy billing', () => {
    const snapshot = (service as any).buildSnapshot({
      memberId: 'm-2',
      firstName: 'Bob',
      lastName: 'Member',
      email: 'bob@gym.com',
      lastCheckInAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      subscriptionEndsAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      unpaidPendingCount: 0,
      hasRecentRejectedPayment: false,
    });

    expect(snapshot.riskLevel).toBe('LOW');
    expect(snapshot.score).toBe(0);
    expect(snapshot.reasons).toHaveLength(0);
  });

  it('caps score at 100 and marks HIGH for multiple churn signals', () => {
    const snapshot = (service as any).buildSnapshot({
      memberId: 'm-3',
      firstName: 'Cathy',
      lastName: 'Member',
      email: 'cathy@gym.com',
      lastCheckInAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000),
      subscriptionEndsAt: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
      unpaidPendingCount: 2,
      hasRecentRejectedPayment: true,
    });

    expect(snapshot.riskLevel).toBe('HIGH');
    expect(snapshot.score).toBe(100);
    expect(snapshot.reasons).toEqual(
      expect.arrayContaining([
        'NO_CHECKIN_14_DAYS',
        'SUBSCRIPTION_ENDING_7_DAYS',
        'HAS_PENDING_PAYMENTS',
        'RECENT_REJECTED_PAYMENT',
      ]),
    );
  });
});

describe('RetentionService task management', () => {
  let prismaMock: any;
  let notificationsMock: any;
  let service: RetentionService;

  beforeEach(() => {
    prismaMock = {
      user: {
        findUnique: jest.fn(),
        findMany: jest.fn().mockResolvedValue([]),
      },
      retentionTask: {
        count: jest.fn(),
        findMany: jest.fn(),
        findUnique: jest.fn(),
        findFirst: jest.fn(),
        update: jest.fn(),
        groupBy: jest.fn().mockResolvedValue([]),
        updateMany: jest.fn(),
        create: jest.fn(),
      },
      retentionTaskHistory: {
        create: jest.fn(),
        createMany: jest.fn(),
      },
    };
    notificationsMock = {
      createForRole: jest.fn(),
    };
    service = new RetentionService(prismaMock, notificationsMock);
  });

  it('applies memberId when filtering tasks', async () => {
    prismaMock.retentionTask.count.mockResolvedValue(1);
    prismaMock.retentionTask.findMany.mockResolvedValue([
      {
        id: 't-1',
        memberId: 'm-1',
        status: 'OPEN',
        priority: 1,
        title: 'Follow up',
        note: null,
        dueDate: null,
        resolvedAt: null,
        createdAt: new Date('2026-02-01T00:00:00.000Z'),
        updatedAt: new Date('2026-02-01T00:00:00.000Z'),
        assignedTo: null,
        member: {
          id: 'm-1',
          user: {
            firstName: 'Alice',
            lastName: 'Member',
            email: 'alice@gym.com',
          },
        },
      },
    ]);

    await service.getTasks({ memberId: 'm-1' });

    expect(prismaMock.retentionTask.count).toHaveBeenCalledWith({
      where: { memberId: 'm-1' },
    });
    expect(prismaMock.retentionTask.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { memberId: 'm-1' },
      }),
    );
  });

  it('does not create follow-up task when open task already exists', async () => {
    prismaMock.retentionTask.findFirst.mockResolvedValueOnce({ id: 't-open' });

    await (service as any).ensureFollowUpTask('m-1', 'Alice Member');

    expect(prismaMock.retentionTask.create).not.toHaveBeenCalled();
    expect(notificationsMock.createForRole).not.toHaveBeenCalled();
  });

  it('does not create follow-up task when a recent resolved task exists', async () => {
    prismaMock.retentionTask.findFirst
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce({ id: 't-done' });

    await (service as any).ensureFollowUpTask('m-1', 'Alice Member');

    expect(prismaMock.retentionTask.create).not.toHaveBeenCalled();
    expect(notificationsMock.createForRole).not.toHaveBeenCalled();
  });

  it('creates follow-up task when no open task and no recent resolved task', async () => {
    prismaMock.retentionTask.findFirst
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce(null);
    prismaMock.retentionTask.create.mockResolvedValue({ id: 't-new' });

    await (service as any).ensureFollowUpTask('m-1', 'Alice Member');

    expect(prismaMock.retentionTask.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          memberId: 'm-1',
          status: 'OPEN',
          priority: 1,
          title: 'Follow up high-risk member',
        }),
      }),
    );
    expect(notificationsMock.createForRole).toHaveBeenCalled();
  });

  it('auto-assigns follow-up task to active staff/admin with lowest open workload', async () => {
    prismaMock.retentionTask.findFirst
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce(null);
    prismaMock.user.findMany.mockResolvedValue([
      { id: 'admin-1', createdAt: new Date('2025-01-01T00:00:00.000Z') },
      { id: 'staff-1', createdAt: new Date('2025-02-01T00:00:00.000Z') },
    ]);
    prismaMock.retentionTask.groupBy.mockResolvedValue([
      { assignedToId: 'admin-1', _count: { _all: 3 } },
      { assignedToId: 'staff-1', _count: { _all: 1 } },
    ]);
    prismaMock.retentionTask.create.mockResolvedValue({ id: 't-new' });

    await (service as any).ensureFollowUpTask('m-1', 'Alice Member');

    expect(prismaMock.retentionTask.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          memberId: 'm-1',
          assignedToId: 'staff-1',
        }),
      }),
    );
  });

  it('bulk updates tasks with completed status and returns updated count', async () => {
    prismaMock.retentionTask.findMany.mockResolvedValue([
      {
        id: 't-1',
        status: 'OPEN',
        priority: 2,
        assignedToId: null,
        note: null,
        dueDate: null,
      },
      {
        id: 't-2',
        status: 'IN_PROGRESS',
        priority: 1,
        assignedToId: 'staff-1',
        note: 'follow up',
        dueDate: new Date('2026-02-20T00:00:00.000Z'),
      },
    ]);
    prismaMock.retentionTask.updateMany.mockResolvedValue({ count: 2 });

    const result = await service.bulkUpdateTasks({
      taskIds: ['t-1', 't-2'],
      status: 'DONE',
    });

    expect(prismaMock.retentionTask.updateMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: { in: ['t-1', 't-2'] } },
        data: expect.objectContaining({
          status: 'DONE',
          resolvedAt: expect.any(Date),
        }),
      }),
    );
    expect(prismaMock.retentionTaskHistory.createMany).toHaveBeenCalled();
    expect(notificationsMock.createForRole).toHaveBeenCalled();
    expect(result).toEqual({ updatedCount: 2 });
  });

  it('rejects bulk updates when no mutable field is provided', async () => {
    await expect(
      service.bulkUpdateTasks({
        taskIds: ['t-1'],
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });
});
