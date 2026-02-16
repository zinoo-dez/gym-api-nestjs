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
  type MarketingTemplate,
  type NotificationType,
} from "@/services/marketing.service";
import { defaultTemplateForm, marketingChannelOptions } from "./marketing-shared";
import { Plus, RefreshCcw, Layout, Search, FileText, Edit2, CheckCircle, Clock } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";

const MarketingTemplates = () => {
  const [loading, setLoading] = useState(true);
  const [templates, setTemplates] = useState<MarketingTemplate[]>([]);

  const [templateOpen, setTemplateOpen] = useState(false);
  const [editingTemplateId, setEditingTemplateId] = useState<string | null>(null);
  const [templateForm, setTemplateForm] = useState(defaultTemplateForm);

  const loadTemplates = useCallback(async () => {
    setLoading(true);
    try {
      const templateRows = await marketingService.listTemplates();
      setTemplates(Array.isArray(templateRows) ? templateRows : []);
    } catch (error) {
      console.error(error);
      toast.error("Failed to load templates");
      setTemplates([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadTemplates();
  }, [loadTemplates]);

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
      await loadTemplates();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to save template");
    }
  };

  return (
    <div className="space-y-4">
      {/* Header section */}
      <section className="rounded-2xl border border-gray-200 bg-white p-4">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm font-semibold text-gray-900">Communication Blueprints</p>
            <p className="text-sm text-gray-500">
              Manage reusable content blocks and layout definitions for outreach campaigns.
            </p>
          </div>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              onClick={loadTemplates} 
              disabled={loading}
              className="h-10 rounded-xl border-gray-200 font-bold font-mono text-xs hover:bg-gray-50"
            >
              <RefreshCcw className={cn("h-4 w-4 mr-2", loading && "animate-spin")} />
              Sync Library
            </Button>
            <Button 
              onClick={openNewTemplate}
              className="h-10 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold font-mono text-xs shadow-lg shadow-blue-100 transition-all active:scale-95"
            >
              <Plus className="h-4 w-4 mr-2" />
              Design New Blueprint
            </Button>
          </div>
        </div>
      </section>

      {/* Library Grid */}
      <div className="grid gap-4">
        {loading ? (
          <div className="py-20 text-center rounded-2xl border-2 border-dashed border-gray-100 bg-white/50">
            <RefreshCcw className="h-12 w-12 mb-3 mx-auto text-blue-100 animate-spin" />
            <p className="font-medium text-gray-400">Inventorying content templates...</p>
          </div>
        ) : templates.length === 0 ? (
          <div className="py-20 text-center rounded-2xl border-2 border-dashed border-gray-100 bg-white/50">
            <Layout className="h-12 w-12 mb-3 mx-auto text-gray-100" />
            <p className="font-medium text-gray-400">Library is currently empty. Start by designing a blueprint.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {templates.map((template) => (
              <Card key={template.id} className="group relative overflow-hidden border-gray-200 hover:border-blue-300 transition-all shadow-none rounded-2xl bg-white">
                <CardContent className="p-0">
                  <div className="p-5 space-y-4">
                    <div className="flex items-start justify-between">
                      <div className="p-2.5 rounded-xl bg-gray-50 group-hover:bg-blue-50 transition-colors">
                        <FileText className="h-5 w-5 text-gray-400 group-hover:text-blue-600" />
                      </div>
                      <Badge className={cn(
                        "rounded-lg font-bold text-[10px] uppercase tracking-tight px-2 py-0.5",
                        template.isActive ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-100" : "bg-gray-100 text-gray-600 hover:bg-gray-100"
                      )}>
                        {template.isActive ? "PRODUCTION" : "DRAFT"}
                      </Badge>
                    </div>

                    <div className="space-y-1">
                      <h3 className="font-bold text-gray-900 line-clamp-1">{template.name}</h3>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="rounded-lg bg-gray-50 border-gray-100 text-gray-500 font-bold text-[9px] uppercase">
                          {template.type}
                        </Badge>
                        <span className="text-[10px] text-gray-400 font-medium">• Content Blueprint</span>
                      </div>
                    </div>

                    <div className="h-[80px] rounded-xl bg-gray-50/50 p-3 border border-gray-100/50">
                      <p className="text-xs text-gray-500 line-clamp-3 leading-relaxed">
                        {template.body}
                      </p>
                    </div>

                    <div className="pt-2 border-t border-gray-50 flex items-center justify-between">
                      <div className="flex items-center gap-1.5 text-[10px] font-medium text-gray-400">
                        <Clock className="h-3 w-3" />
                        <span>Updated recently</span>
                      </div>
                      <Button 
                        size="sm" 
                        variant="ghost" 
                        onClick={() => openEditTemplate(template)}
                        className="h-8 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50 text-xs font-bold"
                      >
                        <Edit2 className="h-3.5 w-3.5 mr-1.5" />
                        Modify
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      <Dialog open={templateOpen} onOpenChange={setTemplateOpen}>
        <DialogContent className="max-w-2xl rounded-2xl border-none shadow-2xl p-0 overflow-hidden">
          <div className="bg-blue-600 p-6 text-white">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <FileText className="h-6 w-6" />
              {editingTemplateId ? "Refine Blueprint" : "Architect New Template"}
            </h2>
            <p className="text-blue-100 text-xs mt-1 font-medium opacity-80">
              Define reusable content structures for automated and manual outreach.
            </p>
          </div>
          
          <ScrollArea className="max-h-[80vh]">
            <div className="p-6 space-y-5">
              <div className="space-y-2">
                <Label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Blueprint Identifier</Label>
                <Input
                  className="h-12 rounded-xl border-gray-100 bg-gray-50/50 focus:ring-blue-600 font-medium placeholder:text-gray-300"
                  placeholder="e.g., Welcome Email - Casual Tone"
                  value={templateForm.name}
                  onChange={(event) =>
                    setTemplateForm((prev) => ({ ...prev, name: event.target.value }))
                  }
                />
              </div>

              <div className="space-y-2">
                <Label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Transmission Channel</Label>
                <Select
                  value={templateForm.type}
                  onValueChange={(value) =>
                    setTemplateForm((prev) => ({ ...prev, type: value as NotificationType }))
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
                <Label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Subject / Headline</Label>
                <Input
                  className="h-12 rounded-xl border-gray-100 bg-gray-50/50 focus:ring-blue-600 font-medium placeholder:text-gray-300"
                  placeholder="The first thing your members will see..."
                  value={templateForm.subject}
                  onChange={(event) =>
                    setTemplateForm((prev) => ({ ...prev, subject: event.target.value }))
                  }
                />
              </div>

              <div className="space-y-2">
                <Label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Message Body Content</Label>
                <Textarea
                  className="min-h-[160px] rounded-xl border-gray-100 bg-gray-50/50 focus:ring-blue-600 font-medium leading-relaxed"
                  placeholder="Compose your outreach payload. Use {{name}} for dynamic insertion."
                  value={templateForm.body}
                  onChange={(event) =>
                    setTemplateForm((prev) => ({ ...prev, body: event.target.value }))
                  }
                />
              </div>

              <div className="pt-4 flex gap-3">
                <Button 
                  variant="outline" 
                  className="flex-1 h-12 rounded-xl border-gray-200 font-bold text-gray-500"
                  onClick={() => setTemplateOpen(false)}
                >
                  Discard
                </Button>
                <Button 
                  className="flex-[2] h-12 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold shadow-lg shadow-blue-100 transition-all active:scale-95"
                  onClick={handleSubmitTemplate}
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Persist Blueprint
                </Button>
              </div>
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default MarketingTemplates;
