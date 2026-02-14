import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import RetentionDashboard from "./RetentionDashboard";

vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

vi.mock("@/services/retention.service", () => ({
  retentionService: {
    getOverview: vi.fn(),
    getMembers: vi.fn(),
    recalculate: vi.fn(),
  },
}));

import { retentionService } from "@/services/retention.service";

describe("RetentionDashboard", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(retentionService.getOverview).mockResolvedValue({
      highRisk: 2,
      mediumRisk: 3,
      lowRisk: 5,
      newHighThisWeek: 1,
      openTasks: 4,
      evaluatedMembers: 10,
    });
    vi.mocked(retentionService.getMembers).mockResolvedValue({
      data: [
        {
          memberId: "m-1",
          fullName: "Alice Member",
          email: "alice@gym.com",
          riskLevel: "HIGH",
          score: 75,
          reasons: ["NO_CHECKIN_14_DAYS"],
          unpaidPendingCount: 1,
          lastEvaluatedAt: new Date().toISOString(),
        },
      ],
      page: 1,
      limit: 50,
      total: 1,
      totalPages: 1,
    });
  });

  it("renders retention metrics and members table", async () => {
    render(<RetentionDashboard />);

    await waitFor(() => {
      expect(screen.getByText("Retention Dashboard")).toBeInTheDocument();
      expect(screen.getByText("Alice Member")).toBeInTheDocument();
    });

    expect(screen.getByText("High Risk")).toBeInTheDocument();
    expect(screen.getByText("Evaluated Members")).toBeInTheDocument();
    expect(retentionService.getOverview).toHaveBeenCalled();
    expect(retentionService.getMembers).toHaveBeenCalled();
  });

  it("updates text filters and refreshes", async () => {
    render(<RetentionDashboard />);

    const searchInput = await screen.findByPlaceholderText("Search member...");
    const minScoreInput = screen.getByPlaceholderText("Min score");

    fireEvent.change(searchInput, { target: { value: "alice" } });
    fireEvent.change(minScoreInput, { target: { value: "60" } });

    expect(searchInput).toHaveValue("alice");
    expect(minScoreInput).toHaveValue(60);

    fireEvent.click(screen.getByRole("button", { name: "Refresh" }));

    await waitFor(() => {
      expect(retentionService.getMembers).toHaveBeenCalled();
    });
  });
});

