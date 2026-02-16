import { useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { M3KpiCard } from "@/components/ui/m3-kpi-card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  marketingService,
  type CampaignAnalytics,
  type MarketingCampaign,
} from "@/services/marketing.service";
import { RefreshCcw, BarChart3, TrendingUp, Users, CheckCircle2, AlertCircle, Eye, MousePointer2, PieChart } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";

const MarketingAnalytics = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [campaigns, setCampaigns] = useState<MarketingCampaign[]>([]);
  const [selectedCampaignId, setSelectedCampaignId] = useState<string>("");
  const [analytics, setAnalytics] = useState<CampaignAnalytics | null>(null);

  const selectedCampaignName = useMemo(() => {
    return campaigns.find((campaign) => campaign.id === selectedCampaignId)?.name || "";
  }, [campaigns, selectedCampaignId]);

  const loadCampaigns = useCallback(async () => {
    setLoading(true);
    try {
      const campaignsResponse = await marketingService.listCampaigns({ limit: 100 });
      const rows = Array.isArray(campaignsResponse?.data) ? campaignsResponse.data : [];
      setCampaigns(rows);

      const requestedCampaignId = searchParams.get("campaignId") || "";
      const targetCampaignId = rows.some((row) => row.id === requestedCampaignId)
        ? requestedCampaignId
        : rows[0]?.id || "";

      setSelectedCampaignId(targetCampaignId);
    } catch (error) {
      console.error(error);
      toast.error("Failed to load campaigns");
      setCampaigns([]);
      setSelectedCampaignId("");
    } finally {
      setLoading(false);
    }
  }, [searchParams]);

  const loadAnalytics = useCallback(async (campaignId: string) => {
    if (!campaignId) {
      setAnalytics(null);
      return;
    }

    try {
      const result = await marketingService.getCampaignAnalytics(campaignId);
      setAnalytics(result);
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to load analytics");
      setAnalytics(null);
    }
  }, []);

  useEffect(() => {
    loadCampaigns();
  }, [loadCampaigns]);

  useEffect(() => {
    loadAnalytics(selectedCampaignId);
    if (selectedCampaignId) {
      setSearchParams({ campaignId: selectedCampaignId });
    }
  }, [loadAnalytics, selectedCampaignId, setSearchParams]);

  return (
    <div className="space-y-4">
      {/* Header section */}
      <section className="rounded-2xl border border-gray-200 bg-white p-4">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h1 className="m3-title-md">Campaign Performance Metrics</h1>
            <p className="text-sm text-muted-foreground">
              Analyze outreach efficiency, engagement rates, and delivery success for specific batches.
            </p>
          </div>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              onClick={() => loadCampaigns()} 
              disabled={loading}
              className="h-10 rounded-xl border-gray-200 font-bold font-mono text-xs hover:bg-gray-50"
            >
              <RefreshCcw className={cn("h-4 w-4 mr-2", loading && "animate-spin")} />
              Sync Campaigns
            </Button>
            <Button 
              onClick={() => loadAnalytics(selectedCampaignId)} 
              disabled={!selectedCampaignId}
              className="h-10 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold font-mono text-xs shadow-lg shadow-blue-100 transition-all active:scale-95"
            >
              Recalculate Insight
            </Button>
          </div>
        </div>
      </section>

      {/* Campaign Selection */}
      <section className="rounded-2xl border border-gray-200 bg-white p-5">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 rounded-xl bg-blue-50">
            <BarChart3 className="h-5 w-5 text-blue-600" />
          </div>
          <div>
            <h2 className="m3-title-md">Analysis Subject</h2>
            <p className="text-xs text-muted-foreground">Select an execution batch from your campaign archives.</p>
          </div>
        </div>
        
        <div className="space-y-2">
          <Label className="m3-label">Campaign Archive</Label>
          <Select value={selectedCampaignId} onValueChange={setSelectedCampaignId}>
            <SelectTrigger className="h-12 max-w-xl rounded-xl border-gray-100 bg-gray-50/50 focus:ring-blue-600 font-medium">
              <SelectValue placeholder="Begin analysis by choosing a campaign..." />
            </SelectTrigger>
            <SelectContent className="rounded-xl border-gray-200 shadow-xl">
              {campaigns.map((campaign) => (
                <SelectItem key={campaign.id} value={campaign.id} className="rounded-lg">
                  {campaign.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </section>

      {!selectedCampaignId ? (
        <section className="py-20 text-center rounded-2xl border-2 border-dashed border-gray-100 bg-white/50">
          <TrendingUp className="h-12 w-12 mb-3 mx-auto text-gray-100" />
          <p className="font-medium text-gray-400">Select a campaign to initialize analytics workbench.</p>
        </section>
      ) : !analytics ? (
        <section className="py-20 text-center rounded-2xl border-2 border-dashed border-gray-100 bg-white/50">
          <RefreshCcw className="h-12 w-12 mb-3 mx-auto text-blue-100 animate-spin" />
          <p className="font-medium text-gray-400 italic">Assembling data points for {selectedCampaignName}...</p>
        </section>
      ) : (
        <>
          {/* Main Performance Grid */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-4">
            <M3KpiCard title="Engagement Population" value={analytics.totalRecipients} tone="primary" icon={Users} />
            <M3KpiCard title="Successful Delivery" value={analytics.deliveredCount} tone="success" icon={CheckCircle2} />
            <M3KpiCard title="Transmission Errors" value={analytics.failedCount} tone="danger" icon={AlertCircle} />
            <M3KpiCard 
              title="Operational Success" 
              value={`${analytics.totalRecipients > 0 ? Math.round((analytics.deliveredCount / analytics.totalRecipients) * 100) : 0}%`} 
              tone="success" 
              icon={TrendingUp}
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <M3KpiCard title="Content Interactions" value={analytics.clickedCount} tone="primary" icon={MousePointer2} />
            <M3KpiCard title="Total Impressions" value={analytics.openedCount} tone="primary" icon={Eye} />
            <M3KpiCard title="Interaction Rate" value={`${analytics.clickRate}%`} tone="primary" icon={TrendingUp} />
            <M3KpiCard title="View Rate" value={`${analytics.openRate}%`} tone="primary" icon={Eye} />
          </div>

          {/* Performance Insight Summary */}
          <section className="rounded-2xl border border-gray-200 bg-white p-6">
            <div className="flex items-center gap-3 mb-8">
              <div className="p-2 rounded-xl bg-purple-50">
                <PieChart className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <h2 className="m3-title-md">Campaign Health Summary</h2>
                <div className="flex items-center gap-2 mt-0.5">
                  <Badge variant="outline" className="m3-label !normal-case tracking-normal bg-muted/50 border-border">
                    {selectedCampaignName}
                  </Badge>
                </div>
              </div>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
              <div className="space-y-4 p-5 rounded-2xl bg-gray-50/50 border border-gray-100">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest text-center">Open Effectiveness</p>
                <div className="flex flex-col items-center">
                  <span className="text-4xl font-bold font-mono tracking-tighter text-blue-600">{analytics.openRate}%</span>
                  <div className="w-full h-1.5 bg-gray-100 rounded-full mt-4 overflow-hidden">
                    <div className="h-full bg-blue-500 rounded-full" style={{ width: `${analytics.openRate}%` }} />
                  </div>
                  <p className="text-[10px] text-gray-400 mt-2 italic font-medium">Recipient view frequency</p>
                </div>
              </div>

              <div className="space-y-4 p-5 rounded-2xl bg-gray-50/50 border border-gray-100">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest text-center">Click-Through Efficiency</p>
                <div className="flex flex-col items-center">
                  <span className="text-4xl font-bold font-mono tracking-tighter text-emerald-600">{analytics.clickRate}%</span>
                  <div className="w-full h-1.5 bg-gray-100 rounded-full mt-4 overflow-hidden">
                    <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${analytics.clickRate}%` }} />
                  </div>
                  <p className="text-[10px] text-gray-400 mt-2 italic font-medium">Link interaction frequency</p>
                </div>
              </div>

              <div className="space-y-4 p-5 rounded-2xl bg-gray-50/50 border border-gray-100">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest text-center">Reliability Score</p>
                <div className="flex flex-col items-center">
                  <span className="text-4xl font-bold font-mono tracking-tighter text-orange-600">
                    {analytics.totalRecipients > 0 ? Math.round((analytics.deliveredCount / analytics.totalRecipients) * 100) : 0}%
                  </span>
                  <div className="w-full h-1.5 bg-gray-100 rounded-full mt-4 overflow-hidden">
                    <div className="h-full bg-orange-500 rounded-full" style={{ 
                      width: `${analytics.totalRecipients > 0 ? Math.round((analytics.deliveredCount / analytics.totalRecipients) * 100) : 0}%` 
                    }} />
                  </div>
                  <p className="text-[10px] text-gray-400 mt-2 italic font-medium">Infrastructure success rate</p>
                </div>
              </div>
            </div>
          </section>
        </>
      )}
    </div>
  );
};

export default MarketingAnalytics;
