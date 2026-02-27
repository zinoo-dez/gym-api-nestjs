import { useEffect, useMemo, useState } from "react";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

import type { AttendancePoint } from "@/features/reports";
import { Button } from "@/components/ui/Button";
import { ChartCard } from "@/components/ui/ChartCard";

import { ChartSkeleton } from "./ReportsSkeleton";

type AttendanceMode = "hours" | "days";

interface AttendancePatternChartProps {
  peakHours: AttendancePoint[];
  peakDays: AttendancePoint[];
  loading: boolean;
  errorMessage?: string;
}

const tooltipStyle = {
  backgroundColor: "hsl(var(--card))",
  border: "1px solid hsl(var(--border))",
  borderRadius: "8px",
};

export function AttendancePatternChart({
  peakHours,
  peakDays,
  loading,
  errorMessage,
}: AttendancePatternChartProps) {
  const [mode, setMode] = useState<AttendanceMode>(peakDays.length > 0 ? "days" : "hours");

  useEffect(() => {
    if (mode === "days" && peakDays.length === 0 && peakHours.length > 0) {
      setMode("hours");
    }

    if (mode === "hours" && peakHours.length === 0 && peakDays.length > 0) {
      setMode("days");
    }
  }, [mode, peakDays.length, peakHours.length]);

  const chartData = useMemo(() => (mode === "days" ? peakDays : peakHours), [mode, peakDays, peakHours]);

  return (
    <ChartCard
      title="Attendance Patterns"
      className="lg:col-span-3"
      action={
        <div className="flex items-center gap-2">
          <Button
            type="button"
            size="sm"
            variant={mode === "days" ? "default" : "outline"}
            disabled={peakDays.length === 0}
            onClick={() => setMode("days")}
          >
            By Day
          </Button>
          <Button
            type="button"
            size="sm"
            variant={mode === "hours" ? "default" : "outline"}
            disabled={peakHours.length === 0}
            onClick={() => setMode("hours")}
          >
            By Hour
          </Button>
        </div>
      }
    >
      {loading ? (
        <ChartSkeleton />
      ) : errorMessage ? (
        <div className="flex h-72 items-center justify-center rounded-md border border-destructive/40 bg-danger/10 p-4 text-sm text-destructive">
          {errorMessage}
        </div>
      ) : chartData.length === 0 ? (
        <div className="flex h-72 items-center justify-center rounded-md border border-dashed text-sm text-muted-foreground">
          No attendance distribution available.
        </div>
      ) : (
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 8, right: 12, left: 0, bottom: 8 }}>
              <CartesianGrid strokeDasharray="2 4" vertical={false} stroke="hsl(var(--border))" opacity={0.35} />
              <XAxis
                dataKey="label"
                tickLine={false}
                axisLine={false}
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
              />
              <Tooltip
                contentStyle={tooltipStyle}
                formatter={(value: number) => [`${Math.trunc(value)} check-ins`, "Attendance"]}
                labelClassName="text-sm font-medium"
              />
              <Bar dataKey="value" fill="hsl(var(--info))" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </ChartCard>
  );
}
