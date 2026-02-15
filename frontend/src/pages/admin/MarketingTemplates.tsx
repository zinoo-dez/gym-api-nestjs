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
import { Plus, RefreshCcw } from "lucide-react";
import { toast } from "sonner";

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
    <div className="m3-admin-page">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Marketing Templates</h1>
          <p className="text-muted-foreground">
            Manage reusable campaign and automation content blocks.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={loadTemplates} disabled={loading}>
            <RefreshCcw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button onClick={openNewTemplate}>
            <Plus className="h-4 w-4 mr-2" />
            New Template
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold">Template Library</h2>
        </CardHeader>
        <CardContent className="space-y-3">
          {loading ? (
            <p className="text-muted-foreground">Loading templates...</p>
          ) : templates.length === 0 ? (
            <p className="text-muted-foreground">No templates yet.</p>
          ) : (
            templates.map((template) => (
              <Card key={template.id}>
                <CardContent className="p-4 space-y-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-medium">{template.name}</p>
                    <Badge variant="outline">{template.type}</Badge>
                    <Badge variant={template.isActive ? "default" : "secondary"}>
                      {template.isActive ? "ACTIVE" : "INACTIVE"}
                    </Badge>
                  </div>
                  {template.subject && (
                    <p className="text-sm text-muted-foreground">Subject: {template.subject}</p>
                  )}
                  <p className="text-sm text-muted-foreground line-clamp-3">{template.body}</p>
                  <Button size="sm" variant="outline" onClick={() => openEditTemplate(template)}>
                    Edit
                  </Button>
                </CardContent>
              </Card>
            ))
          )}
        </CardContent>
      </Card>

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
                onChange={(event) =>
                  setTemplateForm((prev) => ({ ...prev, name: event.target.value }))
                }
              />
            </div>
            <div className="space-y-2">
              <Label>Channel</Label>
              <Select
                value={templateForm.type}
                onValueChange={(value) =>
                  setTemplateForm((prev) => ({ ...prev, type: value as NotificationType }))
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
              <Label>Subject (optional)</Label>
              <Input
                value={templateForm.subject}
                onChange={(event) =>
                  setTemplateForm((prev) => ({ ...prev, subject: event.target.value }))
                }
              />
            </div>
            <div className="space-y-2">
              <Label>Body</Label>
              <Textarea
                value={templateForm.body}
                onChange={(event) =>
                  setTemplateForm((prev) => ({ ...prev, body: event.target.value }))
                }
              />
            </div>
            <Button className="w-full" onClick={handleSubmitTemplate}>
              {editingTemplateId ? "Update Template" : "Create Template"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default MarketingTemplates;
