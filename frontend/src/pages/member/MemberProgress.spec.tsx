import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import MemberProgress from "./MemberProgress";

vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

vi.mock("@/services/trainer-sessions.service", () => ({
  trainerSessionsService: {
    getAll: vi.fn(),
    getMyProgress: vi.fn(),
  },
}));

import { trainerSessionsService } from "@/services/trainer-sessions.service";

describe("MemberProgress", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(trainerSessionsService.getAll).mockResolvedValue([
      {
        id: "s-1",
        memberId: "m-1",
        trainerId: "t-1",
        sessionDate: "2026-02-22T09:00:00.000Z",
        duration: 60,
        title: "Strength Basics",
        rate: 20000,
        status: "SCHEDULED",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: "s-2",
        memberId: "m-1",
        trainerId: "t-1",
        sessionDate: "2026-02-10T09:00:00.000Z",
        duration: 60,
        title: "Mobility Training",
        rate: 20000,
        status: "COMPLETED",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ] as any);
    vi.mocked(trainerSessionsService.getMyProgress).mockResolvedValue([
      {
        id: "p-1",
        recordedAt: "2026-02-10T10:00:00.000Z",
        weight: 72,
        bmi: 22.1,
      },
    ] as any);
  });

  it("renders summary cards and progress timeline", async () => {
    render(<MemberProgress />);

    await waitFor(() => {
      expect(screen.getByText("Trainer Sessions & Progress")).toBeInTheDocument();
      expect(screen.getByText("Strength Basics")).toBeInTheDocument();
      expect(screen.getByText("Progress Timeline")).toBeInTheDocument();
      expect(screen.getByText("Weight: 72")).toBeInTheDocument();
    });
  });

  it("filters session list by title", async () => {
    render(<MemberProgress />);

    await screen.findByText("Strength Basics");
    const filter = screen.getByPlaceholderText("Filter by title...");
    fireEvent.change(filter, { target: { value: "mobility" } });

    expect(screen.queryByText("Strength Basics")).not.toBeInTheDocument();
    expect(screen.getByText("Mobility Training")).toBeInTheDocument();
  });
});
