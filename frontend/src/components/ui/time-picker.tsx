import { AdaptiveDateTimePicker } from "@/components/ui/adaptive-date-time-picker";

interface TimePickerProps {
  value?: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  className?: string;
  hourCycle?: 12 | 24;
  durationFromValue?: string;
  showDurationLabels?: boolean;
  placeholder?: string;
}

export function TimePicker({
  value,
  onChange,
  disabled,
  className,
  hourCycle = 12,
  durationFromValue,
  showDurationLabels = false,
  placeholder,
}: TimePickerProps) {
  return (
    <AdaptiveDateTimePicker
      mode="time"
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
