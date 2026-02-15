import { AdaptiveDateTimePicker } from "@/components/ui/adaptive-date-time-picker";

interface DateTimePickerProps {
  value?: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  className?: string;
  mode?: "date" | "datetime";
  hourCycle?: 12 | 24;
  durationFromValue?: string;
  showDurationLabels?: boolean;
  placeholder?: string;
}

export function DateTimePicker({
  value,
  onChange,
  disabled,
  className,
  mode = "datetime",
  hourCycle = 24,
  durationFromValue,
  showDurationLabels = false,
  placeholder,
}: DateTimePickerProps) {
  return (
    <AdaptiveDateTimePicker
      mode={mode}
      value={value}
      onChange={onChange}
      hourCycle={hourCycle}
      durationFromValue={durationFromValue}
      showDurationLabels={showDurationLabels}
      placeholder={placeholder}
      disabled={disabled}
      className={className}
    />
  );
}
