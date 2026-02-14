import { RetentionService } from './retention.service';

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
