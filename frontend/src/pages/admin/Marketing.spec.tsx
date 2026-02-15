import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import Marketing from "./Marketing";

const navigateMock = vi.fn();

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual<typeof import("react-router-dom")>("react-router-dom");
  return {
    ...actual,
    useNavigate: () => navigateMock,
  };
});

vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

vi.mock("@/services/marketing.service", () => ({
  marketingService: {
    listTemplates: vi.fn(),
    listCampaigns: vi.fn(),
    listAutomations: vi.fn(),
  },
}));

import { marketingService } from "@/services/marketing.service";

describe("Marketing dashboard", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    vi.mocked(marketingService.listTemplates).mockResolvedValue([
      {
        id: "tpl-1",
        name: "Birthday Template",
        type: "EMAIL",
        category: "MARKETING",
        body: "Hi",
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ] as any);

    vi.mocked(marketingService.listCampaigns).mockResolvedValue({
      data: [
        {
          id: "camp-1",
          name: "Comeback Campaign",
          description: "Bring inactive members back",
          type: "EMAIL",
          category: "MARKETING",
          status: "SCHEDULED",
          audienceType: "INACTIVE_MEMBERS",
          customUserIds: [],
          content: "We miss you",
          recipientsCount: 15,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ],
      page: 1,
      limit: 100,
      total: 1,
      totalPages: 1,
    } as any);

    vi.mocked(marketingService.listAutomations).mockResolvedValue([
      {
        id: "auto-1",
        type: "BIRTHDAY_WISHES",
        name: "Birthday Automation",
        isActive: true,
        channel: "EMAIL",
        content: "Happy birthday",
        inactiveDays: 30,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ] as any);
  });

  it("renders marketing dashboard summary", async () => {
    render(
      <MemoryRouter>
        <Marketing />
      </MemoryRouter>,
    );

    await waitFor(() => {
      expect(screen.getByText("Marketing Dashboard")).toBeInTheDocument();
      expect(screen.getByText("Campaigns")).toBeInTheDocument();
      expect(screen.getByText("Templates")).toBeInTheDocument();
      expect(screen.getByText("Automations")).toBeInTheDocument();
      expect(screen.getByText("Analytics")).toBeInTheDocument();
    });

    expect(marketingService.listTemplates).toHaveBeenCalled();
    expect(marketingService.listCampaigns).toHaveBeenCalled();
    expect(marketingService.listAutomations).toHaveBeenCalled();
  });

  it("navigates to campaigns page from quick action", async () => {
    render(
      <MemoryRouter>
        <Marketing />
      </MemoryRouter>,
    );

    await screen.findByText("Manage Campaigns");
    fireEvent.click(screen.getByRole("button", { name: "Manage Campaigns" }));

    expect(navigateMock).toHaveBeenCalledWith("/admin/marketing/campaigns");
  });
});
