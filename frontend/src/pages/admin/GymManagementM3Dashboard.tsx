import { useCallback, useEffect, useMemo, useState } from "react";
import { M3KpiCard } from "@/components/ui/m3-kpi-card";
import {
  dashboardService,
  type DashboardStats,
  type PopularClass,
  type RecentActivity,
  type RecentMember,
  type ReportingAnalytics,
  type UpcomingClasses,
} from "@/services/dashboard.service";
import {
  RefreshCcw,
  TrendingUp,
  Wallet,
  Users,
  Activity,
  BarChart3,
  CalendarClock,
  Dumbbell,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);

const SOURCE_COLORS = ["#2563eb", "#0d9488", "#d97706"];

export default function GymManagementM3Dashboard() {
  const [analytics, setAnalytics] = useState<ReportingAnalytics | null>(null);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentMembers, setRecentMembers] = useState<RecentMember[]>([]);
  const [popularClasses, setPopularClasses] = useState<PopularClass[]>([]);
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [upcomingClasses, setUpcomingClasses] = useState<UpcomingClasses | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [
        analyticsRes,
        statsRes,
        recentMembersRes,
        popularClassesRes,
        recentActivityRes,
        upcomingClassesRes,
      ] = await Promise.all([
        dashboardService.getReportingAnalytics(),
        dashboardService.getStats(),
        dashboardService.getRecentMembers(),
        dashboardService.getPopularClasses(),
        dashboardService.getRecentActivity(),
        dashboardService.getUpcomingClasses(7),
      ]);

      setAnalytics(analyticsRes || null);
      setStats(statsRes || null);
      setRecentMembers(Array.isArray(recentMembersRes) ? recentMembersRes : []);
      setPopularClasses(Array.isArray(popularClassesRes) ? popularClassesRes : []);
      setRecentActivity(Array.isArray(recentActivityRes) ? recentActivityRes : []);
      setUpcomingClasses(upcomingClassesRes || null);
    } catch (error: any) {
      console.error("Failed to load dashboard data", error);
      toast.error(error?.response?.data?.message || "Failed to load dashboard analytics");
      setAnalytics(null);
      setStats(null);
      setRecentMembers([]);
      setPopularClasses([]);
      setRecentActivity([]);
      setUpcomingClasses(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const sourceData = useMemo(() => {
    if (!analytics) return [];
    return [
      { name: "Memberships", value: analytics.revenueReports.revenueBySource.memberships },
      { name: "Products", value: analytics.revenueReports.revenueBySource.products },
      { name: "Sessions", value: analytics.revenueReports.revenueBySource.sessions },
    ];
  }, [analytics]);

  const activeInactiveData = useMemo(() => {
    if (!analytics) return [];
    return [
      { name: "Active", value: analytics.memberAnalytics.activeVsInactive.activeMembers },
      { name: "Inactive", value: analytics.memberAnalytics.activeVsInactive.inactiveMembers },
    ];
  }, [analytics]);

  const genderData = useMemo(() => {
    if (!analytics) return [];
    return Object.entries(analytics.memberAnalytics.demographics.genderDistribution).map(
      ([gender, count]) => ({
        name: gender,
        value: count,
      }),
    );
  }, [analytics]);

  const peakHoursData = useMemo(() => {
    if (!analytics) return [];
    return analytics.operationalMetrics.peakHoursAnalysis.map((row) => ({
      hour: row.label,
      value: row.value,
    }));
  }, [analytics]);

  const memberSparklineData = useMemo(() => {
    if (!analytics) return [];
    return analytics.memberAnalytics.growthTrends.slice(-8).map((row) => ({
      label: row.label,
      value: row.value,
    }));
  }, [analytics]);

  const totalRevenue = useMemo(() => {
    if (!analytics) return 0;
    return (
      analytics.revenueReports.revenueBySource.memberships +
      analytics.revenueReports.revenueBySource.products +
      analytics.revenueReports.revenueBySource.sessions
    );
  }, [analytics]);

  const kpis = useMemo(() => {
    return [
      {
        title: "Total Members",
        value: stats?.totalMembers.value ?? 0,
        icon: Users,
        tone: "primary" as const,
      },
      {
        title: "Active Memberships",
        value: stats?.activeMemberships.value ?? 0,
        icon: Activity,
        tone: "success" as const,
      },
      {
        title: "Today's Check-ins",
        value: stats?.todayCheckIns.value ?? 0,
        icon: CalendarClock,
        tone: "neutral" as const,
      },
      {
        title: "Monthly Revenue",
        value: formatCurrency(stats?.monthlyRevenue.value ?? 0),
        icon: Wallet,
        tone: "warning" as const,
      },
      {
        title: "Upcoming Classes",
        value: upcomingClasses?.totalUpcomingClasses ?? 0,
        icon: Dumbbell,
        tone: "primary" as const,
      },
      {
        title: "Collection Rate",
        value: `${analytics?.revenueReports.paymentCollection.collectionRate ?? 0}%`,
        icon: TrendingUp,
        tone: "success" as const,
      },
    ];
  }, [stats, analytics, upcomingClasses]);

  return (
    <div className="space-y-4">
      <section className="rounded-2xl border border-border bg-card p-4">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h1 className="m3-title-md">Reporting & Analytics Dashboard</h1>
            <p className="text-sm text-muted-foreground">
              Unified operational metrics from dashboard stats, activity feed, classes, and reporting analytics.
            </p>
          </div>
          <Button
            variant="outline"
            onClick={loadData}
            disabled={isLoading}
            className="h-10 rounded-xl border-border font-semibold text-xs"
          >
            <RefreshCcw className={cn("mr-2 h-4 w-4", isLoading && "animate-spin")} />
            Refresh Analytics
          </Button>
        </div>
      </section>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {kpis.map((item) => (
          <M3KpiCard
            key={item.title}
            title={item.title}
            value={item.value}
            icon={item.icon}
            tone={item.tone}
          />
        ))}
      </div>

      <div className="grid gap-4 xl:grid-cols-12">
        <Card className="xl:col-span-4">
          <CardHeader>
            <CardTitle>Member Growth Sparkline</CardTitle>
          </CardHeader>
          <CardContent className="h-[220px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={memberSparklineData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="label" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="value"
                  name="Members"
                  stroke="#16a34a"
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="xl:col-span-4">
          <CardHeader>
            <CardTitle>Recent Members</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {recentMembers.length === 0 ? (
              <p className="text-sm text-muted-foreground">No recent members.</p>
            ) : (
              recentMembers.slice(0, 6).map((member) => (
                <div key={member.id} className="flex items-center justify-between rounded-lg border px-3 py-2">
                  <div>
                    <p className="text-sm font-medium">{member.name}</p>
                    <p className="text-xs text-muted-foreground">{member.plan}</p>
                  </div>
                  <span className="text-xs text-muted-foreground">{member.joined}</span>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        <Card className="xl:col-span-4">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {recentActivity.length === 0 ? (
              <p className="text-sm text-muted-foreground">No recent activity.</p>
            ) : (
              recentActivity.slice(0, 6).map((row, idx) => (
                <div key={`${row.action}-${row.time}-${idx}`} className="rounded-lg border px-3 py-2">
                  <p className="text-sm font-medium">{row.action}</p>
                  <p className="text-xs text-muted-foreground">{row.detail}</p>
                  <p className="text-[11px] text-muted-foreground">{row.time}</p>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        <Card className="xl:col-span-12">
          <CardHeader>
            <CardTitle>Peak Hours Analysis</CardTitle>
          </CardHeader>
          <CardContent className="h-[260px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={peakHoursData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="hour" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="value" name="Footfall" fill="#2563eb" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="xl:col-span-8">
          <CardHeader>
            <CardTitle>Daily Revenue Trend (Last 30 Days)</CardTitle>
          </CardHeader>
          <CardContent className="h-[320px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={analytics?.revenueReports.dailyRevenue ?? []}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="label" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="value"
                  name="Revenue"
                  stroke="#2563eb"
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="xl:col-span-4">
          <CardHeader>
            <CardTitle>Revenue by Source</CardTitle>
          </CardHeader>
          <CardContent className="h-[320px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={sourceData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={95} label>
                  {sourceData.map((_, index) => (
                    <Cell key={`source-cell-${index}`} fill={SOURCE_COLORS[index % SOURCE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="xl:col-span-6">
          <CardHeader>
            <CardTitle>Upcoming Class Capacity (7 Days)</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {upcomingClasses?.topClasses?.length ? (
              upcomingClasses.topClasses.slice(0, 8).map((row) => (
                <div key={row.id} className="rounded-lg border p-3">
                  <div className="flex items-center justify-between">
                    <p className="font-medium">{row.name}</p>
                    <Badge variant="outline">
                      {row.booked}/{row.capacity}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {row.trainer} | {new Date(row.startTime).toLocaleString()}
                  </p>
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground">No upcoming classes.</p>
            )}
          </CardContent>
        </Card>

        <Card className="xl:col-span-3">
          <CardHeader>
            <CardTitle>Active vs Inactive</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={activeInactiveData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={85} label>
                  <Cell fill="#059669" />
                  <Cell fill="#f59e0b" />
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="xl:col-span-3">
          <CardHeader>
            <CardTitle>Gender Distribution</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={genderData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={85} label>
                  {genderData.map((_, index) => (
                    <Cell key={`gender-cell-${index}`} fill={SOURCE_COLORS[index % SOURCE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="xl:col-span-12">
          <CardHeader>
            <CardTitle>Popular Classes Snapshot</CardTitle>
          </CardHeader>
          <CardContent>
            {popularClasses.length === 0 ? (
              <p className="text-sm text-muted-foreground">No class utilization data.</p>
            ) : (
              <div className="grid gap-2 md:grid-cols-2 xl:grid-cols-3">
                {popularClasses.slice(0, 6).map((row) => (
                  <div key={row.id} className="rounded-lg border p-3">
                    <p className="font-medium">{row.name}</p>
                    <p className="text-xs text-muted-foreground">Trainer: {row.trainer}</p>
                    <p className="text-xs text-muted-foreground">Time: {row.time}</p>
                    <p className="mt-1 text-sm font-semibold">
                      {row.enrolled}/{row.capacity} enrolled
                    </p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="xl:col-span-12">
          <CardHeader>
            <CardTitle>Total Revenue (All Sources)</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{formatCurrency(totalRevenue)}</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
