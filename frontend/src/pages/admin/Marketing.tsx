import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { marketingService, type MarketingCampaignStatus } from "@/services/marketing.service";
import { BarChart3, Layers, Megaphone, RefreshCcw, Workflow } from "lucide-react";
import { toast } from "sonner";

const Marketing = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [campaignStatuses, setCampaignStatuses] = useState<MarketingCampaignStatus[]>([]);
  const [campaignCount, setCampaignCount] = useState(0);
  const [templateCount, setTemplateCount] = useState(0);
  const [automationCount, setAutomationCount] = useState(0);
  const [activeAutomationCount, setActiveAutomationCount] = useState(0);

  const loadSummary = useCallback(async () => {
    setLoading(true);
    try {
      const [templates, campaignsResponse, automations] = await Promise.all([
        marketingService.listTemplates(),
        marketingService.listCampaigns({ limit: 100 }),
        marketingService.listAutomations(),
      ]);

      const campaigns = Array.isArray(campaignsResponse?.data)
        ? campaignsResponse.data
        : [];
      const automationsRows = Array.isArray(automations) ? automations : [];

      setCampaignStatuses(campaigns.map((campaign) => campaign.status));
      setCampaignCount(campaigns.length);
      setTemplateCount(Array.isArray(templates) ? templates.length : 0);
      setAutomationCount(automationsRows.length);
      setActiveAutomationCount(automationsRows.filter((row) => row.isActive).length);
    } catch (error) {
      console.error(error);
      toast.error("Failed to load marketing summary");
      setCampaignStatuses([]);
      setCampaignCount(0);
      setTemplateCount(0);
      setAutomationCount(0);
      setActiveAutomationCount(0);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSummary();
  }, [loadSummary]);

  const statusCounts = useMemo(() => {
    const initial: Record<MarketingCampaignStatus, number> = {
      DRAFT: 0,
      SCHEDULED: 0,
      SENDING: 0,
      SENT: 0,
      PARTIAL: 0,
      FAILED: 0,
      CANCELLED: 0,
    };

    for (const status of campaignStatuses) {
      initial[status] += 1;
    }

    return initial;
  }, [campaignStatuses]);

  const cards = [
    {
      title: "Campaigns",
      value: campaignCount,
      subtitle: `${statusCounts.SCHEDULED} scheduled`,
      icon: Megaphone,
      action: () => navigate("/admin/marketing/campaigns"),
      actionLabel: "Manage Campaigns",
    },
    {
      title: "Templates",
      value: templateCount,
      subtitle: "Reusable content library",
      icon: Layers,
      action: () => navigate("/admin/marketing/templates"),
      actionLabel: "Manage Templates",
    },
    {
      title: "Automations",
      value: automationCount,
      subtitle: `${activeAutomationCount} active`,
      icon: Workflow,
      action: () => navigate("/admin/marketing/automations"),
      actionLabel: "Manage Automations",
    },
    {
      title: "Analytics",
      value: statusCounts.SENT + statusCounts.PARTIAL,
      subtitle: "Sent campaigns",
      icon: BarChart3,
      action: () => navigate("/admin/marketing/analytics"),
      actionLabel: "View Analytics",
    },
  ];

  return (
    <div className="space-y-6 px-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Marketing Dashboard</h1>
          <p className="text-muted-foreground">
            Navigate to campaigns, templates, automations, and analytics modules.
          </p>
        </div>
        <Button variant="outline" onClick={loadSummary} disabled={loading}>
          <RefreshCcw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map((card) => (
          <Card key={card.title}>
            <CardContent className="p-6 space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">{card.title}</p>
                <card.icon className="h-4 w-4 text-muted-foreground" />
              </div>
              <p className="text-2xl font-bold">{card.value}</p>
              <p className="text-xs text-muted-foreground">{card.subtitle}</p>
              <Button size="sm" variant="outline" onClick={card.action}>
                {card.actionLabel}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold">Campaign Pipeline</h2>
        </CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <PipelineStat label="Draft" value={statusCounts.DRAFT} />
          <PipelineStat label="Scheduled" value={statusCounts.SCHEDULED} />
          <PipelineStat label="Sent" value={statusCounts.SENT} />
          <PipelineStat label="Failed" value={statusCounts.FAILED} />
        </CardContent>
      </Card>
    </div>
  );
};

const PipelineStat = ({ label, value }: { label: string; value: number }) => (
  <div className="rounded-lg border p-4">
    <p className="text-xs text-muted-foreground">{label}</p>
    <p className="text-xl font-semibold">{value}</p>
  </div>
);

export default Marketing;
