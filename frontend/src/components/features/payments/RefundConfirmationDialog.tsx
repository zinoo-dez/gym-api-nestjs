import * as Dialog from "@radix-ui/react-dialog";
import { AlertTriangle, X } from "lucide-react";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/Button";
import { Textarea } from "@/components/ui/Textarea";

interface RefundConfirmationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  transactionLabel?: string;
  isSubmitting?: boolean;
  onConfirm: (reason: string) => Promise<void> | void;
}

export function RefundConfirmationDialog({
  open,
  onOpenChange,
  transactionLabel,
  isSubmitting = false,
  onConfirm,
}: RefundConfirmationDialogProps) {
  const [reason, setReason] = useState("");
  const [reasonError, setReasonError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) {
      setReason("");
      setReasonError(null);
    }
  }, [open]);

  const handleConfirm = async () => {
    const trimmedReason = reason.trim();

    if (trimmedReason.length === 0) {
      setReasonError("Refund reason is required.");
      return;
    }

    setReasonError(null);

    try {
      await onConfirm(trimmedReason);
      onOpenChange(false);
    } catch {
      // Keep dialog open so the user can retry.
    }
  };

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm" />

        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 w-[calc(100%-2rem)] max-w-lg -translate-x-1/2 -translate-y-1/2 rounded-lg border bg-card text-card-foreground shadow-lg">
          <div className="flex items-start justify-between border-b px-4 py-4 md:px-6">
            <div className="flex items-start gap-3">
              <div className="flex size-9 items-center justify-center rounded-full bg-warning/20 text-warning">
                <AlertTriangle className="size-5" />
              </div>
              <div className="space-y-1">
                <Dialog.Title className="text-lg font-semibold tracking-tight text-foreground">
                  Process Refund
                </Dialog.Title>
                <Dialog.Description className="text-sm text-muted-foreground">
                  This action will reverse the payment and update financial records.
                  {transactionLabel ? ` (${transactionLabel})` : ""}
                </Dialog.Description>
              </div>
            </div>

            <Dialog.Close asChild>
              <button
                type="button"
                className="rounded-md p-2 text-muted-foreground transition-colors hover:bg-muted/60 hover:text-foreground"
                aria-label="Close"
              >
                <X className="size-5" />
              </button>
            </Dialog.Close>
          </div>

          <div className="space-y-2 p-4 md:p-6">
            <label htmlFor="refund-reason" className="text-sm font-medium text-foreground">
              Reason for refund <span className="text-danger">*</span>
            </label>
            <Textarea
              id="refund-reason"
              value={reason}
              onChange={(event) => {
                setReason(event.target.value);
                if (reasonError) {
                  setReasonError(null);
                }
              }}
              placeholder="Explain the reason for this refund"
              hasError={Boolean(reasonError)}
              className="min-h-28"
            />
            {reasonError ? <p className="error-text">{reasonError}</p> : null}
          </div>

          <div className="flex items-center justify-end gap-2 border-t px-4 py-4 md:px-6">
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button
              type="button"
              variant="danger"
              onClick={() => void handleConfirm()}
              disabled={isSubmitting}
            >
              {isSubmitting ? "Processing..." : "Confirm Refund"}
            </Button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
