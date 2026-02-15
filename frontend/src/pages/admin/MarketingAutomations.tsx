import { useCallback, useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
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
  type MarketingAutomation,
  type MarketingAutomationType,
  type MarketingTemplate,
  type NotificationType,
} from "@/services/marketing.service";
import {
  defaultAutomationForm,
  marketingAutomationTypeOptions,
  marketingChannelOptions,
} from "./marketing-shared";
import { PlayCircle, Plus, RefreshCcw } from "lucide-react";
import { toast } from "sonner";

const MarketingAutomations = () => {
  const [loading, setLoading] = useState(true);
  const [automations, setAutomations] = useState<MarketingAutomation[]>([]);
  const [templates, setTemplates] = useState<MarketingTemplate[]>([]);

  const [automationOpen, setAutomationOpen] = useState(false);
  const [editingAutomationId, setEditingAutomationId] = useState<string | null>(null);
  const [automationForm, setAutomationForm] = useState(defaultAutomationForm);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [automationRows, templateRows] = await Promise.all([
        marketingService.listAutomations(),
        marketingService.listTemplates(),
      ]);

      setAutomations(Array.isArray(automationRows) ? automationRows : []);
      setTemplates(Array.isArray(templateRows) ? templateRows : []);
    } catch (error) {
      console.error(error);
      toast.error("Failed to load automations");
      setAutomations([]);
      setTemplates([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

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
      await loadData();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to save automation");
    }
  };

  const toggleAutomation = async (automation: MarketingAutomation) => {
    try {
      await marketingService.updateAutomation(automation.id, {
        isActive: !automation.isActive,
      });
      toast.success(`Automation ${!automation.isActive ? "enabled" : "disabled"}`);
      await loadData();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to update automation");
    }
  };

  const runAutomations = async () => {
    try {
      await marketingService.runAutomations();
      toast.success("Automations executed");
      await loadData();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to run automations");
    }
  };

  return (
    <div className="m3-admin-page">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Marketing Automations</h1>
          <p className="text-muted-foreground">
            Configure recurring outreach flows and trigger runs manually.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={loadData} disabled={loading}>
            <RefreshCcw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button variant="outline" onClick={runAutomations}>
            <PlayCircle className="h-4 w-4 mr-2" />
            Run Now
          </Button>
          <Button onClick={openNewAutomation}>
            <Plus className="h-4 w-4 mr-2" />
            New Automation
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold">Automation Rules</h2>
        </CardHeader>
        <CardContent className="space-y-3">
          {loading ? (
            <p className="text-muted-foreground">Loading automations...</p>
          ) : automations.length === 0 ? (
            <p className="text-muted-foreground">No automations configured.</p>
          ) : (
            automations.map((automation) => (
              <Card key={automation.id}>
                <CardContent className="p-4 space-y-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-medium">{automation.name}</p>
                    <Badge variant="outline">{automation.type}</Badge>
                    <Badge>{automation.channel}</Badge>
                    <Badge variant={automation.isActive ? "default" : "secondary"}>
                      {automation.isActive ? "ACTIVE" : "PAUSED"}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground line-clamp-2">{automation.content}</p>
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
                onValueChange={(value) =>
                  setAutomationForm((prev) => ({
                    ...prev,
                    type: value as MarketingAutomationType,
                  }))
                }
              >
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {marketingAutomationTypeOptions.map((option) => (
                    <SelectItem key={option} value={option}>{option}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Name</Label>
              <Input
                value={automationForm.name}
                onChange={(event) =>
                  setAutomationForm((prev) => ({ ...prev, name: event.target.value }))
                }
              />
            </div>
            <div className="space-y-2">
              <Label>Channel</Label>
              <Select
                value={automationForm.channel}
                onValueChange={(value) =>
                  setAutomationForm((prev) => ({ ...prev, channel: value as NotificationType }))
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
              <Label>Template (optional)</Label>
              <Select
                value={automationForm.templateId || "NONE"}
                onValueChange={(value) =>
                  setAutomationForm((prev) => ({
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
                value={automationForm.subject}
                onChange={(event) =>
                  setAutomationForm((prev) => ({ ...prev, subject: event.target.value }))
                }
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label>Content</Label>
              <Textarea
                value={automationForm.content}
                onChange={(event) =>
                  setAutomationForm((prev) => ({ ...prev, content: event.target.value }))
                }
              />
            </div>
            <div className="space-y-2">
              <Label>Inactive Days</Label>
              <Input
                type="number"
                min={1}
                value={automationForm.inactiveDays}
                onChange={(event) =>
                  setAutomationForm((prev) => ({ ...prev, inactiveDays: event.target.value }))
                }
              />
            </div>
            <div className="space-y-2">
              <Label>Class ID (optional)</Label>
              <Input
                value={automationForm.classId}
                onChange={(event) =>
                  setAutomationForm((prev) => ({ ...prev, classId: event.target.value }))
                }
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label>Special Offer (optional)</Label>
              <Input
                value={automationForm.specialOffer}
                onChange={(event) =>
                  setAutomationForm((prev) => ({ ...prev, specialOffer: event.target.value }))
                }
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

export default MarketingAutomations;
