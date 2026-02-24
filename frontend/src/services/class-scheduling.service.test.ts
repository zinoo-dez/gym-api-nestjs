import { beforeEach, describe, expect, it, vi } from "vitest";
import { classSchedulingService } from "@/services/class-scheduling.service";
import api from "@/services/api";

vi.mock("@/services/api", () => ({
  default: {
    post: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
    get: vi.fn(),
  },
}));

describe("classSchedulingService.updateAttendanceStatus", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("marks NO_SHOW via booking status endpoint", async () => {
    vi.mocked(api.patch).mockResolvedValue({ data: {} } as any);

    await classSchedulingService.updateAttendanceStatus({
      classId: "class_1",
      memberId: "member_1",
      bookingId: "booking_1",
      status: "NO_SHOW",
    });

    expect(api.patch).toHaveBeenCalledWith("/classes/bookings/booking_1/status", {
      status: "NO_SHOW",
    });
  });

  it("throws when NO_SHOW has no booking id", async () => {
    await expect(
      classSchedulingService.updateAttendanceStatus({
        classId: "class_1",
        memberId: "member_1",
        status: "NO_SHOW",
      }),
    ).rejects.toThrow("No booking record found for member.");
  });
});
