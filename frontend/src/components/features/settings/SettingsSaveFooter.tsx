import { Save } from "lucide-react";

import { Button } from "@/components/ui/Button";

interface SettingsSaveFooterProps {
  visible: boolean;
  hasUnsavedChanges: boolean;
  isSaving: boolean;
  onSave: () => void;
}

export function SettingsSaveFooter({
  visible,
  hasUnsavedChanges,
  isSaving,
  onSave,
}: SettingsSaveFooterProps) {
  if (!visible) {
    return null;
  }

  return (
    <div className="fixed inset-x-0 bottom-0 z-20 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <div className="mx-auto flex w-full max-w-[1400px] flex-wrap items-center justify-between gap-3 p-4 md:px-6 lg:px-8">
        <p className="text-sm text-muted-foreground">
          {hasUnsavedChanges
            ? "You have unsaved settings changes."
            : "No pending settings changes."}
        </p>

        <Button
          type="button"
          onClick={onSave}
          disabled={!hasUnsavedChanges || isSaving}
          className="min-w-[150px]"
        >
          <Save className="size-4" />
          {isSaving ? "Saving..." : "Save Changes"}
        </Button>
      </div>
    </div>
  );
}
