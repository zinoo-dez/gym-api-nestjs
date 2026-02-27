import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import type { RevenuePeriod, RevenuePoint } from "@/features/reports";
import { ChartCard } from "@/components/ui/ChartCard";
import { formatCurrency } from "@/lib/currency";

import { ChartSkeleton } from "./ReportsSkeleton";

interface RevenueOverviewChartProps {
  data: RevenuePoint[];
  period: RevenuePeriod;
  loading: boolean;
  errorMessage?: string;
}

const PERIOD_TITLES: Record<RevenuePeriod, string> = {
  daily: "Daily revenue trend",
  weekly: "Weekly revenue trend",
  monthly: "Monthly revenue trend",
};

const tooltipStyle = {
  backgroundColor: "hsl(var(--card))",
  border: "1px solid hsl(var(--border))",
  borderRadius: "8px",
};

export function RevenueOverviewChart({
  data,
  period,
  loading,
  errorMessage,
}: RevenueOverviewChartProps) {
  return (
    <ChartCard
      title="Revenue Overview"
      className="lg:col-span-4"
      action={<p className="meta-text">{PERIOD_TITLES[period]}</p>}
    >
      {loading ? (
        <ChartSkeleton />
      ) : errorMessage ? (
        <div className="flex h-72 items-center justify-center rounded-md border border-destructive/40 bg-danger/10 p-4 text-sm text-destructive">
          {errorMessage}
        </div>
      ) : data.length === 0 ? (
        <div className="flex h-72 items-center justify-center rounded-md border border-dashed text-sm text-muted-foreground">
          No revenue data for this range.
        </div>
      ) : (
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 8, right: 12, left: 0, bottom: 8 }}>
              <defs>
                <linearGradient id="revenueFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.32} />
                  <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0.02} />
                </linearGradient>
              </defs>
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
                tickFormatter={(value) => formatCurrency(Number(value))}
              />
              <Tooltip
                contentStyle={tooltipStyle}
                formatter={(value: number) => [formatCurrency(value), "Revenue"]}
                labelClassName="text-sm font-medium"
              />
              <Area
                type="monotone"
                dataKey="value"
                stroke="hsl(var(--primary))"
                fill="url(#revenueFill)"
                strokeWidth={2.5}
                dot={false}
                activeDot={{ r: 5 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}
    </ChartCard>
  );
}
