import { useEffect, useMemo, useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import * as Popover from "@radix-ui/react-popover";
import { DayPicker } from "react-day-picker";
import { CalendarDays, ChevronDown, Clock3, X } from "lucide-react";
import { format as formatDate } from "date-fns";

import { cn } from "@/lib/utils";

type PickerMode = "date" | "time" | "datetime";

interface AdaptiveDateTimePickerProps {
  mode: PickerMode;
  value?: string;
  onChange: (value: string) => void;
  hourCycle?: 12 | 24;
  durationFromValue?: string;
  showDurationLabels?: boolean;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

const parseDateOnly = (value?: string) => {
  if (!value) return null;
  const [y, m, d] = value.split("-").map(Number);
  if (!y || !m || !d) return null;
  return new Date(y, m - 1, d, 0, 0, 0, 0);
};

const parseTimeOnly = (value?: string) => {
  if (!value) return null;
  const [h, m] = value.split(":").map(Number);
  if (Number.isNaN(h) || Number.isNaN(m)) return null;
  const date = new Date();
  date.setHours(h, m, 0, 0);
  return date;
};

const parseDateTimeLocal = (value?: string) => {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
};

const parseDurationBase = (value?: string) => {
  if (!value) return null;
  if (value.includes("T")) return parseDateTimeLocal(value);
  return parseTimeOnly(value);
};

const parseByMode = (value: string | undefined, mode: PickerMode) => {
  if (mode === "date") return parseDateOnly(value);
  if (mode === "time") return parseTimeOnly(value);
  return parseDateTimeLocal(value);
};

const formatDateOnly = (date: Date) => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
};

const formatTimeOnly = (date: Date) => {
  const h = String(date.getHours()).padStart(2, "0");
  const m = String(date.getMinutes()).padStart(2, "0");
  return `${h}:${m}`;
};

const formatDateTimeLocal = (date: Date) => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  const h = String(date.getHours()).padStart(2, "0");
  const mm = String(date.getMinutes()).padStart(2, "0");
  return `${y}-${m}-${d}T${h}:${mm}`;
};

const formatByMode = (date: Date, mode: PickerMode) => {
  if (mode === "date") return formatDateOnly(date);
  if (mode === "time") return formatTimeOnly(date);
  return formatDateTimeLocal(date);
};

const humanLabel = (date: Date | null, mode: PickerMode, hourCycle: 12 | 24, placeholder: string) => {
  if (!date) return placeholder;
  if (mode === "date") {
    return new Intl.DateTimeFormat(undefined, { dateStyle: "full" }).format(date);
  }
  if (mode === "time") {
    return new Intl.DateTimeFormat(undefined, {
      hour: "numeric",
      minute: "2-digit",
      hour12: hourCycle === 12,
    }).format(date).toLowerCase();
  }
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    hour: "numeric",
    minute: "2-digit",
    hour12: hourCycle === 12,
  }).format(date).toLowerCase();
};

const useIsMobile = () => {
  const [mobile, setMobile] = useState(false);
  useEffect(() => {
    const media = window.matchMedia("(max-width: 768px)");
    const update = () => setMobile(media.matches);
    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);
  return mobile;
};

const formatTimeLabel = (hours: number, minutes: number, hourCycle: 12 | 24) => {
  if (hourCycle === 24) {
    return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
  }
  const period = hours >= 12 ? "pm" : "am";
  const h12 = hours % 12 || 12;
  return `${h12}:${String(minutes).padStart(2, "0")}${period}`;
};

const getMinutesSinceMidnight = (date: Date) => date.getHours() * 60 + date.getMinutes();

const buildTimeOptions = (hourCycle: 12 | 24, stepMinutes = 15) => {
  const options: Array<{ value: number; label: string }> = [];
  for (let mins = 0; mins < 24 * 60; mins += stepMinutes) {
    const hours = Math.floor(mins / 60);
    const minutes = mins % 60;
    options.push({ value: mins, label: formatTimeLabel(hours, minutes, hourCycle) });
  }
  return options;
};

function TimeList({
  date,
  hourCycle,
  durationFromValue,
  showDurationLabels,
  onChange,
}: {
  date: Date;
  hourCycle: 12 | 24;
  durationFromValue?: string;
  showDurationLabels?: boolean;
  onChange: (nextDate: Date) => void;
}) {
  const options = useMemo(() => buildTimeOptions(hourCycle), [hourCycle]);
  const selectedMinutes = getMinutesSinceMidnight(date);
  const durationBase = useMemo(() => parseDurationBase(durationFromValue), [durationFromValue]);
  const durationBaseMinutes = durationBase ? getMinutesSinceMidnight(durationBase) : null;

  const applyMinutes = (minutes: number) => {
    const next = new Date(date);
    next.setHours(Math.floor(minutes / 60), minutes % 60, 0, 0);
    onChange(next);
  };

  return (
    <div
      className="max-h-[300px] w-full overflow-y-auto sm:w-[160px] sm:border-l sm:border-border"
      role="listbox"
      aria-label="Select time"
      tabIndex={0}
      onKeyDown={(e) => {
        const currentIndex = options.findIndex((o) => o.value === selectedMinutes);
        if (e.key === "ArrowDown") {
          e.preventDefault();
          const next = options[Math.min(currentIndex + 1, options.length - 1)];
          applyMinutes(next.value);
        }
        if (e.key === "ArrowUp") {
          e.preventDefault();
          const next = options[Math.max(currentIndex - 1, 0)];
          applyMinutes(next.value);
        }
      }}
    >
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          role="option"
          aria-selected={option.value === selectedMinutes}
          className={cn(
            "block w-full px-4 py-2 text-left text-sm transition-colors",
            option.value === selectedMinutes
              ? "bg-primary/10 text-primary font-medium"
              : "text-foreground hover:bg-muted/50",
          )}
          onClick={() => applyMinutes(option.value)}
        >
          {option.label}
          {showDurationLabels && durationBaseMinutes !== null && option.value > durationBaseMinutes && (
            <span className="ml-2 text-muted-foreground text-xs">
              ({(() => {
                const delta = option.value - durationBaseMinutes;
                if (delta < 60) return `${delta} m`;
                if (delta % 60 === 0) return `${delta / 60} h`;
                const hours = Math.floor(delta / 60);
                const mins = delta % 60;
                return `${hours}.${Math.round((mins / 60) * 10)} h`;
              })()})
            </span>
          )}
        </button>
      ))}
    </div>
  );
}

export function AdaptiveDateTimePicker({
  mode,
  value,
  onChange,
  hourCycle = 12,
  durationFromValue,
  showDurationLabels = false,
  placeholder = "Select",
  disabled,
  className,
}: AdaptiveDateTimePickerProps) {
  const mobile = useIsMobile();
  const [open, setOpen] = useState(false);
  const parsedValue = useMemo(() => parseByMode(value, mode), [value, mode]);
  const [draft, setDraft] = useState<Date | null>(parsedValue);

  useEffect(() => {
    setDraft(parsedValue);
  }, [parsedValue, open]);

  const triggerLabel = humanLabel(parsedValue, mode, hourCycle, placeholder);
  const TriggerIcon = mode === "time" ? Clock3 : CalendarDays;

  const handleClose = () => {
    setOpen(false);
    setDraft(parsedValue);
  };

  const handleApply = () => {
    if (draft) {
      onChange(formatByMode(draft, mode));
    }
    setOpen(false);
  };

  const panel = (
    <div className={cn("flex flex-col overflow-hidden bg-popover text-popover-foreground", 
      (mode === "datetime" || mode === "time") && "sm:flex-row" 
    )}>
      <div className="flex-1 p-3">
        {(mode === "date" || mode === "datetime") && (
          <DayPicker
            mode="single"
            selected={draft ?? undefined}
            onSelect={(selected) => {
              if (!selected) return;
              const base = draft ?? new Date();
              selected.setHours(base.getHours(), base.getMinutes(), 0, 0);
              setDraft(new Date(selected));
            }}
            showOutsideDays
            fixedWeeks
            className="p-0"
            classNames={{
              months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
              month: "space-y-4",
              caption: "flex justify-center pt-1 relative items-center",
              caption_label: "text-sm font-medium",
              nav: "space-x-1 flex items-center",
              nav_button: cn(
                "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100 hover:bg-muted rounded-full flex items-center justify-center transition-colors"
              ),
              nav_button_previous: "absolute left-1",
              nav_button_next: "absolute right-1",
              table: "w-full border-collapse space-y-1",
              head_row: "flex",
              head_cell: "text-muted-foreground rounded-md w-9 font-normal text-[0.8rem]",
              row: "flex w-full mt-2",
              cell: "h-9 w-9 text-center text-sm p-0 relative [&:has([aria-selected])]:bg-muted/50 first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20",
              day: cn(
                "h-9 w-9 p-0 font-normal aria-selected:opacity-100 items-center justify-center rounded-full hover:bg-muted hover:text-foreground transition-colors"
               ),
              day_selected:
                "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground !rounded-full",
              day_today: "bg-accent text-accent-foreground rounded-full",
              day_outside: "text-muted-foreground opacity-50",
              day_disabled: "text-muted-foreground opacity-50",
              day_hidden: "invisible",
            }}
          />
        )}
      </div>

      {(mode === "time" || mode === "datetime") && (
        <TimeList
          date={draft ?? new Date()}
          hourCycle={hourCycle}
          durationFromValue={durationFromValue}
          showDurationLabels={showDurationLabels}
          onChange={(nextDate) => setDraft(new Date(nextDate))}
        />
      )}
      
      <div className="flex items-center justify-end gap-2 border-t border-border p-3 sm:hidden">
         <button
            type="button"
            className="rounded-full px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
            onClick={handleClose}
          >
            Cancel
          </button>
          <button
            type="button"
            className="rounded-full bg-primary px-3.5 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50"
            disabled={!draft}
            onClick={handleApply}
          >
            Done
          </button>
      </div>
    </div>
  );

  const trigger = (
    <button
      type="button"
      disabled={disabled}
      className={cn(
        "flex h-11 w-full items-center justify-between rounded-xl border border-input bg-card px-4 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/60 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
    >
      <span className="inline-flex items-center gap-2">
        <TriggerIcon className="h-4 w-4 text-muted-foreground" />
        <span className={parsedValue ? "text-foreground" : "text-muted-foreground"}>{triggerLabel}</span>
      </span>
      <ChevronDown className="h-4 w-4 opacity-50" />
    </button>
  );

  if (mobile) {
    return (
      <Dialog.Root open={open} onOpenChange={setOpen}>
        <Dialog.Trigger asChild>{trigger}</Dialog.Trigger>
        <Dialog.Portal>
          <Dialog.Overlay
            className="fixed inset-0 z-50 bg-slate-950/40 backdrop-blur-[2px] data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=open]:fade-in-0 data-[state=closed]:fade-out-0"
          />
          <Dialog.Content
            className="fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border border-border bg-background p-0 shadow-[var(--surface-shadow-3)] duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=open]:fade-in-0 data-[state=closed]:fade-out-0 data-[state=open]:zoom-in-95 data-[state=closed]:zoom-out-95 data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] sm:rounded-2xl"
          >
            {panel}
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    );
  }

  return (
    <Popover.Root open={open} onOpenChange={setOpen}>
      <Popover.Trigger asChild>{trigger}</Popover.Trigger>
      <Popover.Portal>
        <Popover.Content
          className="w-auto p-0"
          align="start"
        >
          <div className="bg-popover rounded-2xl border border-border shadow-[var(--surface-shadow-2)]">
           {panel}
           <div className="flex items-center justify-end gap-2 border-t border-border p-2">
              <button
                type="button"
                className="rounded-full px-2.5 py-1.5 text-xs font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                onClick={handleClose}
              >
                Cancel
              </button>
              <button
                type="button"
                className="rounded-full bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50"
                disabled={!draft}
                onClick={handleApply}
              >
                Done
              </button>
            </div>
          </div>
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}
