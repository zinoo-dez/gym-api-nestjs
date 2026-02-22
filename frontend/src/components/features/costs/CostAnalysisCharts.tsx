import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import {
  CostCategoryBreakdownPoint,
  CostProjectionPoint,
  CostProjectionSummary,
  CostTypeComparisonPoint,
  MonthlyCostTrendPoint,
  formatCurrency,
} from "@/features/costs";
import { ChartCard } from "@/components/ui/ChartCard";

interface CostAnalysisChartsProps {
  monthlyTrend: MonthlyCostTrendPoint[];
  categoryBreakdown: CostCategoryBreakdownPoint[];
  fixedVsVariable: CostTypeComparisonPoint[];
  projectionPoints: CostProjectionPoint[];
  projectionSummary: CostProjectionSummary;
}

const CHART_COLORS = [
  "hsl(var(--primary))",
  "hsl(var(--info))",
  "hsl(var(--warning))",
  "hsl(var(--success))",
  "hsl(var(--secondary-foreground))",
  "hsl(var(--danger))",
  "hsl(var(--muted-foreground))",
  "hsl(var(--primary-hover))",
];

const chartTooltipStyle = {
  backgroundColor: "hsl(var(--card))",
  border: "1px solid hsl(var(--border))",
  borderRadius: "8px",
};

export function CostAnalysisCharts({
  monthlyTrend,
  categoryBreakdown,
  fixedVsVariable,
  projectionPoints,
  projectionSummary,
}: CostAnalysisChartsProps) {
  return (
    <div className="space-y-4">
      <div className="grid gap-4 xl:grid-cols-7">
        <ChartCard title="Monthly Cost Trend" className="xl:col-span-4">
          <div className="overflow-x-auto">
            <div className="h-[280px] min-w-[520px] md:min-w-0">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={monthlyTrend} margin={{ top: 8, right: 12, left: 8, bottom: 8 }}>
                  <CartesianGrid
                    strokeDasharray="2 4"
                    vertical={false}
                    stroke="hsl(var(--border))"
                    opacity={0.4}
                  />
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
                    contentStyle={chartTooltipStyle}
                    formatter={(value: number) => [formatCurrency(value), "Cost"]}
                  />
                  <Line
                    type="monotone"
                    dataKey="total"
                    stroke="hsl(var(--primary))"
                    strokeWidth={2.5}
                    dot={false}
                    activeDot={{ r: 5 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </ChartCard>

        <ChartCard title="Cost by Category (YTD)" className="xl:col-span-3">
          {categoryBreakdown.length === 0 ? (
            <div className="flex h-[280px] items-center justify-center text-sm text-muted-foreground">
              No category distribution available.
            </div>
          ) : (
            <div className="h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryBreakdown}
                    dataKey="value"
                    nameKey="label"
                    innerRadius={58}
                    outerRadius={98}
                    paddingAngle={2}
                    stroke="none"
                  >
                    {categoryBreakdown.map((entry, index) => (
                      <Cell key={entry.category} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={chartTooltipStyle}
                    formatter={(value: number) => [formatCurrency(value), "Amount"]}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </ChartCard>
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <ChartCard title="Fixed vs Variable (Current Month)">
          <div className="overflow-x-auto">
            <div className="h-[260px] min-w-[460px] md:min-w-0">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={fixedVsVariable} margin={{ top: 8, right: 12, left: 8, bottom: 8 }}>
                  <CartesianGrid
                    strokeDasharray="2 4"
                    vertical={false}
                    stroke="hsl(var(--border))"
                    opacity={0.35}
                  />
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
                    contentStyle={chartTooltipStyle}
                    formatter={(value: number) => [formatCurrency(value), "Amount"]}
                  />
                  <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                    {fixedVsVariable.map((entry) => (
                      <Cell
                        key={entry.type}
                        fill={entry.type === "fixed" ? "hsl(var(--primary))" : "hsl(var(--warning))"}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </ChartCard>

        <ChartCard title="Future Recurring Projection (Read-only)">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-6 text-sm">
              <div>
                <p className="meta-text">Projected Next 12 Months</p>
                <p className="text-lg font-semibold text-foreground">
                  {formatCurrency(projectionSummary.nextYearTotal)}
                </p>
              </div>
              <div>
                <p className="meta-text">Avg Monthly Projection</p>
                <p className="text-lg font-semibold text-foreground">
                  {formatCurrency(projectionSummary.averageMonthlyProjection)}
                </p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <div className="h-[220px] min-w-[520px] md:min-w-0">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={projectionPoints} margin={{ top: 8, right: 12, left: 8, bottom: 8 }}>
                    <CartesianGrid
                      strokeDasharray="2 4"
                      vertical={false}
                      stroke="hsl(var(--border))"
                      opacity={0.35}
                    />
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
                      contentStyle={chartTooltipStyle}
                      formatter={(value: number) => [formatCurrency(value), "Projected"]}
                    />
                    <Line
                      type="monotone"
                      dataKey="projectedTotal"
                      stroke="hsl(var(--info))"
                      strokeWidth={2.5}
                      dot={false}
                      activeDot={{ r: 5 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </ChartCard>
      </div>
    </div>
  );
}
