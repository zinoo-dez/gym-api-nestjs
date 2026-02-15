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
import { RefreshCcw } from "lucide-react";
import { toast } from "sonner";

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
    <div className="m3-admin-page">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Campaign Analytics</h1>
          <p className="text-muted-foreground">
            View delivery and engagement performance for each campaign.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => loadCampaigns()} disabled={loading}>
            <RefreshCcw className="h-4 w-4 mr-2" />
            Refresh Campaigns
          </Button>
          <Button onClick={() => loadAnalytics(selectedCampaignId)} disabled={!selectedCampaignId}>
            Refresh Analytics
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Select Campaign</CardTitle>
        </CardHeader>
        <CardContent>
          <Select value={selectedCampaignId} onValueChange={setSelectedCampaignId}>
            <SelectTrigger className="max-w-xl">
              <SelectValue placeholder="Choose campaign" />
            </SelectTrigger>
            <SelectContent>
              {campaigns.map((campaign) => (
                <SelectItem key={campaign.id} value={campaign.id}>
                  {campaign.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {!selectedCampaignId ? (
        <Card>
          <CardContent className="p-6 text-muted-foreground">
            No campaigns available.
          </CardContent>
        </Card>
      ) : !analytics ? (
        <Card>
          <CardContent className="p-6 text-muted-foreground">
            Select a campaign to load analytics.
          </CardContent>
        </Card>
      ) : (
        <>
          <Card>
            <CardHeader>
              <CardTitle>
                {selectedCampaignName || "Campaign"} Performance
              </CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <M3KpiCard title="Recipients" value={analytics.totalRecipients} tone="primary" />
              <M3KpiCard title="Delivered" value={analytics.deliveredCount} tone="success" />
              <M3KpiCard title="Failed" value={analytics.failedCount} tone="danger" />
              <M3KpiCard title="Opened" value={analytics.openedCount} tone="neutral" />
              <M3KpiCard title="Clicked" value={analytics.clickedCount} tone="neutral" />
              <M3KpiCard title="Open Rate" value={`${analytics.openRate}%`} tone="primary" />
              <M3KpiCard title="Click Rate" value={`${analytics.clickRate}%`} tone="primary" />
              <M3KpiCard
                title="Delivery Rate"
                value={`${
                  analytics.totalRecipients > 0
                    ? Math.round((analytics.deliveredCount / analytics.totalRecipients) * 100)
                    : 0
                }%`}
                tone="success"
              />
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
};

export default MarketingAnalytics;
