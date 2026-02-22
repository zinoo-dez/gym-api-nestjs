import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";

import type { MembershipDistributionPoint } from "@/features/reports";
import { ChartCard } from "@/components/ui/ChartCard";

import { ChartSkeleton } from "./ReportsSkeleton";

interface MembershipDistributionChartProps {
  data: MembershipDistributionPoint[];
  loading: boolean;
  errorMessage?: string;
}

const CHART_COLORS = [
  "hsl(var(--primary))",
  "hsl(var(--info))",
  "hsl(var(--warning))",
  "hsl(var(--success))",
  "hsl(var(--danger))",
  "hsl(var(--secondary-foreground))",
  "hsl(var(--muted-foreground))",
];

const tooltipStyle = {
  backgroundColor: "hsl(var(--card))",
  border: "1px solid hsl(var(--border))",
  borderRadius: "8px",
};

const getTotal = (data: MembershipDistributionPoint[]): number =>
  data.reduce((accumulator, point) => accumulator + point.value, 0);

export function MembershipDistributionChart({
  data,
  loading,
  errorMessage,
}: MembershipDistributionChartProps) {
  const total = getTotal(data);

  return (
    <ChartCard title="Membership Distribution" className="lg:col-span-3">
      {loading ? (
        <ChartSkeleton />
      ) : errorMessage ? (
        <div className="flex h-72 items-center justify-center rounded-md border border-danger/40 bg-danger/10 p-4 text-sm text-danger">
          {errorMessage}
        </div>
      ) : data.length === 0 ? (
        <div className="flex h-72 items-center justify-center rounded-md border border-dashed text-sm text-muted-foreground">
          Membership type distribution is unavailable.
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_190px]">
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data}
                  dataKey="value"
                  nameKey="label"
                  innerRadius={62}
                  outerRadius={104}
                  paddingAngle={3}
                  stroke="none"
                >
                  {data.map((point, index) => (
                    <Cell key={`${point.label}-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={tooltipStyle}
                  formatter={(value: number) => [Math.trunc(value), "Members"]}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="space-y-3">
            {data.map((point, index) => {
              const percentage = total > 0 ? (point.value / total) * 100 : 0;

              return (
                <div key={point.label} className="flex items-center justify-between gap-3 rounded-md border p-2">
                  <div className="flex items-center gap-2">
                    <span
                      className="size-2.5 rounded-full"
                      style={{ backgroundColor: CHART_COLORS[index % CHART_COLORS.length] }}
                    />
                    <span className="text-sm text-foreground">{point.label}</span>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-foreground">{Math.trunc(point.value)}</p>
                    <p className="meta-text">{percentage.toFixed(1)}%</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </ChartCard>
  );
}
