import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { M3KpiCard } from "@/components/ui/m3-kpi-card";
import { marketingService, type MarketingCampaignStatus } from "@/services/marketing.service";
import { BarChart3, Layers, Megaphone, RefreshCcw, Workflow, ArrowRight, Sparkles, Send, Calendar, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

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
    <div className="space-y-4">
      {/* Header section */}
      <section className="rounded-2xl border border-border bg-card p-4">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h1 className="m3-title-md">Marketing Ecosystem</h1>
            <p className="text-sm text-muted-foreground">
              Manage multi-channel outreach, content templates, and automated workflows.
            </p>
          </div>
          <Button 
            variant="outline" 
            onClick={loadSummary} 
            disabled={loading}
            className="h-10 rounded-xl border-border px-4 font-semibold text-xs transition-all"
          >
            <RefreshCcw className={cn("h-4 w-4 mr-2", loading && "animate-spin")} />
            Sync Dashboard
          </Button>
        </div>
      </section>

      {/* Navigation Grid */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <div 
              key={card.title}
              onClick={card.action}
              className="group relative overflow-hidden rounded-2xl border border-border bg-card p-6 hover:border-blue-200 hover:shadow-xl hover:shadow-blue-50/50 transition-all cursor-pointer active:scale-95"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="p-2.5 rounded-xl bg-muted group-hover:bg-blue-50 text-muted-foreground group-hover:text-blue-600 transition-colors">
                  <Icon className="h-6 w-6" />
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground/70 group-hover:text-blue-400 transform group-hover:translate-x-1 transition-all" />
              </div>
              
              <div className="space-y-1">
                <h3 className="m3-title-md">{card.title}</h3>
                <div className="flex items-end justify-between">
                  <span className="text-3xl font-bold tracking-tighter text-foreground">
                    {card.value}
                  </span>
                  <span className="m3-label !text-[9px]">
                    Tracked Units
                  </span>
                </div>
                <p className="text-xs text-muted-foreground font-medium pt-1">
                  {card.subtitle}
                </p>
              </div>

              {/* Decorative gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/0 via-blue-500/0 to-blue-500/0 group-hover:to-blue-500/5 transition-colors pointer-events-none" />
            </div>
          );
        })}
      </div>

      {/* Campaign Statistics Group */}
      <section className="rounded-2xl border border-border bg-card p-6">
        <div className="flex items-center gap-3 mb-8">
          <div className="p-2 rounded-xl bg-purple-50">
            <Sparkles className="h-5 w-5 text-purple-600" />
          </div>
          <div>
            <h2 className="m3-title-md">Campaign Execution Pipeline</h2>
            <p className="text-xs text-muted-foreground">Real-time status breakdown of communication batches.</p>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <div className="p-4 rounded-xl bg-muted/50 border border-border flex items-center gap-4">
            <div className="p-2 rounded-lg bg-card shadow-sm">
              <Layers className="h-5 w-5 text-muted-foreground" />
            </div>
            <div>
              <p className="m3-label !text-[9px]">Drafts</p>
              <p className="text-xl font-bold text-foreground">{statusCounts.DRAFT}</p>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-orange-50/50 border border-orange-100 flex items-center gap-4">
            <div className="p-2 rounded-lg bg-card shadow-sm">
              <Calendar className="h-5 w-5 text-orange-500" />
            </div>
            <div>
              <p className="m3-label !text-[9px] !text-orange-400">Scheduled</p>
              <p className="text-xl font-bold font-mono text-orange-900">{statusCounts.SCHEDULED}</p>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-emerald-50/50 border border-emerald-100 flex items-center gap-4">
            <div className="p-2 rounded-lg bg-card shadow-sm">
              <Send className="h-5 w-5 text-emerald-500" />
            </div>
            <div>
              <p className="m3-label !text-[9px] !text-emerald-400">Successful</p>
              <p className="text-xl font-bold text-foreground">{statusCounts.SENT}</p>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-red-50/50 border border-red-100 flex items-center gap-4">
            <div className="p-2 rounded-lg bg-card shadow-sm">
              <AlertCircle className="h-5 w-5 text-red-500" />
            </div>
            <div>
              <p className="m3-label !text-[9px] !text-red-400">Failed</p>
              <p className="text-xl font-bold text-foreground">{statusCounts.FAILED}</p>
            </div>
          </div>
        </div>

        {/* Informational footer inside the section */}
        <div className="mt-8 pt-6 border-t border-border flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="h-6 rounded-lg bg-blue-50 border-blue-100 text-blue-600 text-[10px] font-bold uppercase tracking-tight">
              Dynamic Auto-Sync
            </Badge>
            <span className="text-[10px] text-muted-foreground font-medium">Pipeline updates automatically every session reload.</span>
          </div>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => navigate("/admin/marketing/analytics")}
            className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-xl font-bold text-xs"
          >
            Detailed Analytics Report
            <ArrowRight className="ml-1.5 h-3 w-3" />
          </Button>
        </div>
      </section>
    </div>
  );
};

export default Marketing;
