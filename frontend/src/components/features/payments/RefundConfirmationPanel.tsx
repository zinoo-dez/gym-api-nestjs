import { ManagementPanel } from "@/components/features/people/ManagementPanel";
import { MaterialIcon } from "@/components/ui/MaterialIcon";
import { Button } from "@/components/ui/Button";
import { Label } from "@/components/ui/Label";
import { Textarea } from "@/components/ui/Textarea";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";

interface RefundConfirmationPanelProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  paymentId: string;
  amount: number;
  transactionLabel?: string;
  onConfirm: (reason: string) => Promise<void>;
  isSubmitting?: boolean;
  isMobile?: boolean;
}

export function RefundConfirmationPanel({
  open,
  onOpenChange,
  paymentId: _paymentId,
  amount,
  transactionLabel,
  onConfirm,
  isSubmitting = false,
  isMobile = false,
}: RefundConfirmationPanelProps) {
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
      // Keep panel open so the user can retry.
    }
  };

  const footer = (
    <div className="flex items-center justify-end gap-2">
      <Button
        type="button"
        variant="text"
        onClick={() => onOpenChange(false)}
        disabled={isSubmitting}
      >
        Cancel
      </Button>
      <Button
        type="button"
        variant="error"
        onClick={handleConfirm}
        disabled={isSubmitting}
      >
        {isSubmitting ? "Processing..." : "Confirm Refund"}
      </Button>
    </div>
  );

  return (
    <ManagementPanel
      open={open}
      onClose={() => onOpenChange(false)}
      isMobile={isMobile}
      title="Confirm Refund"
      description={`Refunding will void the transaction and reverse the payment entry.${transactionLabel ? ` (${transactionLabel})` : ""}`}
      footer={footer}
      className="max-w-md"
    >
      <div className="space-y-6">
        <div className="flex items-start gap-3 rounded-lg bg-destructive/10 p-4 text-destructive">
          <MaterialIcon icon="warning" className="size-5 shrink-0" />
          <div className="space-y-1">
            <h4 className="text-sm font-semibold">Refund Warning</h4>
            <p className="text-xs leading-relaxed">
              This action cannot be undone. The amount of{" "}
              <span className="font-bold">
                {new Intl.NumberFormat("en-US", {
                  style: "currency",
                  currency: "USD",
                }).format(amount)}
              </span>{" "}
              will be recorded as a refund in the system.
            </p>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="refund-reason">
            Reason for Refund <span className="text-destructive">*</span>
          </Label>
          <Textarea
            id="refund-reason"
            placeholder="e.g., Accidentally selected wrong payment method or client requested cancellation."
            className="min-h-24"
            value={reason}
            onChange={(event) => setReason(event.target.value)}
          />
          <p className="text-[10px] text-muted-foreground">
            Please provide a valid reason for auditing purposes.
          </p>
        </div>
      </div>
    </ManagementPanel>
  );
}
