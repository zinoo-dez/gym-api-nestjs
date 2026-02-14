import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import RetentionTasks from "./RetentionTasks";

vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

vi.mock("@/services/retention.service", () => ({
  retentionService: {
    getTasks: vi.fn(),
    updateTask: vi.fn(),
  },
}));

import { retentionService } from "@/services/retention.service";

describe("RetentionTasks", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(retentionService.getTasks).mockResolvedValue({
      data: [
        {
          id: "t-1",
          memberId: "m-1",
          memberName: "Alice Member",
          memberEmail: "alice@gym.com",
          status: "OPEN",
          priority: 1,
          title: "Follow up high-risk member",
          note: "Call this week",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ],
      page: 1,
      limit: 100,
      total: 1,
      totalPages: 1,
    });
    vi.mocked(retentionService.updateTask).mockResolvedValue({
      id: "t-1",
      memberId: "m-1",
      memberName: "Alice Member",
      memberEmail: "alice@gym.com",
      status: "DONE",
      priority: 1,
      title: "Follow up high-risk member",
      note: "Completed call",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
  });

  it("renders task table with loaded data", async () => {
    render(<RetentionTasks />);

    await waitFor(() => {
      expect(screen.getByText("Retention Tasks")).toBeInTheDocument();
      expect(screen.getByText("Alice Member")).toBeInTheDocument();
      expect(screen.getByText("Follow up high-risk member")).toBeInTheDocument();
    });
  });

  it("allows editing note and saving task", async () => {
    render(<RetentionTasks />);

    const noteInput = await screen.findByPlaceholderText("Add note...");
    fireEvent.change(noteInput, { target: { value: "Completed call" } });
    expect(noteInput).toHaveValue("Completed call");

    fireEvent.click(screen.getByRole("button", { name: "Save" }));

    await waitFor(() => {
      expect(retentionService.updateTask).toHaveBeenCalled();
    });
  });
});

