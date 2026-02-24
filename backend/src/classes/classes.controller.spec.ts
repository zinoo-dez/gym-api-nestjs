import { BookingStatus } from '@prisma/client';
import { ClassesController } from './classes.controller';

describe('ClassesController booking status', () => {
  const classesServiceMock = {
    updateBookingStatus: jest.fn(),
  } as any;

  const controller = new ClassesController(classesServiceMock);

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('updates booking status to NO_SHOW', async () => {
    classesServiceMock.updateBookingStatus.mockResolvedValue({
      id: 'booking_1',
      memberId: 'member_1',
      classScheduleId: 'schedule_1',
      status: BookingStatus.NO_SHOW,
    });

    const result = await controller.updateBookingStatus('booking_1', {
      status: BookingStatus.NO_SHOW,
    });

    expect(classesServiceMock.updateBookingStatus).toHaveBeenCalledWith(
      'booking_1',
      BookingStatus.NO_SHOW,
    );
    expect(result.status).toBe(BookingStatus.NO_SHOW);
  });
});
