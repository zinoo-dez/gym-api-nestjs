import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import Marketing from "./Marketing";

vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

vi.mock("@/services/marketing.service", () => ({
  marketingService: {
    listTemplates: vi.fn(),
    createTemplate: vi.fn(),
    updateTemplate: vi.fn(),
    listCampaigns: vi.fn(),
    getCampaign: vi.fn(),
    createCampaign: vi.fn(),
    updateCampaign: vi.fn(),
    sendCampaign: vi.fn(),
    getCampaignAnalytics: vi.fn(),
    listAutomations: vi.fn(),
    createAutomation: vi.fn(),
    updateAutomation: vi.fn(),
    runAutomations: vi.fn(),
  },
}));

import { marketingService } from "@/services/marketing.service";

describe("Marketing page", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    vi.mocked(marketingService.listTemplates).mockResolvedValue([
      {
        id: "tpl-1",
        name: "Birthday Template",
        type: "EMAIL",
        category: "MARKETING",
        subject: "Happy Birthday",
        body: "Hi {{firstName}}",
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
          status: "DRAFT",
          audienceType: "INACTIVE_MEMBERS",
          customUserIds: [],
          content: "We miss you",
          recipientsCount: 15,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ],
      page: 1,
      limit: 50,
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

    vi.mocked(marketingService.updateTemplate).mockResolvedValue({ id: "tpl-1" } as any);
    vi.mocked(marketingService.updateCampaign).mockResolvedValue({ id: "camp-1" } as any);
    vi.mocked(marketingService.updateAutomation).mockResolvedValue({ id: "auto-1" } as any);
  });

  it("renders campaigns/templates/automations", async () => {
    render(<Marketing />);

    await waitFor(() => {
      expect(screen.getByText("Marketing")).toBeInTheDocument();
      expect(screen.getByText("Comeback Campaign")).toBeInTheDocument();
      expect(screen.getByText("Birthday Template")).toBeInTheDocument();
      expect(screen.getByText("Birthday Automation")).toBeInTheDocument();
    });

    expect(marketingService.listTemplates).toHaveBeenCalled();
    expect(marketingService.listCampaigns).toHaveBeenCalled();
    expect(marketingService.listAutomations).toHaveBeenCalled();
  });

  it("edits template, campaign, and automation", async () => {
    render(<Marketing />);

    await screen.findByText("Comeback Campaign");

    const editButtons = screen.getAllByRole("button", { name: "Edit" });

    fireEvent.click(editButtons[0]);
    expect(await screen.findByText("Edit Campaign")).toBeInTheDocument();
    fireEvent.change(screen.getByDisplayValue("Comeback Campaign"), {
      target: { value: "Comeback Campaign Updated" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Update Campaign" }));

    await waitFor(() => {
      expect(marketingService.updateCampaign).toHaveBeenCalledWith(
        "camp-1",
        expect.objectContaining({ name: "Comeback Campaign Updated" }),
      );
    });

    fireEvent.click(editButtons[1]);
    expect(await screen.findByText("Edit Template")).toBeInTheDocument();
    fireEvent.change(screen.getByDisplayValue("Birthday Template"), {
      target: { value: "Birthday Template Updated" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Update Template" }));

    await waitFor(() => {
      expect(marketingService.updateTemplate).toHaveBeenCalledWith(
        "tpl-1",
        expect.objectContaining({ name: "Birthday Template Updated" }),
      );
    });

    fireEvent.click(editButtons[2]);
    expect(await screen.findByText("Edit Automation")).toBeInTheDocument();
    fireEvent.change(screen.getByDisplayValue("Birthday Automation"), {
      target: { value: "Birthday Automation Updated" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Update Automation" }));

    await waitFor(() => {
      expect(marketingService.updateAutomation).toHaveBeenCalledWith(
        "auto-1",
        expect.objectContaining({ name: "Birthday Automation Updated" }),
      );
    });
  });
});
