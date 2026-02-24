import { MaterialIcon } from "@/components/ui/MaterialIcon";

import {
  getDefaultReportsFilters,
  setDateRangePreset,
  type ReportDateRange,
  type ReportsFilters,
  type RevenuePeriod,
} from "@/features/reports";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { cn } from "@/lib/utils";

interface ReportsFilterBarProps {
  filters: ReportsFilters;
  branchOptions: string[];
  classCategoryOptions: string[];
  onChange: (nextFilters: ReportsFilters) => void;
}

const RANGE_OPTIONS: Array<{ value: ReportDateRange; label: string }> = [
  { value: "today", label: "Today" },
  { value: "last7days", label: "Last 7 Days" },
  { value: "last30days", label: "Last 30 Days" },
  { value: "custom", label: "Custom" },
];

const PERIOD_OPTIONS: Array<{ value: RevenuePeriod; label: string }> = [
  { value: "daily", label: "Daily" },
  { value: "weekly", label: "Weekly" },
  { value: "monthly", label: "Monthly" },
];

const formatOptionLabel = (value: string): string => {
  return value
    .replace(/[_-]+/g, " ")
    .split(" ")
    .map((token) => token.charAt(0).toUpperCase() + token.slice(1).toLowerCase())
    .join(" ");
};

const withAllOption = (values: string[]): string[] => {
  const unique = Array.from(
    new Set(
      values
        .filter((value) => value.trim().length > 0)
        .filter((value) => value.trim().toLowerCase() !== "all"),
    ),
  );
  return ["all", ...unique];
};

export function ReportsFilterBar({
  filters,
  branchOptions,
  classCategoryOptions,
  onChange,
}: ReportsFilterBarProps) {
  const handleRangeChange = (range: ReportDateRange) => {
    onChange(setDateRangePreset(filters, range));
  };

  const handleCustomDateChange = (field: "startDate" | "endDate", value: string) => {
    onChange({
      ...filters,
      range: "custom",
      [field]: value,
    });
  };

  return (
    <Card className="shadow-sm">
      <CardContent className="space-y-4 p-4 md:p-5">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-2 rounded-md border bg-surface-container-low px-3 py-2 text-label-medium text-on-surface-variant">
              <MaterialIcon icon="calendar_month" className="text-lg text-primary" />
              Date Range
            </span>

            {RANGE_OPTIONS.map((option) => (
              <Button
                key={option.value}
                type="button"
                size="sm"
                variant={filters.range === option.value ? "tonal" : "outlined"}
                onClick={() => handleRangeChange(option.value)}
              >
                {option.label}
              </Button>
            ))}
          </div>

          <Button
            type="button"
            size="sm"
            variant="text"
            onClick={() => onChange(getDefaultReportsFilters())}
            className="w-full justify-center lg:w-auto text-error"
          >
            <MaterialIcon icon="filter_alt_off" className="text-lg" />
            <span>Reset Filters</span>
          </Button>
        </div>

        {filters.range === "custom" ? (
          <div className="grid gap-3 md:grid-cols-2">
            <label className="space-y-1">
              <span className="meta-text">From</span>
              <Input
                type="date"
                value={filters.startDate}
                onChange={(event) => handleCustomDateChange("startDate", event.target.value)}
              />
            </label>
            <label className="space-y-1">
              <span className="meta-text">To</span>
              <Input
                type="date"
                value={filters.endDate}
                onChange={(event) => handleCustomDateChange("endDate", event.target.value)}
              />
            </label>
          </div>
        ) : null}

        <div className="grid gap-3 md:grid-cols-3">
          <label className="space-y-1">
            <span className="meta-text">Revenue Period</span>
            <Select
              value={filters.period}
              onChange={(event) =>
                onChange({
                  ...filters,
                  period: event.target.value as RevenuePeriod,
                })
              }
            >
              {PERIOD_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </Select>
          </label>

          <label className="space-y-1">
            <span className="meta-text">Gym Branch</span>
            <Select
              value={filters.branch}
              onChange={(event) =>
                onChange({
                  ...filters,
                  branch: event.target.value,
                })
              }
            >
              {withAllOption(branchOptions).map((option) => (
                <option key={option} value={option}>
                  {option === "all" ? "All Branches" : formatOptionLabel(option)}
                </option>
              ))}
            </Select>
          </label>

          <label className="space-y-1">
            <span className="meta-text">Class Category</span>
            <Select
              value={filters.classCategory}
              onChange={(event) =>
                onChange({
                  ...filters,
                  classCategory: event.target.value,
                })
              }
            >
              {withAllOption(classCategoryOptions).map((option) => (
                <option key={option} value={option}>
                  {option === "all" ? "All Categories" : formatOptionLabel(option)}
                </option>
              ))}
            </Select>
          </label>
        </div>

        <p className={cn("small-text", "text-muted-foreground")}>
          Filters sync to the URL so this view can be bookmarked and shared.
        </p>
      </CardContent>
    </Card>
  );
}
