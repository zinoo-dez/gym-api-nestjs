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
import { BarChart3, Plus, RefreshCcw, Send, Megaphone, Search, Filter, Edit3, Calendar, Users, Target, Rocket } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";

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
    <div className="space-y-4">
      {/* Header section */}
      <section className="rounded-2xl border border-gray-200 bg-white p-4">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm font-semibold text-gray-900">Campaign Orchestration</p>
            <p className="text-sm text-gray-500">
              Manage Outreach Batches, promotional lifecycle, and audience targeting.
            </p>
          </div>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              onClick={loadData} 
              disabled={loading}
              className="h-10 rounded-xl border-gray-200 font-bold font-mono text-xs hover:bg-gray-50"
            >
              <RefreshCcw className={cn("h-4 w-4 mr-2", loading && "animate-spin")} />
              Sync Archive
            </Button>
            <Button 
              onClick={openNewCampaign}
              className="h-10 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold font-mono text-xs shadow-lg shadow-blue-100 transition-all active:scale-95"
            >
              <Plus className="h-4 w-4 mr-2" />
              Launch New Outreach
            </Button>
          </div>
        </div>
      </section>

      {/* Search & Filter Toolbar */}
      <section className="rounded-2xl border border-gray-200 bg-white p-3">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <Input
              className="h-11 pl-10 rounded-xl border-gray-100 bg-gray-50/50 focus:ring-blue-600 font-medium placeholder:text-gray-400"
              placeholder="Query campaigns by name, subject, or content..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </div>
          <Button variant="outline" className="h-11 rounded-xl border-gray-100 text-gray-500">
            <Filter className="h-4 w-4 mr-2" />
            Filters
          </Button>
        </div>
      </section>

      {/* Campaign Grid/List */}
      <div className="grid gap-4">
        {loading ? (
          <div className="py-20 text-center rounded-2xl border-2 border-dashed border-gray-100 bg-white/50">
            <RefreshCcw className="h-12 w-12 mb-3 mx-auto text-blue-100 animate-spin" />
            <p className="font-medium text-gray-400">Loading campaign archives...</p>
          </div>
        ) : filteredCampaigns.length === 0 ? (
          <div className="py-20 text-center rounded-2xl border-2 border-dashed border-gray-100 bg-white/50">
            <Megaphone className="h-12 w-12 mb-3 mx-auto text-gray-100" />
            <p className="font-medium text-gray-400">No campaigns match your current query.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
            {filteredCampaigns.map((campaign) => (
              <Card key={campaign.id} className="overflow-hidden border-gray-200 hover:border-blue-300 transition-colors shadow-none rounded-2xl">
                <CardContent className="p-0">
                  <div className="p-5 space-y-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="space-y-1.5 flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-bold text-gray-900 truncate max-w-[200px]">{campaign.name}</h3>
                          <Badge variant="outline" className="rounded-lg bg-blue-50 border-blue-100 text-blue-600 font-bold text-[10px] uppercase">
                            {campaign.type}
                          </Badge>
                          <Badge className={cn(
                            "rounded-lg font-bold text-[10px] uppercase",
                            campaign.status === "SENT" ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-100" :
                            campaign.status === "SCHEDULED" ? "bg-blue-100 text-blue-700 hover:bg-blue-100" :
                            "bg-gray-100 text-gray-700 hover:bg-gray-100"
                          )}>
                            {campaign.status}
                          </Badge>
                        </div>
                        <p className="text-xs text-gray-500 line-clamp-2">
                          {campaign.description || campaign.content}
                        </p>
                      </div>
                      <div className="p-2 rounded-xl bg-gray-50">
                        <Megaphone className="h-5 w-5 text-gray-400" />
                      </div>
                    </div>

                    <div className="flex items-center gap-4 text-[11px] text-gray-400 font-medium">
                      <div className="flex items-center gap-1.5 text-blue-600">
                        <Users className="h-3.5 w-3.5" />
                        <span>{campaign.recipientsCount ?? 0} targeted</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Target className="h-3.5 w-3.5" />
                        <span>{campaign.audienceType}</span>
                      </div>
                      <div className="flex items-center gap-1.5 ml-auto">
                        <Calendar className="h-3.5 w-3.5" />
                        <span>{new Date(campaign.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-50 px-5 py-3 flex items-center justify-between border-t border-gray-100">
                    <div className="flex gap-2">
                      <Button 
                        size="sm" 
                        variant="ghost" 
                        onClick={() => openEditCampaign(campaign)}
                        className="h-8 rounded-lg text-gray-500 hover:text-blue-600 hover:bg-blue-50 text-xs font-bold"
                      >
                        <Edit3 className="h-3.5 w-3.5 mr-1.5" />
                        Modify
                      </Button>
                      <Button 
                        size="sm" 
                        variant="ghost" 
                        onClick={() => navigate(`/admin/marketing/analytics?campaignId=${campaign.id}`)}
                        className="h-8 rounded-lg text-gray-500 hover:text-emerald-600 hover:bg-emerald-50 text-xs font-bold"
                      >
                        <BarChart3 className="h-3.5 w-3.5 mr-1.5" />
                        Performance
                      </Button>
                    </div>
                    <Button 
                      size="sm" 
                      onClick={() => handleSendCampaign(campaign.id)}
                      disabled={campaign.status === "SENDING" || campaign.status === "SENT"}
                      className={cn(
                        "h-8 rounded-lg text-xs font-bold font-mono transition-all",
                        campaign.status === "SENT" ? "bg-emerald-50 text-emerald-600 border border-emerald-100 shadow-none disabled:opacity-100" : "bg-blue-600 hover:bg-blue-500 text-white shadow-sm shadow-blue-200"
                      )}
                    >
                      {campaign.status === "SENT" ? (
                        <>
                          <Rocket className="h-3.5 w-3.5 mr-1.5" />
                          Transmitted
                        </>
                      ) : (
                        <>
                          <Send className="h-3.5 w-3.5 mr-1.5" />
                          Fire Campaign
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      <Dialog open={campaignOpen} onOpenChange={setCampaignOpen}>
        <DialogContent className="max-w-3xl rounded-2xl border-none shadow-2xl p-0 overflow-hidden">
          <div className="bg-blue-600 p-6 text-white">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <Plus className="h-6 w-6" />
              {editingCampaignId ? "Refine Outreach Details" : "Compose New Campaign"}
            </h2>
            <p className="text-blue-100 text-xs mt-1 font-medium opacity-80">
              Configure parameters for your gym outreach and promotion batches.
            </p>
          </div>
          
          <ScrollArea className="max-h-[80vh]">
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2 md:col-span-2">
                  <Label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Engagement Name</Label>
                  <Input
                    className="h-12 rounded-xl border-gray-100 bg-gray-50/50 focus:ring-blue-600 font-medium"
                    placeholder="e.g., Summer Fitness Blitz 2024"
                    value={campaignForm.name}
                    onChange={(event) =>
                      setCampaignForm((prev) => ({ ...prev, name: event.target.value }))
                    }
                  />
                </div>
                
                <div className="space-y-2 md:col-span-2">
                  <Label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Internal Description</Label>
                  <Input
                    className="h-12 rounded-xl border-gray-100 bg-gray-50/50 focus:ring-blue-600 font-medium"
                    placeholder="Brief objective for staff reference..."
                    value={campaignForm.description}
                    onChange={(event) =>
                      setCampaignForm((prev) => ({ ...prev, description: event.target.value }))
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Outreach Channel</Label>
                  <Select
                    value={campaignForm.type}
                    onValueChange={(value) =>
                      setCampaignForm((prev) => ({ ...prev, type: value as NotificationType }))
                    }
                  >
                    <SelectTrigger className="h-12 rounded-xl border-gray-100 bg-gray-50/50 focus:ring-blue-600 font-medium font-mono text-xs uppercase tracking-tight">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl">
                      {marketingChannelOptions.map((option) => (
                        <SelectItem key={option} value={option} className="rounded-lg">{option}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Execution Status</Label>
                  <Select
                    value={campaignForm.status}
                    onValueChange={(value) =>
                      setCampaignForm((prev) => ({
                        ...prev,
                        status: value as MarketingCampaignStatus,
                      }))
                    }
                  >
                    <SelectTrigger className="h-12 rounded-xl border-gray-100 bg-gray-50/50 focus:ring-blue-600 font-medium font-mono text-xs uppercase tracking-tight">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl">
                      <SelectItem value="DRAFT" className="rounded-lg">DRAFT (Manual Fire)</SelectItem>
                      <SelectItem value="SCHEDULED" className="rounded-lg">SCHEDULED (Automated)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Target Audience</Label>
                  <Select
                    value={campaignForm.audienceType}
                    onValueChange={(value) =>
                      setCampaignForm((prev) => ({
                        ...prev,
                        audienceType: value as CampaignAudienceType,
                      }))
                    }
                  >
                    <SelectTrigger className="h-12 rounded-xl border-gray-100 bg-gray-50/50 focus:ring-blue-600 font-medium font-mono text-xs uppercase tracking-tight">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl">
                      {marketingAudienceOptions.map((option) => (
                        <SelectItem key={option} value={option} className="rounded-lg">{option}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Layout Template</Label>
                  <Select
                    value={campaignForm.templateId || "NONE"}
                    onValueChange={(value) =>
                      setCampaignForm((prev) => ({
                        ...prev,
                        templateId: value === "NONE" ? "" : value,
                      }))
                    }
                  >
                    <SelectTrigger className="h-12 rounded-xl border-gray-100 bg-gray-50/50 focus:ring-blue-600 font-medium font-mono text-xs uppercase tracking-tight">
                      <SelectValue placeholder="Select template" />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl">
                      <SelectItem value="NONE" className="rounded-lg">Generic (Manual Content)</SelectItem>
                      {templates.map((template) => (
                        <SelectItem key={template.id} value={template.id} className="rounded-lg">{template.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Message Subject line</Label>
                  <Input
                    className="h-12 rounded-xl border-gray-100 bg-gray-50/50 focus:ring-blue-600 font-medium"
                    placeholder="Subject for Email/Push notifications..."
                    value={campaignForm.subject}
                    onChange={(event) =>
                      setCampaignForm((prev) => ({ ...prev, subject: event.target.value }))
                    }
                  />
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Payload Content</Label>
                  <Textarea
                    className="min-h-[120px] rounded-xl border-gray-100 bg-gray-50/50 focus:ring-blue-600 font-medium"
                    placeholder="Enter the primary message content for the outreach..."
                    value={campaignForm.content}
                    onChange={(event) =>
                      setCampaignForm((prev) => ({ ...prev, content: event.target.value }))
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Promotional Offer</Label>
                  <Input
                    className="h-12 rounded-xl border-gray-100 bg-gray-50/50 focus:ring-blue-600 font-medium"
                    placeholder="e.g., Use code SUMMER50"
                    value={campaignForm.specialOffer}
                    onChange={(event) =>
                      setCampaignForm((prev) => ({ ...prev, specialOffer: event.target.value }))
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Restricted Class ID</Label>
                  <Input
                    className="h-12 rounded-xl border-gray-100 bg-gray-50/50 focus:ring-blue-600 font-medium"
                    placeholder="Optional UUID for class-specific targeting"
                    value={campaignForm.classId}
                    onChange={(event) =>
                      setCampaignForm((prev) => ({ ...prev, classId: event.target.value }))
                    }
                  />
                </div>

                {campaignForm.audienceType === "CUSTOM" && (
                  <div className="space-y-2 md:col-span-2">
                    <Label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Custom Recipient List (ID pool)</Label>
                    <Input
                      className="h-12 rounded-xl border-gray-100 bg-gray-50/50 focus:ring-blue-600 font-medium"
                      placeholder="comma-separated user UUIDs..."
                      value={campaignForm.customUserIds}
                      onChange={(event) =>
                        setCampaignForm((prev) => ({ ...prev, customUserIds: event.target.value }))
                      }
                    />
                  </div>
                )}

                <div className="space-y-2 md:col-span-2">
                  <Label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Scheduled Transmission Time</Label>
                  <DateTimePicker
                    className="h-12 rounded-xl border-gray-100 bg-gray-50/50 focus:ring-blue-600"
                    value={campaignForm.scheduledAt}
                    onChange={(value) =>
                      setCampaignForm((prev) => ({ ...prev, scheduledAt: value }))
                    }
                  />
                  <p className="text-[10px] text-gray-400 italic ml-1 mt-1">Leave empty for instant draft initialization.</p>
                </div>
              </div>
              
              <div className="pt-4 flex gap-3">
                <Button 
                  variant="outline" 
                  className="flex-1 h-12 rounded-xl border-gray-200 font-bold text-gray-500"
                  onClick={() => setCampaignOpen(false)}
                >
                  Discard Changes
                </Button>
                <Button 
                  className="flex-[2] h-12 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold shadow-lg shadow-blue-100 transition-all active:scale-95"
                  onClick={handleSubmitCampaign}
                >
                  {editingCampaignId ? "Verify & Persist" : "Launch Campaign Batch"}
                </Button>
              </div>
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default MarketingCampaigns;
