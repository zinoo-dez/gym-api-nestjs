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
import { PlayCircle, Plus, RefreshCcw, Zap, Search, Filter, Settings, Power, Clock, CheckCircle2, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Switch } from "@/components/ui/switch";

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
    <div className="space-y-4">
      {/* Header section */}
      <section className="rounded-2xl border border-border bg-card p-4">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h1 className="m3-title-md">Automation Engine</h1>
            <p className="text-sm text-muted-foreground">
              Trigger event-based outreach flows and manage recurring engagement logic.
            </p>
          </div>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              onClick={loadData} 
              disabled={loading}
              className="h-10 rounded-xl border-border font-bold font-mono text-xs hover:bg-muted"
            >
              <RefreshCcw className={cn("h-4 w-4 mr-2", loading && "animate-spin")} />
              Sync Engine
            </Button>
            <Button 
              variant="outline" 
              onClick={runAutomations}
              className="h-10 rounded-xl border-border text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 font-bold font-mono text-xs"
            >
              <PlayCircle className="h-4 w-4 mr-2" />
              Pulse Run
            </Button>
            <Button 
              onClick={openNewAutomation}
              className="h-10 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold font-mono text-xs shadow-lg shadow-blue-100 transition-all active:scale-95"
            >
              <Plus className="h-4 w-4 mr-2" />
              Create Logic Flow
            </Button>
          </div>
        </div>
      </section>

      {/* Rules Grid */}
      <div className="grid gap-4">
        {loading ? (
          <div className="py-20 text-center rounded-2xl border-2 border-dashed border-border bg-card/50">
            <RefreshCcw className="h-12 w-12 mb-3 mx-auto text-blue-100 animate-spin" />
            <p className="font-medium text-muted-foreground">Loading automation registers...</p>
          </div>
        ) : automations.length === 0 ? (
          <div className="py-20 text-center rounded-2xl border-2 border-dashed border-border bg-card/50">
            <Zap className="h-12 w-12 mb-3 mx-auto text-muted-foreground/70" />
            <p className="font-medium text-muted-foreground">No automation flows are currently active.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
            {automations.map((automation) => (
              <Card key={automation.id} className="overflow-hidden border-border hover:border-blue-300 transition-colors shadow-none rounded-2xl bg-card">
                <CardContent className="p-0">
                  <div className="p-5 space-y-4">
                    <div className="flex items-start justify-between">
                      <div className="space-y-1.5 flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="m3-title-sm !text-sm !font-bold truncate max-w-[200px]">{automation.name}</h3>
                          <Badge variant="outline" className="rounded-lg bg-blue-50 border-blue-100 text-blue-600 font-bold text-[10px] uppercase">
                            {automation.type}
                          </Badge>
                          <Badge variant="outline" className="rounded-lg bg-muted border-border text-muted-foreground font-bold text-[10px] uppercase">
                            {automation.channel}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground line-clamp-1 italic">
                          "{automation.content}"
                        </p>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <Switch 
                          checked={automation.isActive} 
                          onCheckedChange={() => toggleAutomation(automation)}
                          className="data-[state=checked]:bg-emerald-500"
                        />
                        <span className={cn(
                          "text-[9px] font-bold uppercase tracking-wider",
                          automation.isActive ? "text-emerald-600" : "text-muted-foreground"
                        )}>
                          {automation.isActive ? "Online" : "Paused"}
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 mt-2">
                      <div className="bg-muted p-3 rounded-xl border border-border">
                        <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest mb-1">Execution Metrics</p>
                        <div className="flex items-baseline gap-1">
                          <span className="text-lg font-bold text-foreground">324</span>
                          <span className="text-[10px] text-muted-foreground">triggers</span>
                        </div>
                      </div>
                      <div className="bg-muted p-3 rounded-xl border border-border">
                        <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest mb-1">Last Transmission</p>
                        <div className="flex items-center gap-1.5 text-foreground">
                          <Clock className="h-3 w-3" />
                          <span className="text-[10px] font-bold">
                            {automation.lastRunAt ? new Date(automation.lastRunAt).toLocaleDateString() : "Pending"}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-muted px-5 py-3 flex items-center justify-between border-t border-border">
                    <div className="flex gap-2">
                      <Button 
                        size="sm" 
                        variant="ghost" 
                        onClick={() => openEditAutomation(automation)}
                        className="h-8 rounded-lg text-muted-foreground hover:text-blue-600 hover:bg-blue-50 text-xs font-bold"
                      >
                        <Settings className="h-3.5 w-3.5 mr-1.5" />
                        Configure
                      </Button>
                    </div>
                    <div className="flex items-center gap-2">
                      {automation.isActive ? (
                        <div className="flex items-center gap-1.5 text-emerald-600">
                          <Zap className="h-3 w-3 animate-pulse" />
                          <span className="text-[10px] font-bold font-mono">FLOW ACTIVE</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1.5 text-muted-foreground">
                          <Power className="h-3 w-3" />
                          <span className="text-[10px] font-bold font-mono">HIBERNATED</span>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      <Dialog open={automationOpen} onOpenChange={setAutomationOpen}>
        <DialogContent className="max-w-3xl rounded-2xl border-none shadow-2xl p-0 overflow-hidden">
          <div className="bg-primary p-6 text-primary-foreground">
            <h2 className="m3-title-lg flex items-center gap-2">
              <Zap className="h-6 w-6" />
              {editingAutomationId ? "Update Workflow Logic" : "Design New Automation Flow"}
            </h2>
            <p className="text-primary-foreground/80 text-xs mt-1 font-medium italic">
              Establish rules for automated member outreach based on lifecycle events.
            </p>
          </div>
          
          <ScrollArea className="max-h-[80vh]">
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="m3-label">Event Trigger Type</Label>
                  <Select
                    value={automationForm.type}
                    onValueChange={(value) =>
                      setAutomationForm((prev) => ({
                        ...prev,
                        type: value as MarketingAutomationType,
                      }))
                    }
                  >
                    <SelectTrigger className="h-12 rounded-xl border-border bg-muted/50 focus:ring-blue-600 font-medium font-mono text-xs uppercase tracking-tight">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl">
                      {marketingAutomationTypeOptions.map((option) => (
                        <SelectItem key={option} value={option} className="rounded-lg">{option}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="m3-label">Flow Label</Label>
                  <Input
                    className="h-12 rounded-xl border-border bg-muted/50 focus:ring-blue-600 font-medium placeholder:text-muted-foreground/70"
                    placeholder="e.g., Anniversary Celebration"
                    value={automationForm.name}
                    onChange={(event) =>
                      setAutomationForm((prev) => ({ ...prev, name: event.target.value }))
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label className="m3-label">Communication Channel</Label>
                  <Select
                    value={automationForm.channel}
                    onValueChange={(value) =>
                      setAutomationForm((prev) => ({ ...prev, channel: value as NotificationType }))
                    }
                  >
                    <SelectTrigger className="h-12 rounded-xl border-border bg-muted/50 focus:ring-blue-600 font-medium font-mono text-xs uppercase tracking-tight">
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
                  <Label className="m3-label">Content Blueprint</Label>
                  <Select
                    value={automationForm.templateId || "NONE"}
                    onValueChange={(value) =>
                      setAutomationForm((prev) => ({
                        ...prev,
                        templateId: value === "NONE" ? "" : value,
                      }))
                    }
                  >
                    <SelectTrigger className="h-12 rounded-xl border-border bg-muted/50 focus:ring-blue-600 font-medium font-mono text-xs uppercase tracking-tight">
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
                  <Label className="m3-label">Transmission Subject</Label>
                  <Input
                    className="h-12 rounded-xl border-border bg-muted/50 focus:ring-blue-600 font-medium placeholder:text-muted-foreground/70"
                    placeholder="Subject line for automation..."
                    value={automationForm.subject}
                    onChange={(event) =>
                      setAutomationForm((prev) => ({ ...prev, subject: event.target.value }))
                    }
                  />
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label className="m3-label">Workflow Payload</Label>
                  <Textarea
                    className="min-h-[120px] rounded-xl border-border bg-muted/50 focus:ring-blue-600 font-medium leading-relaxed"
                    placeholder="The primary message for this automation flow..."
                    value={automationForm.content}
                    onChange={(event) =>
                      setAutomationForm((prev) => ({ ...prev, content: event.target.value }))
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label className="m3-label">Dormancy Threshold (Days)</Label>
                  <Input
                    className="h-12 rounded-xl border-border bg-muted/50 focus:ring-blue-600 font-medium font-mono"
                    type="number"
                    min={1}
                    value={automationForm.inactiveDays}
                    onChange={(event) =>
                      setAutomationForm((prev) => ({ ...prev, inactiveDays: event.target.value }))
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label className="m3-label">Linked Session ID</Label>
                  <Input
                    className="h-12 rounded-xl border-border bg-muted/50 focus:ring-blue-600 font-medium"
                    placeholder="Optional UUID for class triggers"
                    value={automationForm.classId}
                    onChange={(event) =>
                      setAutomationForm((prev) => ({ ...prev, classId: event.target.value }))
                    }
                  />
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label className="m3-label">Exclusive Value Proposition</Label>
                  <Input
                    className="h-12 rounded-xl border-border bg-muted/50 focus:ring-blue-600 font-medium placeholder:text-muted-foreground/70"
                    placeholder="e.g., RECOVER20 code"
                    value={automationForm.specialOffer}
                    onChange={(event) =>
                      setAutomationForm((prev) => ({ ...prev, specialOffer: event.target.value }))
                    }
                  />
                </div>
              </div>
              
              <div className="pt-4 flex gap-3">
                <Button 
                  variant="outline" 
                  className="flex-1 h-12 rounded-xl border-border font-bold text-muted-foreground"
                  onClick={() => setAutomationOpen(false)}
                >
                  Discard Flow
                </Button>
                <Button 
                  className="flex-[2] h-12 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold shadow-lg shadow-blue-100 transition-all active:scale-95"
                  onClick={handleSubmitAutomation}
                >
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                  Commit Workflow Logic
                </Button>
              </div>
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default MarketingAutomations;
