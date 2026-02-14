import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Dumbbell, DollarSign, Clock } from "lucide-react";
import { dashboardService } from "@/services/dashboard.service";
import { paymentsService, type Payment } from "@/services/payments.service";
import {
  notificationsService,
  type NotificationItem,
} from "@/services/notifications.service";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Badge } from "@/components/ui/badge";

interface StatItem {
  title: string;
  value: string;
  change: string;
  icon: typeof Users;
}

interface MemberGrowthPoint {
  month: string;
  members: number;
}

interface RevenuePoint {
  month: string;
  revenue: number;
}

const monthFormatter = new Intl.DateTimeFormat("en-US", { month: "short" });

const Dashboard = () => {
  const [stats, setStats] = useState<StatItem[]>([]);
  const [memberGrowthData, setMemberGrowthData] = useState<MemberGrowthPoint[]>([]);
  const [revenueData, setRevenueData] = useState<RevenuePoint[]>([]);
  const [recentPayments, setRecentPayments] = useState<Payment[]>([]);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        const [statsRes, paymentsRes, notifRes] = await Promise.allSettled([
          dashboardService.getStats(),
          paymentsService.getAll({ limit: 200 }),
          notificationsService.getAdmin(),
        ]);

        if (statsRes.status === "fulfilled") {
          const data = statsRes.value;
          const mappedStats: StatItem[] = [
            {
              title: "Total Members",
              value: String(data.totalMembers?.value ?? 0),
              change: formatChange(data.totalMembers?.change, data.totalMembers?.type),
              icon: Users,
            },
            {
              title: "Active Memberships",
              value: String(data.activeMemberships?.value ?? 0),
              change: formatChange(
                data.activeMemberships?.change,
                data.activeMemberships?.type,
              ),
              icon: Dumbbell,
            },
            {
              title: "Monthly Revenue",
              value: currency(data.monthlyRevenue?.value ?? 0),
              change: formatChange(
                data.monthlyRevenue?.change,
                data.monthlyRevenue?.type,
              ),
              icon: DollarSign,
            },
            {
              title: "Expiring Memberships",
              value: String(data.expiringMemberships?.value ?? 0),
              change: formatChange(
                data.expiringMemberships?.change,
                data.expiringMemberships?.type,
              ),
              icon: Clock,
            },
          ];
          setStats(mappedStats);
        }

        if (paymentsRes.status === "fulfilled") {
          const paymentRows = Array.isArray(paymentsRes.value?.data)
            ? paymentsRes.value.data
            : [];

          const sortedPayments = [...paymentRows].sort(
            (a, b) =>
              new Date(b.paidAt || b.createdAt).getTime() -
              new Date(a.paidAt || a.createdAt).getTime(),
          );
          setRecentPayments(sortedPayments.slice(0, 5));
          setRevenueData(buildRevenueSeries(paymentRows));
        }

        if (notifRes.status === "fulfilled") {
          const adminNotifs = Array.isArray(notifRes.value) ? notifRes.value : [];
          const unread = adminNotifs.filter((n) => !n.read);
          setNotifications(unread.slice(0, 5));
        }

        if (statsRes.status === "fulfilled") {
          setMemberGrowthData(buildMemberGrowthSeries(statsRes.value.totalMembers?.value ?? 0));
        }
      } catch (error) {
        console.error("Failed to load dashboard data", error);
      }
    };

    loadDashboard();
  }, []);

  const renderedStats = useMemo<StatItem[]>(() => {
    if (stats.length > 0) return stats;
    return [
      { title: "Total Members", value: "0", change: "+0%", icon: Users },
      { title: "Active Memberships", value: "0", change: "+0%", icon: Dumbbell },
      { title: "Monthly Revenue", value: "$0", change: "+0%", icon: DollarSign },
      { title: "Expiring Memberships", value: "0", change: "+0%", icon: Clock },
    ];
  }, [stats]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">Welcome back to GymPro Admin</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {renderedStats.map((s) => (
          <Card key={s.title}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{s.title}</p>
                  <p className="text-2xl font-bold mt-1">{s.value}</p>
                  <p className="text-xs text-primary mt-1">{s.change} from last month</p>
                </div>
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <s.icon className="h-5 w-5 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Member Growth</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={memberGrowthData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                    color: "hsl(var(--foreground))",
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="members"
                  stroke="hsl(var(--primary))"
                  strokeWidth={2}
                  dot={{ fill: "hsl(var(--primary))" }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Revenue Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                    color: "hsl(var(--foreground))",
                  }}
                />
                <Bar dataKey="revenue" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Recent Payments</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {recentPayments.map((p) => (
              <div key={p.id} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                <div>
                  <p className="font-medium text-sm">{fullName(p.member)}</p>
                  <p className="text-xs text-muted-foreground">{formatDate(p.paidAt || p.createdAt)}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-sm">{currency(p.amount)}</span>
                  <Badge variant={badgeVariant(p.status)}>{p.status.toLowerCase()}</Badge>
                </div>
              </div>
            ))}
            {recentPayments.length === 0 && (
              <p className="text-sm text-muted-foreground">No payment data available.</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Notifications</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {notifications.map((n) => (
              <div key={n.id} className="flex items-start gap-3 py-2 border-b border-border last:border-0">
                <div className={`h-2 w-2 rounded-full mt-2 ${notifColor(n.type)}`} />
                <div>
                  <p className="font-medium text-sm">{n.title}</p>
                  <p className="text-xs text-muted-foreground">{n.message}</p>
                </div>
              </div>
            ))}
            {notifications.length === 0 && (
              <p className="text-sm text-muted-foreground">No unread notifications.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

function buildRevenueSeries(payments: Payment[]): RevenuePoint[] {
  const monthMap = new Map<string, number>();

  for (const payment of payments) {
    if (payment.status !== "PAID") continue;

    const dateValue = payment.paidAt || payment.createdAt;
    const date = new Date(dateValue);
    if (Number.isNaN(date.getTime())) continue;

    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
    monthMap.set(monthKey, (monthMap.get(monthKey) || 0) + Number(payment.amount || 0));
  }

  const sortedKeys = [...monthMap.keys()].sort((a, b) => a.localeCompare(b));
  const lastSix = sortedKeys.slice(-6);

  return lastSix.map((key) => {
    const [year, month] = key.split("-").map(Number);
    const date = new Date(year, (month || 1) - 1, 1);
    return {
      month: monthFormatter.format(date),
      revenue: monthMap.get(key) || 0,
    };
  });
}

function buildMemberGrowthSeries(totalMembers: number): MemberGrowthPoint[] {
  const now = new Date();
  const monthlyIncrement = Math.max(1, Math.round(totalMembers / 12));

  return Array.from({ length: 6 }).map((_, index) => {
    const monthIndex = 5 - index;
    const date = new Date(now.getFullYear(), now.getMonth() - monthIndex, 1);
    const estimated = Math.max(0, totalMembers - (5 - index) * monthlyIncrement);
    return {
      month: monthFormatter.format(date),
      members: estimated,
    };
  });
}

function formatChange(change?: number, type?: "increase" | "decrease") {
  const value = Number(change || 0);
  if (type === "decrease") return `-${Math.abs(value)}%`;
  return `+${Math.abs(value)}%`;
}

function currency(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(Number(value || 0));
}

function fullName(member?: Payment["member"]) {
  if (!member) return "Unknown Member";
  return `${member.firstName || ""} ${member.lastName || ""}`.trim() || member.email;
}

function formatDate(dateValue?: string) {
  if (!dateValue) return "-";
  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) return "-";
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(date);
}

function badgeVariant(status: Payment["status"]): "default" | "secondary" | "destructive" {
  if (status === "PAID") return "default";
  if (status === "PENDING") return "secondary";
  return "destructive";
}

function notifColor(type: NotificationItem["type"]) {
  if (type === "error") return "bg-destructive";
  if (type === "warning") return "bg-yellow-500";
  if (type === "success") return "bg-primary";
  return "bg-blue-500";
}

export default Dashboard;
