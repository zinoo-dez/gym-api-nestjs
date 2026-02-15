import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import TrainerSessions from "./TrainerSessions";

vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

vi.mock("@/services/trainer-sessions.service", () => ({
  trainerSessionsService: {
    getAll: vi.fn(),
    getBookableMembers: vi.fn(),
    create: vi.fn(),
    complete: vi.fn(),
    recordProgress: vi.fn(),
  },
}));

import { trainerSessionsService } from "@/services/trainer-sessions.service";

describe("TrainerSessions", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    vi.mocked(trainerSessionsService.getBookableMembers).mockResolvedValue([
        { id: "m-1", firstName: "Alice", lastName: "Member" },
        { id: "m-2", firstName: "Bob", lastName: "Client" },
    ] as any);

    vi.mocked(trainerSessionsService.getAll).mockResolvedValue([
      {
        id: "s-1",
        memberId: "m-1",
        trainerId: "t-1",
        sessionDate: "2026-02-20T10:00:00.000Z",
        duration: 60,
        title: "Strength Session",
        rate: 25000,
        status: "SCHEDULED",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        member: { user: { firstName: "Alice", lastName: "Member" } },
      },
      {
        id: "s-2",
        memberId: "m-2",
        trainerId: "t-1",
        sessionDate: "2026-02-21T11:00:00.000Z",
        duration: 45,
        title: "Cardio Session",
        rate: 20000,
        status: "COMPLETED",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        member: { user: { firstName: "Bob", lastName: "Client" } },
      },
    ] as any);

    vi.mocked(trainerSessionsService.complete).mockResolvedValue({
      id: "s-1",
      status: "COMPLETED",
    } as any);
  });

  it("renders session list and filters by title", async () => {
    render(<TrainerSessions />);

    await waitFor(() => {
      expect(screen.getByText("Trainer Sessions")).toBeInTheDocument();
      expect(screen.getByText("Strength Session")).toBeInTheDocument();
      expect(screen.getByText("Cardio Session")).toBeInTheDocument();
    });

    const filter = screen.getByPlaceholderText("Filter by title or member...");
    fireEvent.change(filter, { target: { value: "cardio" } });

    expect(screen.queryByText("Strength Session")).not.toBeInTheDocument();
    expect(screen.getByText("Cardio Session")).toBeInTheDocument();
  });

  it("marks a scheduled session complete", async () => {
    render(<TrainerSessions />);

    const completeButton = await screen.findByRole("button", {
      name: "Mark Complete",
    });
    fireEvent.click(completeButton);

    await waitFor(() => {
      expect(trainerSessionsService.complete).toHaveBeenCalledWith("s-1");
    });
  });
});
