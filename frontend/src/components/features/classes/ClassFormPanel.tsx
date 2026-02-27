import { useEffect, useMemo, useState, type FormEvent } from "react";
import { X } from "lucide-react";

import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Select } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";
import { ManagementPanel } from "@/components/features/people/ManagementPanel";
import {
  CLASS_CATEGORY_OPTIONS,
  DEFAULT_CLASS_CATEGORY,
  DEFAULT_OCCURRENCES,
  RECURRENCE_DAY_OPTIONS,
  buildWeeklyRecurrenceRule,
  fromDateTimeLocalValue,
  getDefaultRepeatDay,
  parseRecurrenceDays,
  toDateTimeLocalValue,
  type ClassFormMode,
  type ClassFormValues,
  type ClassSession,
  type RecurrenceDayCode,
  type SaveClassInput,
} from "@/features/classes";
import type { TrainerProfile } from "@/features/people";

interface ClassFormPanelProps {
  open: boolean;
  mode: ClassFormMode;
  classSession: ClassSession | null;
  instructors: TrainerProfile[];
  isSubmitting: boolean;
  onClose: () => void;
  onSubmit: (payload: SaveClassInput) => Promise<void>;
  isMobile?: boolean;
}

type FormErrors = Partial<Record<keyof ClassFormValues, string>>;

const buildInitialValues = (classSession: ClassSession | null): ClassFormValues => {
  if (!classSession) {
    return {
      className: "",
      description: "",
      category: DEFAULT_CLASS_CATEGORY,
      instructorId: "",
      startTime: "",
      endTime: "",
      maxCapacity: "20",
      repeating: false,
      repeatDays: ["MO"],
      occurrences: String(DEFAULT_OCCURRENCES),
    };
  }

  const startTimeLocal = toDateTimeLocalValue(classSession.startTime);
  const parsedDays = parseRecurrenceDays(classSession.recurrenceRule);

  return {
    className: classSession.className,
    description: classSession.description ?? "",
    category: classSession.category,
    instructorId: classSession.instructorId,
    startTime: startTimeLocal,
    endTime: toDateTimeLocalValue(classSession.endTime),
    maxCapacity: String(classSession.maxCapacity),
    repeating: Boolean(classSession.recurrenceRule),
    repeatDays: parsedDays.length > 0 ? parsedDays : [getDefaultRepeatDay(startTimeLocal)],
    occurrences: String(classSession.occurrences ?? DEFAULT_OCCURRENCES),
  };
};

export function ClassFormPanel({
  open,
  mode,
  classSession,
  instructors,
  isSubmitting,
  onClose,
  onSubmit,
  isMobile = false,
}: ClassFormPanelProps) {
  const [formValues, setFormValues] = useState<ClassFormValues>(() =>
    buildInitialValues(classSession),
  );
  const [errors, setErrors] = useState<FormErrors>({});

  useEffect(() => {
    if (!open) {
      return;
    }

    setFormValues(buildInitialValues(classSession));
    setErrors({});
  }, [classSession, open]);

  const modalTitle = mode === "create" ? "Create Class Session" : "Edit Class Session";

  const selectedRepeatDays = useMemo(
    () => new Set(formValues.repeatDays),
    [formValues.repeatDays],
  );

  const handleFieldChange = <K extends keyof ClassFormValues>(
    field: K,
    value: ClassFormValues[K],
  ) => {
    setFormValues((current) => ({
      ...current,
      [field]: value,
    }));

    if (errors[field]) {
      setErrors((current) => {
        const next = { ...current };
        delete next[field];
        return next;
      });
    }
  };

  const handleRepeatDayToggle = (day: RecurrenceDayCode) => {
    setFormValues((current) => {
      const exists = current.repeatDays.includes(day);
      const nextDays = exists
        ? current.repeatDays.filter((entry) => entry !== day)
        : [...current.repeatDays, day];

      return {
        ...current,
        repeatDays: nextDays,
      };
    });
  };

  const validate = (): boolean => {
    const nextErrors: FormErrors = {};

    if (formValues.className.trim().length === 0) {
      nextErrors.className = "Class name is required.";
    }

    if (formValues.instructorId.trim().length === 0) {
      nextErrors.instructorId = "Instructor is required.";
    }

    if (formValues.startTime.trim().length === 0) {
      nextErrors.startTime = "Start time is required.";
    }

    if (formValues.endTime.trim().length === 0) {
      nextErrors.endTime = "End time is required.";
    }

    if (formValues.startTime && formValues.endTime) {
      const startDate = new Date(formValues.startTime);
      const endDate = new Date(formValues.endTime);

      if (Number.isNaN(startDate.getTime())) {
        nextErrors.startTime = "Start time is invalid.";
      }

      if (Number.isNaN(endDate.getTime())) {
        nextErrors.endTime = "End time is invalid.";
      }

      if (!Number.isNaN(startDate.getTime()) && !Number.isNaN(endDate.getTime()) && endDate <= startDate) {
        nextErrors.endTime = "End time must be after start time.";
      }
    }

    const capacity = Number.parseInt(formValues.maxCapacity, 10);

    if (!Number.isInteger(capacity) || capacity < 1) {
      nextErrors.maxCapacity = "Maximum capacity must be at least 1.";
    }

    if (formValues.repeating && formValues.repeatDays.length === 0) {
      nextErrors.repeatDays = "Choose at least one repeat day.";
    }

    if (formValues.repeating) {
      const occurrences = Number.parseInt(formValues.occurrences, 10);

      if (!Number.isInteger(occurrences) || occurrences < 1) {
        nextErrors.occurrences = "Occurrences must be at least 1.";
      }
    }

    setErrors(nextErrors);

    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!validate()) {
      return;
    }

    const startTimeIso = fromDateTimeLocalValue(formValues.startTime);
    const endTimeIso = fromDateTimeLocalValue(formValues.endTime);

    const occurrencesValue = Number.parseInt(formValues.occurrences, 10);
    const safeOccurrences =
      Number.isInteger(occurrencesValue) && occurrencesValue > 0
        ? occurrencesValue
        : DEFAULT_OCCURRENCES;

    const recurrenceRule = formValues.repeating
      ? buildWeeklyRecurrenceRule(startTimeIso, formValues.repeatDays, safeOccurrences)
      : undefined;

    await onSubmit({
      className: formValues.className.trim(),
      description: formValues.description.trim() || undefined,
      category: formValues.category,
      instructorId: formValues.instructorId,
      startTime: startTimeIso,
      endTime: endTimeIso,
      maxCapacity: Number.parseInt(formValues.maxCapacity, 10),
      recurrenceRule,
      occurrences: formValues.repeating ? safeOccurrences : undefined,
    });
  };

  if (!open) {
    return null;
  }

  const footer = (
    <div className="flex flex-col gap-2 border-t pt-4 sm:flex-row sm:justify-end">
      <Button type="button" variant="text" onClick={onClose}>
        Cancel
      </Button>
      <Button type="submit" form="class-form" disabled={isSubmitting}>
        {isSubmitting ? "Saving..." : mode === "create" ? "Create Class" : "Save Changes"}
      </Button>
    </div>
  );

  return (
    <ManagementPanel
      open={open}
      onClose={onClose}
      isMobile={isMobile}
      title={modalTitle}
      description="Set class details, instructor assignment, and recurrence."
      footer={footer}
      className="max-w-3xl"
    >
      <form id="class-form" onSubmit={(event) => void handleSubmit(event)}>
        <div className="space-y-6">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="class-name">
                Class Name <span className="text-destructive">*</span>
              </Label>
              <Input
                id="class-name"
                value={formValues.className}
                onChange={(event) => handleFieldChange("className", event.target.value)}
                placeholder="Morning Yoga"
                hasError={Boolean(errors.className)}
              />
              {errors.className ? <p className="error-text">{errors.className}</p> : null}
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="class-description">Description</Label>
              <Textarea
                id="class-description"
                value={formValues.description}
                onChange={(event) => handleFieldChange("description", event.target.value)}
                placeholder="Focus on mobility and breath control."
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="class-category">
                Category <span className="text-destructive">*</span>
              </Label>
              <Select
                id="class-category"
                value={formValues.category}
                onChange={(event) => handleFieldChange("category", event.target.value)}
              >
                {CLASS_CATEGORY_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="class-instructor">
                Instructor <span className="text-destructive">*</span>
              </Label>
              <Select
                id="class-instructor"
                value={formValues.instructorId}
                onChange={(event) => handleFieldChange("instructorId", event.target.value)}
                hasError={Boolean(errors.instructorId)}
              >
                <option value="">Select instructor</option>
                {instructors.map((trainer) => {
                  const fullName = `${trainer.firstName} ${trainer.lastName}`.trim();

                  return (
                    <option key={trainer.id} value={trainer.id}>
                      {fullName}
                    </option>
                  );
                })}
              </Select>
              {errors.instructorId ? <p className="error-text">{errors.instructorId}</p> : null}
            </div>

            <div className="space-y-2">
              <Label htmlFor="class-start-time">
                Start Time <span className="text-destructive">*</span>
              </Label>
              <Input
                id="class-start-time"
                type="datetime-local"
                value={formValues.startTime}
                onChange={(event) => handleFieldChange("startTime", event.target.value)}
                hasError={Boolean(errors.startTime)}
              />
              {errors.startTime ? <p className="error-text">{errors.startTime}</p> : null}
            </div>

            <div className="space-y-2">
              <Label htmlFor="class-end-time">
                End Time <span className="text-destructive">*</span>
              </Label>
              <Input
                id="class-end-time"
                type="datetime-local"
                value={formValues.endTime}
                onChange={(event) => handleFieldChange("endTime", event.target.value)}
                hasError={Boolean(errors.endTime)}
              />
              {errors.endTime ? <p className="error-text">{errors.endTime}</p> : null}
            </div>

            <div className="space-y-2">
              <Label htmlFor="class-capacity">
                Maximum Capacity <span className="text-destructive">*</span>
              </Label>
              <Input
                id="class-capacity"
                type="number"
                min={1}
                value={formValues.maxCapacity}
                onChange={(event) => handleFieldChange("maxCapacity", event.target.value)}
                hasError={Boolean(errors.maxCapacity)}
              />
              {errors.maxCapacity ? <p className="error-text">{errors.maxCapacity}</p> : null}
            </div>
          </div>

          <div className="space-y-4 rounded-lg border p-4">
            <label className="flex items-center gap-3 text-sm font-medium text-foreground">
              <input
                type="checkbox"
                checked={formValues.repeating}
                onChange={(event) => handleFieldChange("repeating", event.target.checked)}
                className="size-4 rounded border-input text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              />
              Repeat Weekly
            </label>

            {formValues.repeating ? (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>
                    Repeat Days <span className="text-destructive">*</span>
                  </Label>
                  <div className="flex flex-wrap gap-2">
                    {RECURRENCE_DAY_OPTIONS.map((dayOption) => {
                      const isSelected = selectedRepeatDays.has(dayOption.code);

                      return (
                        <Button
                          key={dayOption.code}
                          type="button"
                          size="sm"
                          variant={isSelected ? "filled" : "outlined"}
                          onClick={() => handleRepeatDayToggle(dayOption.code)}
                        >
                          {dayOption.label}
                        </Button>
                      );
                    })}
                  </div>
                  {errors.repeatDays ? <p className="error-text">{errors.repeatDays}</p> : null}
                </div>

                <div className="max-w-xs space-y-2">
                  <Label htmlFor="class-occurrences">
                    Number Of Sessions <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="class-occurrences"
                    type="number"
                    min={1}
                    value={formValues.occurrences}
                    onChange={(event) => handleFieldChange("occurrences", event.target.value)}
                    hasError={Boolean(errors.occurrences)}
                  />
                  {errors.occurrences ? <p className="error-text">{errors.occurrences}</p> : null}
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </form>
    </ManagementPanel>
  );
}
