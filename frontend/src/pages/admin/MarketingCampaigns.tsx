import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { DateTimePicker } from "@/components/ui/date-time-picker";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  marketingService,
  type CampaignAudienceType,
  type MarketingCampaign,
  type MarketingCampaignStatus,
  type MarketingTemplate,
  type NotificationType,
} from "@/services/marketing.service";
import {
  defaultCampaignForm,
  marketingAudienceOptions,
  marketingChannelOptions,
} from "./marketing-shared";
import { BarChart3, Plus, RefreshCcw, Send } from "lucide-react";
import { toast } from "sonner";

const toDateTimeLocalValue = (value?: string | null) => {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  date.setMinutes(date.getMinutes() - date.getTimezoneOffset());
  return date.toISOString().slice(0, 16);
};

const MarketingCampaigns = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [campaigns, setCampaigns] = useState<MarketingCampaign[]>([]);
  const [templates, setTemplates] = useState<MarketingTemplate[]>([]);

  const [campaignOpen, setCampaignOpen] = useState(false);
  const [editingCampaignId, setEditingCampaignId] = useState<string | null>(null);
  const [campaignForm, setCampaignForm] = useState(defaultCampaignForm);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [templatesRows, campaignsResponse] = await Promise.all([
        marketingService.listTemplates(),
        marketingService.listCampaigns({ limit: 100 }),
      ]);

      setTemplates(Array.isArray(templatesRows) ? templatesRows : []);
      setCampaigns(Array.isArray(campaignsResponse?.data) ? campaignsResponse.data : []);
    } catch (error) {
      console.error(error);
      toast.error("Failed to load campaigns");
      setTemplates([]);
      setCampaigns([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const filteredCampaigns = useMemo(() => {
    if (!search) {
      return campaigns;
    }

    const needle = search.toLowerCase();
    return campaigns.filter((campaign) =>
      [campaign.name, campaign.description, campaign.subject, campaign.content]
        .filter(Boolean)
        .some((value) => (value || "").toLowerCase().includes(needle)),
    );
  }, [campaigns, search]);

  const openNewCampaign = () => {
    setEditingCampaignId(null);
    setCampaignForm(defaultCampaignForm);
    setCampaignOpen(true);
  };

  const openEditCampaign = (campaign: MarketingCampaign) => {
    setEditingCampaignId(campaign.id);
    setCampaignForm({
      name: campaign.name,
      description: campaign.description || "",
      type: campaign.type,
      status: campaign.status === "SCHEDULED" ? "SCHEDULED" : "DRAFT",
      audienceType: campaign.audienceType,
      customUserIds: (campaign.customUserIds || []).join(", "),
      classId: campaign.classId || "",
      templateId: campaign.templateId || "",
      subject: campaign.subject || "",
      content: campaign.content,
      specialOffer: campaign.specialOffer || "",
      scheduledAt: toDateTimeLocalValue(campaign.scheduledAt),
    });
    setCampaignOpen(true);
  };

  const handleSubmitCampaign = async () => {
    if (!campaignForm.name.trim() || !campaignForm.content.trim()) {
      toast.error("Campaign name and content are required");
      return;
    }

    if (campaignForm.status === "SCHEDULED" && !campaignForm.scheduledAt) {
      toast.error("Scheduled campaigns require schedule date/time");
      return;
    }

    const customUserIds = campaignForm.customUserIds
      .split(",")
      .map((id) => id.trim())
      .filter(Boolean);

    const payload = {
      name: campaignForm.name.trim(),
      description: campaignForm.description.trim() || undefined,
      type: campaignForm.type,
      status: campaignForm.status,
      audienceType: campaignForm.audienceType,
      customUserIds: customUserIds.length > 0 ? customUserIds : undefined,
      classId: campaignForm.classId.trim() || undefined,
      templateId: campaignForm.templateId || undefined,
      subject: campaignForm.subject.trim() || undefined,
      content: campaignForm.content.trim(),
      specialOffer: campaignForm.specialOffer.trim() || undefined,
      scheduledAt: campaignForm.scheduledAt
        ? new Date(campaignForm.scheduledAt).toISOString()
        : undefined,
    };

    try {
      if (editingCampaignId) {
        await marketingService.updateCampaign(editingCampaignId, payload);
        toast.success("Campaign updated");
      } else {
        await marketingService.createCampaign(payload);
        toast.success("Campaign created");
      }

      setCampaignOpen(false);
      setEditingCampaignId(null);
      setCampaignForm(defaultCampaignForm);
      await loadData();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to save campaign");
    }
  };

  const handleSendCampaign = async (id: string) => {
    try {
      const result = await marketingService.sendCampaign(id);
      toast.success(
        `Campaign sent: ${result.deliveredCount ?? 0} delivered, ${result.failedCount ?? 0} failed`,
      );
      await loadData();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to send campaign");
    }
  };

  return (
    <div className="m3-admin-page">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Marketing Campaigns</h1>
          <p className="text-muted-foreground">
            Create, schedule, send, and manage campaign lifecycle.
          </p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Button variant="outline" onClick={loadData} disabled={loading}>
            <RefreshCcw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button onClick={openNewCampaign}>
            <Plus className="h-4 w-4 mr-2" />
            New Campaign
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-lg font-semibold">Campaign List</h2>
          <Input
            className="sm:max-w-sm"
            placeholder="Search campaigns..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </CardHeader>
        <CardContent className="space-y-3">
          {loading ? (
            <p className="text-muted-foreground">Loading campaigns...</p>
          ) : filteredCampaigns.length === 0 ? (
            <p className="text-muted-foreground">No campaigns found.</p>
          ) : (
            filteredCampaigns.map((campaign) => (
              <Card key={campaign.id}>
                <CardContent className="p-4 flex flex-col lg:flex-row lg:items-center gap-3 lg:justify-between">
                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-medium">{campaign.name}</p>
                      <Badge variant="outline">{campaign.type}</Badge>
                      <Badge>{campaign.status}</Badge>
                      <Badge variant="secondary">{campaign.audienceType}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {campaign.description || campaign.content}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Recipients: {campaign.recipientsCount ?? 0} • Created {new Date(campaign.createdAt).toLocaleString()}
                    </p>
                  </div>
                  <div className="flex gap-2 flex-wrap">
                    <Button size="sm" variant="outline" onClick={() => openEditCampaign(campaign)}>
                      Edit
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() =>
                        navigate(`/admin/marketing/analytics?campaignId=${campaign.id}`)
                      }
                    >
                      <BarChart3 className="h-4 w-4 mr-1" />
                      Analytics
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => handleSendCampaign(campaign.id)}
                      disabled={campaign.status === "SENDING"}
                    >
                      <Send className="h-4 w-4 mr-1" />
                      Send
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </CardContent>
      </Card>

      <Dialog open={campaignOpen} onOpenChange={setCampaignOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editingCampaignId ? "Edit Campaign" : "Create Campaign"}</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="space-y-2 md:col-span-2">
              <Label>Name</Label>
              <Input
                value={campaignForm.name}
                onChange={(event) =>
                  setCampaignForm((prev) => ({ ...prev, name: event.target.value }))
                }
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label>Description</Label>
              <Input
                value={campaignForm.description}
                onChange={(event) =>
                  setCampaignForm((prev) => ({ ...prev, description: event.target.value }))
                }
              />
            </div>
            <div className="space-y-2">
              <Label>Channel</Label>
              <Select
                value={campaignForm.type}
                onValueChange={(value) =>
                  setCampaignForm((prev) => ({ ...prev, type: value as NotificationType }))
                }
              >
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {marketingChannelOptions.map((option) => (
                    <SelectItem key={option} value={option}>{option}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Status</Label>
              <Select
                value={campaignForm.status}
                onValueChange={(value) =>
                  setCampaignForm((prev) => ({
                    ...prev,
                    status: value as MarketingCampaignStatus,
                  }))
                }
              >
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="DRAFT">DRAFT</SelectItem>
                  <SelectItem value="SCHEDULED">SCHEDULED</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Audience</Label>
              <Select
                value={campaignForm.audienceType}
                onValueChange={(value) =>
                  setCampaignForm((prev) => ({
                    ...prev,
                    audienceType: value as CampaignAudienceType,
                  }))
                }
              >
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {marketingAudienceOptions.map((option) => (
                    <SelectItem key={option} value={option}>{option}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Template (optional)</Label>
              <Select
                value={campaignForm.templateId || "NONE"}
                onValueChange={(value) =>
                  setCampaignForm((prev) => ({
                    ...prev,
                    templateId: value === "NONE" ? "" : value,
                  }))
                }
              >
                <SelectTrigger><SelectValue placeholder="Select template" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="NONE">None</SelectItem>
                  {templates.map((template) => (
                    <SelectItem key={template.id} value={template.id}>{template.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label>Subject (optional)</Label>
              <Input
                value={campaignForm.subject}
                onChange={(event) =>
                  setCampaignForm((prev) => ({ ...prev, subject: event.target.value }))
                }
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label>Content</Label>
              <Textarea
                value={campaignForm.content}
                onChange={(event) =>
                  setCampaignForm((prev) => ({ ...prev, content: event.target.value }))
                }
              />
            </div>
            <div className="space-y-2">
              <Label>Special Offer (optional)</Label>
              <Input
                value={campaignForm.specialOffer}
                onChange={(event) =>
                  setCampaignForm((prev) => ({ ...prev, specialOffer: event.target.value }))
                }
              />
            </div>
            <div className="space-y-2">
              <Label>Class ID</Label>
              <Input
                value={campaignForm.classId}
                onChange={(event) =>
                  setCampaignForm((prev) => ({ ...prev, classId: event.target.value }))
                }
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label>Custom User IDs (comma separated)</Label>
              <Input
                value={campaignForm.customUserIds}
                onChange={(event) =>
                  setCampaignForm((prev) => ({ ...prev, customUserIds: event.target.value }))
                }
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label>Scheduled At (for SCHEDULED)</Label>
              <DateTimePicker
                value={campaignForm.scheduledAt}
                onChange={(value) =>
                  setCampaignForm((prev) => ({ ...prev, scheduledAt: value }))
                }
              />
            </div>
            <div className="md:col-span-2">
              <Button className="w-full" onClick={handleSubmitCampaign}>
                {editingCampaignId ? "Update Campaign" : "Create Campaign"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default MarketingCampaigns;
