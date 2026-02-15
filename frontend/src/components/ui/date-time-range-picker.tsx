import { useMemo, useState, useEffect } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import * as Popover from "@radix-ui/react-popover";
import { DayPicker } from "react-day-picker";
import { CalendarDays, ChevronDown, Clock3, X } from "lucide-react";
import { format as formatDate } from "date-fns";

import { cn } from "@/lib/utils";
import { useIsMobile } from "@/components/ui/use-mobile";

const STEP_MINUTES = 15;
const MINUTES_IN_DAY = 24 * 60;

export interface DateTimeRangeValue {
  date: Date;
  startTime: string;
  endTime: string;
  durationMinutes: number;
}

interface DateTimeRangePickerProps {
  date: Date;
  startTime: string;
  endTime: string;
  onChange: (value: DateTimeRangeValue) => void;
  disabled?: boolean;
  className?: string;
}

const clampMinutes = (value: number) => Math.max(0, Math.min(MINUTES_IN_DAY - STEP_MINUTES, value));

const parseTimeToMinutes = (value: string) => {
  const [hours, minutes] = value.split(":").map(Number);
  if (Number.isNaN(hours) || Number.isNaN(minutes)) return 0;
  return clampMinutes(hours * 60 + minutes);
};

const minutesToTimeString = (value: number) => {
  const normalized = clampMinutes(value);
  const hours = Math.floor(normalized / 60);
  const minutes = normalized % 60;
  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
};

const formatTimeLabel = (minutesValue: number) => {
  const hours = Math.floor(minutesValue / 60);
  const minutes = minutesValue % 60;
  const period = hours >= 12 ? "pm" : "am";
  const hours12 = hours % 12 || 12;
  return `${hours12}:${String(minutes).padStart(2, "0")}${period}`;
};

const formatDurationLabel = (minutesValue: number) => {
  if (minutesValue < 60) return `${minutesValue} mins`;
  if (minutesValue % 60 === 0) {
    const hours = minutesValue / 60;
    return `${hours} hr${hours > 1 ? "s" : ""}`;
  }
  const hours = Math.floor(minutesValue / 60);
  const remainingMinutes = minutesValue % 60;
  return `${hours}.${remainingMinutes === 15 ? "25" : remainingMinutes === 30 ? "5" : "75"} hrs`;
};

const getTimeOptions = () => {
  const options: Array<{ value: number; label: string }> = [];
  for (let minutes = 0; minutes < MINUTES_IN_DAY; minutes += STEP_MINUTES) {
    options.push({ value: minutes, label: formatTimeLabel(minutes) });
  }
  return options;
};

const getDefaultEndTime = (startMinutes: number) => {
  const candidate = startMinutes + 60;
  if (candidate < MINUTES_IN_DAY) return candidate;
  const fallback = startMinutes + STEP_MINUTES;
  return fallback < MINUTES_IN_DAY ? fallback : startMinutes;
};

const normalizeDate = (value: Date) => new Date(value.getFullYear(), value.getMonth(), value.getDate(), 0, 0, 0, 0);

const getTriggerLabel = (date: Date, startTime: string, endTime: string) => {
  const startLabel = formatTimeLabel(parseTimeToMinutes(startTime));
  const endLabel = formatTimeLabel(parseTimeToMinutes(endTime));
  return `${formatDate(date, "EEE, MMM d")} · ${startLabel} - ${endLabel}`;
};

function TimeList({
  options,
  selected,
  startMinutes,
  withDuration,
  onSelect,
}: {
  options: Array<{ value: number; label: string }>;
  selected: number;
  startMinutes: number;
  withDuration: boolean;
  onSelect: (minutesValue: number) => void;
}) {
  return (
    <div
      className="max-h-[256px] overflow-y-auto rounded-md border border-border bg-popover p-1"
      role="listbox"
      aria-label="Select time"
      tabIndex={0}
      onKeyDown={(event) => {
        const currentIndex = options.findIndex((option) => option.value === selected);
        if (currentIndex === -1) return;

        if (event.key === "ArrowDown") {
          event.preventDefault();
          const next = options[Math.min(currentIndex + 1, options.length - 1)];
          onSelect(next.value);
        }

        if (event.key === "ArrowUp") {
          event.preventDefault();
          const next = options[Math.max(currentIndex - 1, 0)];
          onSelect(next.value);
        }

        if (event.key === "Home") {
          event.preventDefault();
          onSelect(options[0].value);
        }

        if (event.key === "End") {
          event.preventDefault();
          onSelect(options[options.length - 1].value);
        }
      }}
    >
      {options.map((option) => {
        const durationMinutes = option.value - startMinutes;
        const selectedClass =
          option.value === selected
            ? "bg-primary/10 text-primary font-medium"
            : "text-foreground hover:bg-muted/50";

        return (
          <button
            key={option.value}
            type="button"
            role="option"
            aria-selected={option.value === selected}
            data-selected={option.value === selected ? "true" : "false"}
            className={cn(
              "flex h-9 w-full items-center justify-between rounded-md px-3 text-left text-sm transition-colors",
              "focus-visible:bg-muted",
              selectedClass,
            )}
            onClick={() => onSelect(option.value)}
          >
            <span>{option.label}</span>
            {withDuration && durationMinutes > 0 ? (
              <span className="text-xs text-muted-foreground">({formatDurationLabel(durationMinutes)})</span>
            ) : null}
          </button>
        );
      })}
    </div>
  );
}

export function DateTimeRangePicker({ date, startTime, endTime, onChange, disabled, className }: DateTimeRangePickerProps) {
  const isMobile = useIsMobile();
  const [open, setOpen] = useState(false);
  const [activeField, setActiveField] = useState<"start" | "end">("start");

  // Keep internal state for draft changes before applying
  const [draftDate, setDraftDate] = useState<Date>(date);
  const [draftStartTime, setDraftStartTime] = useState<string>(startTime);
  const [draftEndTime, setDraftEndTime] = useState<string>(endTime);

  const selectedDate = useMemo(() => normalizeDate(date), [date]);

  // Sync draft state when opening
  useEffect(() => {
     if(!open) {
        setDraftDate(date);
        setDraftStartTime(startTime);
        setDraftEndTime(endTime);
     }
  }, [open, date, startTime, endTime]);


  const startMinutes = parseTimeToMinutes(draftStartTime);
  const endMinutesRaw = parseTimeToMinutes(draftEndTime);
  const endMinutes = endMinutesRaw > startMinutes ? endMinutesRaw : getDefaultEndTime(startMinutes);

  const timeOptions = useMemo(() => getTimeOptions(), []);
  const startOptions = useMemo(
    () => timeOptions.filter((option) => option.value < MINUTES_IN_DAY - STEP_MINUTES),
    [timeOptions],
  );

  const endOptions = useMemo(
    () => timeOptions.filter((option) => option.value > startMinutes),
    [timeOptions, startMinutes],
  );

  const handleDraftChange = (next: { date?: Date; startMinutes?: number; endMinutes?: number }) => {
    const nextDate = normalizeDate(next.date ?? draftDate);
    const nextStart = next.startMinutes ?? startMinutes;

    let nextEnd = next.endMinutes ?? endMinutes;
    if (nextEnd <= nextStart) {
      nextEnd = getDefaultEndTime(nextStart);
      if (nextEnd <= nextStart) {
        nextEnd = Math.min(nextStart + STEP_MINUTES, MINUTES_IN_DAY - STEP_MINUTES);
      }
    }

    setDraftDate(nextDate);
    setDraftStartTime(minutesToTimeString(nextStart));
    setDraftEndTime(minutesToTimeString(nextEnd));
  };


  const handleApply = () => {
    const startMins = parseTimeToMinutes(draftStartTime);
    const endMins = parseTimeToMinutes(draftEndTime);

    onChange({
      date: draftDate,
      startTime: draftStartTime,
      endTime: draftEndTime,
      durationMinutes: endMins - startMins,
    });
    setOpen(false);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const trigger = (
    <button
      type="button"
      disabled={disabled}
      className={cn(
        "flex h-11 w-full items-center justify-between rounded-xl border border-input bg-card px-4 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/60 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
      aria-label="Open date and time range picker"
    >
      <span className="inline-flex items-center gap-2">
        <CalendarDays className="h-4 w-4 text-muted-foreground" />
        <span className="text-foreground">{getTriggerLabel(selectedDate, startTime, endTime)}</span>
      </span>
      <ChevronDown className="h-4 w-4 opacity-50" />
    </button>
  );

  const panel = (
    <div className="space-y-4 p-4 text-popover-foreground">
      <div className="flex flex-col sm:flex-row gap-4">
          <div className="p-2">
            <DayPicker
                mode="single"
                weekStartsOn={0}
                selected={draftDate}
                onSelect={(nextDate) => {
                if (!nextDate) return;
                handleDraftChange({ date: nextDate });
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
          </div>

        <div className="flex flex-col gap-3 min-w-[200px]">
             <div className="flex rounded-lg border border-border bg-muted/50 p-1">
                <button
                    type="button"
                    className={cn(
                    "flex-1 flex max-w-[50%] items-center justify-center gap-2 rounded-full py-1.5 text-xs font-medium transition-all",
                    activeField === "start"
                        ? "bg-background text-foreground shadow-sm ring-1 ring-border"
                        : "text-muted-foreground hover:text-foreground"
                    )}
                    onClick={() => setActiveField("start")}
                >
                    Start: {formatTimeLabel(startMinutes)}
                </button>
                <button
                    type="button"
                    className={cn(
                    "flex-1 flex max-w-[50%] items-center justify-center gap-2 rounded-full py-1.5 text-xs font-medium transition-all",
                    activeField === "end"
                         ? "bg-background text-foreground shadow-sm ring-1 ring-border"
                        : "text-muted-foreground hover:text-foreground"
                    )}
                    onClick={() => setActiveField("end")}
                >
                    End: {formatTimeLabel(endMinutes)}
                </button>
            </div>

            {activeField === "start" ? (
            <TimeList
                options={startOptions}
                selected={startMinutes}
                startMinutes={startMinutes}
                withDuration={false}
                onSelect={(minutesValue) => handleDraftChange({ startMinutes: minutesValue })}
            />
            ) : (
            <TimeList
                options={endOptions}
                selected={endMinutes}
                startMinutes={startMinutes}
                withDuration
                onSelect={(minutesValue) => handleDraftChange({ endMinutes: minutesValue })}
            />
            )}
        </div>
      </div>
      
       <div className="flex items-center justify-end gap-2 border-t border-border pt-4">
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
                onClick={handleApply}
              >
                Done
              </button>
        </div>
    </div>
  );

  if (isMobile) {
    return (
      <Dialog.Root open={open} onOpenChange={setOpen}>
        <Dialog.Trigger asChild>{trigger}</Dialog.Trigger>
        <Dialog.Portal>
          <Dialog.Overlay
            className="fixed inset-0 z-50 bg-slate-950/40 backdrop-blur-[2px] data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=open]:fade-in-0 data-[state=closed]:fade-out-0"
          />
          <Dialog.Content
             className="fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border border-border bg-background p-0 shadow-[var(--surface-shadow-3)] duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=open]:fade-in-0 data-[state=closed]:fade-out-0 data-[state=open]:zoom-in-95 data-[state=closed]:zoom-out-95 data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] sm:rounded-2xl max-h-[90vh] overflow-y-auto"
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
          className="w-auto p-0 z-50 rounded-2xl border border-border bg-popover text-popover-foreground shadow-[var(--surface-shadow-2)] outline-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=open]:fade-in-0 data-[state=closed]:fade-out-0 data-[state=open]:zoom-in-95 data-[state=closed]:zoom-out-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2"
          align="start"
        >
          {panel}
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}
