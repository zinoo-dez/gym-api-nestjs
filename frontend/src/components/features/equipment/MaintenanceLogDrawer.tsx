import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import {
  MAINTENANCE_LOG_TYPES,
  MAINTENANCE_LOG_TYPE_LABELS,
  MaintenanceLogFormValues,
  EquipmentRecord,
  getDefaultLogFormValues,
} from "@/features/equipment";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Select } from "@/components/ui/Select";
import { SlidePanel } from "@/components/ui/SlidePanel";
import { Textarea } from "@/components/ui/Textarea";

const maintenanceLogSchema = z.object({
  date: z.string().min(1, "Date is required"),
  type: z.enum(MAINTENANCE_LOG_TYPES),
  description: z.string().trim().min(1, "Description is required"),
  cost: z.coerce.number().min(0, "Cost must be 0 or higher"),
  performedBy: z.string().trim().min(1, "Performed by is required"),
  nextDueDate: z.string().optional(),
});

interface MaintenanceLogDrawerProps {
  open: boolean;
  isMobile: boolean;
  equipment: EquipmentRecord | null;
  onClose: () => void;
  onSubmit: (values: MaintenanceLogFormValues) => void | Promise<void>;
}

export function MaintenanceLogDrawer({
  open,
  isMobile,
  equipment,
  onClose,
  onSubmit,
}: MaintenanceLogDrawerProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting, isValid },
  } = useForm<MaintenanceLogFormValues>({
    resolver: zodResolver(maintenanceLogSchema),
    mode: "onChange",
    defaultValues: getDefaultLogFormValues(),
  });

  useEffect(() => {
    if (open) {
      reset(getDefaultLogFormValues());
    }
  }, [open, reset]);

  if (!equipment) {
    return null;
  }

  const footer = (
    <div className="flex justify-end gap-2">
      <Button type="button" variant="ghost" onClick={onClose}>
        Cancel
      </Button>
      <Button type="submit" form="maintenance-log-form" disabled={!isValid || isSubmitting}>
        Save Log
      </Button>
    </div>
  );

  return (
    <SlidePanel
      open={open}
      onClose={onClose}
      isMobile={isMobile}
      title="Log Maintenance"
      description={`${equipment.name} • ${equipment.brandModel}`}
      footer={footer}
      className="max-w-xl"
    >
      <form id="maintenance-log-form" className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
        <div className="space-y-2">
          <Label htmlFor="maintenance-date">
            Date <span className="text-danger">*</span>
          </Label>
          <Input
            id="maintenance-date"
            type="date"
            {...register("date")}
            hasError={Boolean(errors.date)}
          />
          {errors.date ? <p className="error-text">{errors.date.message}</p> : null}
        </div>

        <div className="space-y-2">
          <Label htmlFor="maintenance-type">
            Type <span className="text-danger">*</span>
          </Label>
          <Select id="maintenance-type" {...register("type")} hasError={Boolean(errors.type)}>
            {MAINTENANCE_LOG_TYPES.map((typeOption) => (
              <option key={typeOption} value={typeOption}>
                {MAINTENANCE_LOG_TYPE_LABELS[typeOption]}
              </option>
            ))}
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="maintenance-description">
            Description <span className="text-danger">*</span>
          </Label>
          <Textarea
            id="maintenance-description"
            {...register("description")}
            hasError={Boolean(errors.description)}
            placeholder="What was done during this maintenance event?"
          />
          {errors.description ? <p className="error-text">{errors.description.message}</p> : null}
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="maintenance-cost">
              Cost (USD) <span className="text-danger">*</span>
            </Label>
            <Input
              id="maintenance-cost"
              type="number"
              min={0}
              step="1"
              {...register("cost", { valueAsNumber: true })}
              hasError={Boolean(errors.cost)}
            />
            {errors.cost ? <p className="error-text">{errors.cost.message}</p> : null}
          </div>

          <div className="space-y-2">
            <Label htmlFor="maintenance-performed-by">
              Performed By <span className="text-danger">*</span>
            </Label>
            <Input
              id="maintenance-performed-by"
              {...register("performedBy")}
              hasError={Boolean(errors.performedBy)}
            />
            {errors.performedBy ? <p className="error-text">{errors.performedBy.message}</p> : null}
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="maintenance-next-due">Next Due Date (Optional Override)</Label>
          <Input id="maintenance-next-due" type="date" {...register("nextDueDate")} />
          <p className="text-xs text-muted-foreground">
            Leave blank to auto-calculate based on the maintenance frequency.
          </p>
        </div>
      </form>
    </SlidePanel>
  );
}
