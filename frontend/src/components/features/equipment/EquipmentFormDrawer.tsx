import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import {
  EQUIPMENT_CATEGORIES,
  EQUIPMENT_CATEGORY_LABELS,
  EQUIPMENT_CONDITIONS,
  EQUIPMENT_CONDITION_LABELS,
  MAINTENANCE_FREQUENCIES,
  MAINTENANCE_FREQUENCY_LABELS,
  EquipmentFormValues,
} from "@/features/equipment";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Select } from "@/components/ui/Select";
import { SlidePanel } from "@/components/ui/SlidePanel";
import { Textarea } from "@/components/ui/Textarea";

const equipmentFormSchema = z
  .object({
    name: z.string().trim().min(1, "Equipment name is required"),
    category: z.enum(EQUIPMENT_CATEGORIES),
    brandModel: z.string().trim().min(1, "Brand / model is required"),
    serialNumber: z.string().trim().optional().default(""),
    purchaseDate: z.string().min(1, "Purchase date is required"),
    purchaseCost: z.coerce.number().min(0, "Purchase cost must be 0 or higher"),
    warrantyExpiryDate: z.string().min(1, "Warranty expiry date is required"),
    condition: z.enum(EQUIPMENT_CONDITIONS),
    maintenanceFrequency: z.enum(MAINTENANCE_FREQUENCIES),
    lastMaintenanceDate: z.string().min(1, "Last maintenance date is required"),
    assignedArea: z.string().trim().min(1, "Assigned area is required"),
    notes: z.string().trim().optional().default(""),
    isActive: z.boolean(),
  })
  .superRefine((values, ctx) => {
    const purchaseDate = new Date(values.purchaseDate);
    const warrantyDate = new Date(values.warrantyExpiryDate);
    const lastMaintenanceDate = new Date(values.lastMaintenanceDate);

    if (Number.isNaN(purchaseDate.getTime())) {
      return;
    }

    if (Number.isNaN(warrantyDate.getTime()) || warrantyDate < purchaseDate) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Warranty expiry date must be on or after purchase date",
        path: ["warrantyExpiryDate"],
      });
    }

    if (Number.isNaN(lastMaintenanceDate.getTime()) || lastMaintenanceDate < purchaseDate) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Last maintenance date must be on or after purchase date",
        path: ["lastMaintenanceDate"],
      });
    }
  });

interface EquipmentFormDrawerProps {
  open: boolean;
  isMobile: boolean;
  mode: "add" | "edit";
  initialValues: EquipmentFormValues;
  onClose: () => void;
  onSubmit: (values: EquipmentFormValues) => void | Promise<void>;
}

export function EquipmentFormDrawer({
  open,
  isMobile,
  mode,
  initialValues,
  onClose,
  onSubmit,
}: EquipmentFormDrawerProps) {
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isSubmitting, isValid },
  } = useForm<EquipmentFormValues>({
    resolver: zodResolver(equipmentFormSchema),
    mode: "onChange",
    defaultValues: initialValues,
  });

  useEffect(() => {
    if (open) {
      reset(initialValues);
    }
  }, [initialValues, open, reset]);

  const isActive = watch("isActive");

  const footer = (
    <div className="flex justify-end gap-2">
      <Button type="button" variant="ghost" onClick={onClose}>
        Cancel
      </Button>
      <Button type="submit" form="equipment-form" disabled={!isValid || isSubmitting}>
        {mode === "add" ? "Add Equipment" : "Save Changes"}
      </Button>
    </div>
  );

  return (
    <SlidePanel
      open={open}
      onClose={onClose}
      isMobile={isMobile}
      title={mode === "add" ? "Add Equipment" : "Edit Equipment"}
      description="Update asset details, maintenance schedule, and warranty information"
      footer={footer}
      className="max-w-3xl"
    >
      <form id="equipment-form" className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
        <section className="rounded-lg border bg-card p-4">
          <h3 className="card-title">Basic Info</h3>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="name">
                Equipment Name <span className="text-danger">*</span>
              </Label>
              <Input id="name" {...register("name")} hasError={Boolean(errors.name)} />
              {errors.name ? <p className="error-text">{errors.name.message}</p> : null}
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">
                Category <span className="text-danger">*</span>
              </Label>
              <Select id="category" {...register("category")} hasError={Boolean(errors.category)}>
                {EQUIPMENT_CATEGORIES.map((category) => (
                  <option key={category} value={category}>
                    {EQUIPMENT_CATEGORY_LABELS[category]}
                  </option>
                ))}
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="condition">
                Condition Status <span className="text-danger">*</span>
              </Label>
              <Select id="condition" {...register("condition")} hasError={Boolean(errors.condition)}>
                {EQUIPMENT_CONDITIONS.map((condition) => (
                  <option key={condition} value={condition}>
                    {EQUIPMENT_CONDITION_LABELS[condition]}
                  </option>
                ))}
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="brandModel">
                Brand / Model <span className="text-danger">*</span>
              </Label>
              <Input
                id="brandModel"
                {...register("brandModel")}
                hasError={Boolean(errors.brandModel)}
              />
              {errors.brandModel ? <p className="error-text">{errors.brandModel.message}</p> : null}
            </div>

            <div className="space-y-2">
              <Label htmlFor="serialNumber">Serial Number</Label>
              <Input id="serialNumber" {...register("serialNumber")} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="assignedArea">
                Assigned Area <span className="text-danger">*</span>
              </Label>
              <Input
                id="assignedArea"
                {...register("assignedArea")}
                hasError={Boolean(errors.assignedArea)}
              />
              {errors.assignedArea ? <p className="error-text">{errors.assignedArea.message}</p> : null}
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select
                id="status"
                value={isActive ? "active" : "retired"}
                onChange={(event) => {
                  setValue("isActive", event.target.value === "active", {
                    shouldDirty: true,
                    shouldValidate: true,
                  });
                }}
              >
                <option value="active">Active</option>
                <option value="retired">Retired</option>
              </Select>
            </div>
          </div>
        </section>

        <section className="rounded-lg border bg-card p-4">
          <h3 className="card-title">Purchase & Warranty</h3>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="purchaseDate">
                Purchase Date <span className="text-danger">*</span>
              </Label>
              <Input
                id="purchaseDate"
                type="date"
                {...register("purchaseDate")}
                hasError={Boolean(errors.purchaseDate)}
              />
              {errors.purchaseDate ? <p className="error-text">{errors.purchaseDate.message}</p> : null}
            </div>

            <div className="space-y-2">
              <Label htmlFor="purchaseCost">
                Purchase Cost (USD) <span className="text-danger">*</span>
              </Label>
              <Input
                id="purchaseCost"
                type="number"
                min={0}
                step="1"
                {...register("purchaseCost", { valueAsNumber: true })}
                hasError={Boolean(errors.purchaseCost)}
              />
              {errors.purchaseCost ? <p className="error-text">{errors.purchaseCost.message}</p> : null}
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="warrantyExpiryDate">
                Warranty Expiry Date <span className="text-danger">*</span>
              </Label>
              <Input
                id="warrantyExpiryDate"
                type="date"
                {...register("warrantyExpiryDate")}
                hasError={Boolean(errors.warrantyExpiryDate)}
              />
              {errors.warrantyExpiryDate ? (
                <p className="error-text">{errors.warrantyExpiryDate.message}</p>
              ) : null}
            </div>
          </div>
        </section>

        <section className="rounded-lg border bg-card p-4">
          <h3 className="card-title">Maintenance Setup</h3>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="maintenanceFrequency">
                Maintenance Frequency <span className="text-danger">*</span>
              </Label>
              <Select
                id="maintenanceFrequency"
                {...register("maintenanceFrequency")}
                hasError={Boolean(errors.maintenanceFrequency)}
              >
                {MAINTENANCE_FREQUENCIES.map((frequencyOption) => (
                  <option key={frequencyOption} value={frequencyOption}>
                    {MAINTENANCE_FREQUENCY_LABELS[frequencyOption]}
                  </option>
                ))}
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="lastMaintenanceDate">
                Last Maintenance Date <span className="text-danger">*</span>
              </Label>
              <Input
                id="lastMaintenanceDate"
                type="date"
                {...register("lastMaintenanceDate")}
                hasError={Boolean(errors.lastMaintenanceDate)}
              />
              {errors.lastMaintenanceDate ? (
                <p className="error-text">{errors.lastMaintenanceDate.message}</p>
              ) : null}
            </div>
          </div>

          <p className="mt-3 text-sm text-muted-foreground">
            Next maintenance due is auto-calculated when this record is saved.
          </p>
        </section>

        <section className="rounded-lg border bg-card p-4">
          <h3 className="card-title">Notes</h3>
          <div className="mt-4 space-y-2">
            <Label htmlFor="notes">Operational Notes</Label>
            <Textarea id="notes" {...register("notes")} placeholder="Optional notes for technicians and admins" />
          </div>
        </section>
      </form>
    </SlidePanel>
  );
}
