import { useCallback, useEffect, useMemo, useState } from "react";
import {
  marketingService,
  type CampaignAnalytics,
  type CampaignAudienceType,
  type MarketingAutomation,
  type MarketingAutomationType,
  type MarketingCampaign,
  type MarketingCampaignStatus,
  type MarketingTemplate,
  type NotificationType,
} from "@/services/marketing.service";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Send, RefreshCcw, BarChart3 } from "lucide-react";
import { toast } from "sonner";

const channelOptions: NotificationType[] = ["EMAIL", "SMS", "IN_APP", "PUSH"];
const audienceOptions: CampaignAudienceType[] = [
  "ALL_MEMBERS",
  "INACTIVE_MEMBERS",
  "BIRTHDAY_MEMBERS",
  "CLASS_ATTENDEES",
  "CUSTOM",
];
const automationTypeOptions: MarketingAutomationType[] = [
  "BIRTHDAY_WISHES",
  "REENGAGEMENT",
  "CLASS_PROMOTION",
  "NEWSLETTER",
];

const defaultTemplateForm = {
  name: "",
  type: "EMAIL" as NotificationType,
  subject: "",
  body: "",
};

const defaultCampaignForm = {
  name: "",
  description: "",
  type: "EMAIL" as NotificationType,
  status: "DRAFT" as MarketingCampaignStatus,
  audienceType: "ALL_MEMBERS" as CampaignAudienceType,
  customUserIds: "",
  classId: "",
  templateId: "",
  subject: "",
  content: "",
  specialOffer: "",
  scheduledAt: "",
};

const defaultAutomationForm = {
  type: "BIRTHDAY_WISHES" as MarketingAutomationType,
  name: "",
  channel: "EMAIL" as NotificationType,
  templateId: "",
  subject: "",
  content: "",
  specialOffer: "",
  inactiveDays: "30",
  classId: "",
};

const Marketing = () => {
  const [templates, setTemplates] = useState<MarketingTemplate[]>([]);
  const [campaigns, setCampaigns] = useState<MarketingCampaign[]>([]);
  const [automations, setAutomations] = useState<MarketingAutomation[]>([]);

  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [analytics, setAnalytics] = useState<CampaignAnalytics | null>(null);
  const [analyticsCampaignName, setAnalyticsCampaignName] = useState<string>("");

  const [templateOpen, setTemplateOpen] = useState(false);
  const [campaignOpen, setCampaignOpen] = useState(false);
  const [automationOpen, setAutomationOpen] = useState(false);

  const [editingTemplateId, setEditingTemplateId] = useState<string | null>(null);
  const [editingCampaignId, setEditingCampaignId] = useState<string | null>(null);
  const [editingAutomationId, setEditingAutomationId] = useState<string | null>(null);

  const [templateForm, setTemplateForm] = useState(defaultTemplateForm);
  const [campaignForm, setCampaignForm] = useState(defaultCampaignForm);
  const [automationForm, setAutomationForm] = useState(defaultAutomationForm);

  const loadAll = useCallback(async () => {
    setLoading(true);
    try {
      const [templateRows, campaignRows, automationRows] = await Promise.all([
        marketingService.listTemplates(),
        marketingService.listCampaigns({ limit: 50 }),
        marketingService.listAutomations(),
      ]);

      setTemplates(Array.isArray(templateRows) ? templateRows : []);
      setCampaigns(Array.isArray(campaignRows?.data) ? campaignRows.data : []);
      setAutomations(Array.isArray(automationRows) ? automationRows : []);
    } catch (error) {
      console.error(error);
      toast.error("Failed to load marketing data");
      setTemplates([]);
      setCampaigns([]);
      setAutomations([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  const filteredCampaigns = useMemo(() => {
    if (!search) {
      return campaigns;
    }

    const s = search.toLowerCase();
    return campaigns.filter((row) =>
      [row.name, row.description, row.subject, row.content]
        .filter(Boolean)
        .some((v) => (v || "").toLowerCase().includes(s)),
    );
  }, [campaigns, search]);

  const openNewTemplate = () => {
    setEditingTemplateId(null);
    setTemplateForm(defaultTemplateForm);
    setTemplateOpen(true);
  };

  const openEditTemplate = (template: MarketingTemplate) => {
    setEditingTemplateId(template.id);
    setTemplateForm({
      name: template.name,
      type: template.type,
      subject: template.subject || "",
      body: template.body,
    });
    setTemplateOpen(true);
  };

  const handleSubmitTemplate = async () => {
    if (!templateForm.name.trim() || !templateForm.body.trim()) {
      toast.error("Template name and body are required");
      return;
    }

    try {
      if (editingTemplateId) {
        await marketingService.updateTemplate(editingTemplateId, {
          name: templateForm.name.trim(),
          type: templateForm.type,
          subject: templateForm.subject.trim() || undefined,
          body: templateForm.body.trim(),
        });
        toast.success("Template updated");
      } else {
        await marketingService.createTemplate({
          name: templateForm.name.trim(),
          type: templateForm.type,
          subject: templateForm.subject.trim() || undefined,
          body: templateForm.body.trim(),
        });
        toast.success("Template created");
      }

      setTemplateOpen(false);
      setEditingTemplateId(null);
      setTemplateForm(defaultTemplateForm);
      loadAll();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to save template");
    }
  };

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
      scheduledAt: campaign.scheduledAt
        ? new Date(campaign.scheduledAt).toISOString().slice(0, 16)
        : "",
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
      customUserIds: customUserIds.length ? customUserIds : undefined,
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
      loadAll();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to save campaign");
    }
  };

  const openNewAutomation = () => {
    setEditingAutomationId(null);
    setAutomationForm(defaultAutomationForm);
    setAutomationOpen(true);
  };

  const openEditAutomation = (automation: MarketingAutomation) => {
    setEditingAutomationId(automation.id);
    setAutomationForm({
      type: automation.type,
      name: automation.name,
      channel: automation.channel,
      templateId: automation.templateId || "",
      subject: automation.subject || "",
      content: automation.content,
      specialOffer: automation.specialOffer || "",
      inactiveDays: String(automation.inactiveDays || 30),
      classId: automation.classId || "",
    });
    setAutomationOpen(true);
  };

  const handleSubmitAutomation = async () => {
    if (!automationForm.name.trim() || !automationForm.content.trim()) {
      toast.error("Automation name and content are required");
      return;
    }

    const payload = {
      type: automationForm.type,
      name: automationForm.name.trim(),
      channel: automationForm.channel,
      templateId: automationForm.templateId || undefined,
      subject: automationForm.subject.trim() || undefined,
      content: automationForm.content.trim(),
      specialOffer: automationForm.specialOffer.trim() || undefined,
      inactiveDays: Number(automationForm.inactiveDays) || 30,
      classId: automationForm.classId.trim() || undefined,
    };

    try {
      if (editingAutomationId) {
        await marketingService.updateAutomation(editingAutomationId, payload);
        toast.success("Automation updated");
      } else {
        await marketingService.createAutomation(payload);
        toast.success("Automation created");
      }

      setAutomationOpen(false);
      setEditingAutomationId(null);
      setAutomationForm(defaultAutomationForm);
      loadAll();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to save automation");
    }
  };

  const handleSendCampaign = async (id: string) => {
    try {
      const result = await marketingService.sendCampaign(id);
      toast.success(
        `Campaign sent: ${result.deliveredCount ?? 0} delivered, ${result.failedCount ?? 0} failed`,
      );
      loadAll();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to send campaign");
    }
  };

  const handleViewAnalytics = async (campaign: MarketingCampaign) => {
    try {
      const result = await marketingService.getCampaignAnalytics(campaign.id);
      setAnalytics(result);
      setAnalyticsCampaignName(campaign.name);
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to load analytics");
    }
  };

  const handleRunAutomations = async () => {
    try {
      await marketingService.runAutomations();
      toast.success("Automations executed");
      loadAll();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to run automations");
    }
  };

  const toggleAutomation = async (automation: MarketingAutomation) => {
    try {
      await marketingService.updateAutomation(automation.id, {
        isActive: !automation.isActive,
      });
      toast.success(`Automation ${!automation.isActive ? "enabled" : "disabled"}`);
      loadAll();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to update automation");
    }
  };

  return (
    <div className="space-y-6 px-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Marketing</h1>
          <p className="text-muted-foreground">
            Campaigns, templates, automations, and engagement analytics
          </p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Button variant="outline" onClick={loadAll}>
            <RefreshCcw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button variant="outline" onClick={handleRunAutomations}>
            Run Automations
          </Button>
          <Button onClick={openNewCampaign}>
            <Plus className="h-4 w-4 mr-2" />
            New Campaign
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-lg font-semibold">Campaigns</h2>
          <Input
            className="sm:max-w-sm"
            placeholder="Search campaigns..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
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
                    <Button size="sm" variant="outline" onClick={() => handleViewAnalytics(campaign)}>
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

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <h2 className="text-lg font-semibold">Templates</h2>
            <Button size="sm" variant="outline" onClick={openNewTemplate}>
              <Plus className="h-4 w-4 mr-1" /> New
            </Button>
          </CardHeader>
          <CardContent className="space-y-3">
            {templates.length === 0 ? (
              <p className="text-muted-foreground">No templates yet.</p>
            ) : (
              templates.map((template) => (
                <Card key={template.id}>
                  <CardContent className="p-3 space-y-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-medium text-sm">{template.name}</p>
                      <Badge variant="outline">{template.type}</Badge>
                      <Badge variant={template.isActive ? "default" : "secondary"}>
                        {template.isActive ? "ACTIVE" : "INACTIVE"}
                      </Badge>
                    </div>
                    {template.subject && (
                      <p className="text-xs text-muted-foreground">Subject: {template.subject}</p>
                    )}
                    <p className="text-xs text-muted-foreground line-clamp-2">{template.body}</p>
                    <Button size="sm" variant="outline" onClick={() => openEditTemplate(template)}>
                      Edit
                    </Button>
                  </CardContent>
                </Card>
              ))
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <h2 className="text-lg font-semibold">Automations</h2>
            <Button size="sm" variant="outline" onClick={openNewAutomation}>
              <Plus className="h-4 w-4 mr-1" /> New
            </Button>
          </CardHeader>
          <CardContent className="space-y-3">
            {automations.length === 0 ? (
              <p className="text-muted-foreground">No automations configured.</p>
            ) : (
              automations.map((automation) => (
                <Card key={automation.id}>
                  <CardContent className="p-3 space-y-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-medium text-sm">{automation.name}</p>
                      <Badge variant="outline">{automation.type}</Badge>
                      <Badge>{automation.channel}</Badge>
                      <Badge variant={automation.isActive ? "default" : "secondary"}>
                        {automation.isActive ? "ACTIVE" : "PAUSED"}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground line-clamp-2">{automation.content}</p>
                    <p className="text-xs text-muted-foreground">
                      Last run: {automation.lastRunAt ? new Date(automation.lastRunAt).toLocaleString() : "Never"}
                    </p>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" onClick={() => openEditAutomation(automation)}>
                        Edit
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => toggleAutomation(automation)}>
                        {automation.isActive ? "Pause" : "Activate"}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </CardContent>
        </Card>
      </div>

      {analytics && (
        <Card>
          <CardHeader>
            <h2 className="text-lg font-semibold">Analytics: {analyticsCampaignName}</h2>
          </CardHeader>
          <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Metric title="Recipients" value={analytics.totalRecipients} />
            <Metric title="Delivered" value={analytics.deliveredCount} />
            <Metric title="Failed" value={analytics.failedCount} />
            <Metric title="Opened" value={analytics.openedCount} />
            <Metric title="Clicked" value={analytics.clickedCount} />
            <Metric title="Open Rate" value={`${analytics.openRate}%`} />
            <Metric title="Click Rate" value={`${analytics.clickRate}%`} />
          </CardContent>
        </Card>
      )}

      <Dialog open={templateOpen} onOpenChange={setTemplateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingTemplateId ? "Edit Template" : "Create Template"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div className="space-y-2">
              <Label>Name</Label>
              <Input
                value={templateForm.name}
                onChange={(e) => setTemplateForm((prev) => ({ ...prev, name: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label>Channel</Label>
              <Select
                value={templateForm.type}
                onValueChange={(v) => setTemplateForm((prev) => ({ ...prev, type: v as NotificationType }))}
              >
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {channelOptions.map((option) => (
                    <SelectItem key={option} value={option}>{option}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Subject (optional)</Label>
              <Input
                value={templateForm.subject}
                onChange={(e) => setTemplateForm((prev) => ({ ...prev, subject: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label>Body</Label>
              <Textarea
                value={templateForm.body}
                onChange={(e) => setTemplateForm((prev) => ({ ...prev, body: e.target.value }))}
              />
            </div>
            <Button className="w-full" onClick={handleSubmitTemplate}>
              {editingTemplateId ? "Update Template" : "Create Template"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

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
                onChange={(e) => setCampaignForm((prev) => ({ ...prev, name: e.target.value }))}
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label>Description</Label>
              <Input
                value={campaignForm.description}
                onChange={(e) => setCampaignForm((prev) => ({ ...prev, description: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label>Channel</Label>
              <Select
                value={campaignForm.type}
                onValueChange={(v) => setCampaignForm((prev) => ({ ...prev, type: v as NotificationType }))}
              >
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {channelOptions.map((option) => (
                    <SelectItem key={option} value={option}>{option}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Status</Label>
              <Select
                value={campaignForm.status}
                onValueChange={(v) =>
                  setCampaignForm((prev) => ({ ...prev, status: v as MarketingCampaignStatus }))
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
                onValueChange={(v) =>
                  setCampaignForm((prev) => ({ ...prev, audienceType: v as CampaignAudienceType }))
                }
              >
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {audienceOptions.map((option) => (
                    <SelectItem key={option} value={option}>{option}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Template (optional)</Label>
              <Select
                value={campaignForm.templateId || "NONE"}
                onValueChange={(v) => setCampaignForm((prev) => ({ ...prev, templateId: v === "NONE" ? "" : v }))}
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
                onChange={(e) => setCampaignForm((prev) => ({ ...prev, subject: e.target.value }))}
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label>Content</Label>
              <Textarea
                value={campaignForm.content}
                onChange={(e) => setCampaignForm((prev) => ({ ...prev, content: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label>Special Offer (optional)</Label>
              <Input
                value={campaignForm.specialOffer}
                onChange={(e) => setCampaignForm((prev) => ({ ...prev, specialOffer: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label>Class ID (for CLASS_ATTENDEES)</Label>
              <Input
                value={campaignForm.classId}
                onChange={(e) => setCampaignForm((prev) => ({ ...prev, classId: e.target.value }))}
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label>Custom User IDs (comma separated)</Label>
              <Input
                value={campaignForm.customUserIds}
                onChange={(e) => setCampaignForm((prev) => ({ ...prev, customUserIds: e.target.value }))}
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label>Scheduled At (for SCHEDULED)</Label>
              <Input
                type="datetime-local"
                value={campaignForm.scheduledAt}
                onChange={(e) => setCampaignForm((prev) => ({ ...prev, scheduledAt: e.target.value }))}
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

      <Dialog open={automationOpen} onOpenChange={setAutomationOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editingAutomationId ? "Edit Automation" : "Create Automation"}</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>Type</Label>
              <Select
                value={automationForm.type}
                onValueChange={(v) =>
                  setAutomationForm((prev) => ({ ...prev, type: v as MarketingAutomationType }))
                }
              >
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {automationTypeOptions.map((option) => (
                    <SelectItem key={option} value={option}>{option}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Name</Label>
              <Input
                value={automationForm.name}
                onChange={(e) => setAutomationForm((prev) => ({ ...prev, name: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label>Channel</Label>
              <Select
                value={automationForm.channel}
                onValueChange={(v) => setAutomationForm((prev) => ({ ...prev, channel: v as NotificationType }))}
              >
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {channelOptions.map((option) => (
                    <SelectItem key={option} value={option}>{option}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Template (optional)</Label>
              <Select
                value={automationForm.templateId || "NONE"}
                onValueChange={(v) =>
                  setAutomationForm((prev) => ({ ...prev, templateId: v === "NONE" ? "" : v }))
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
                value={automationForm.subject}
                onChange={(e) => setAutomationForm((prev) => ({ ...prev, subject: e.target.value }))}
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label>Content</Label>
              <Textarea
                value={automationForm.content}
                onChange={(e) => setAutomationForm((prev) => ({ ...prev, content: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label>Inactive Days</Label>
              <Input
                type="number"
                min={1}
                value={automationForm.inactiveDays}
                onChange={(e) =>
                  setAutomationForm((prev) => ({ ...prev, inactiveDays: e.target.value }))
                }
              />
            </div>
            <div className="space-y-2">
              <Label>Class ID (class promo)</Label>
              <Input
                value={automationForm.classId}
                onChange={(e) => setAutomationForm((prev) => ({ ...prev, classId: e.target.value }))}
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label>Special Offer (optional)</Label>
              <Input
                value={automationForm.specialOffer}
                onChange={(e) => setAutomationForm((prev) => ({ ...prev, specialOffer: e.target.value }))}
              />
            </div>
            <div className="md:col-span-2">
              <Button className="w-full" onClick={handleSubmitAutomation}>
                {editingAutomationId ? "Update Automation" : "Create Automation"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

const Metric = ({ title, value }: { title: string; value: string | number }) => (
  <Card>
    <CardContent className="p-3">
      <p className="text-xs text-muted-foreground">{title}</p>
      <p className="text-xl font-semibold">{value}</p>
    </CardContent>
  </Card>
);

export default Marketing;
