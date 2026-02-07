import { useEffect, useMemo, useState } from "react";
import { AdminLayout } from "@/layouts";
import { SecondaryButton } from "@/components/gym";
import {
  Users,
  DollarSign,
  TrendingUp,
  Activity,
  Download,
  ArrowUpRight,
} from "lucide-react";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { membersService } from "@/services/members.service";
import { trainersService } from "@/services/trainers.service";
import { classesService } from "@/services/classes.service";
import { membershipsService, type MembershipPlan } from "@/services/memberships.service";
import { attendanceService, type AttendanceRecord } from "@/services/attendance.service";

interface MonthPoint {
  month: string;
  visits: number;
}

interface AttendanceBucket {
  day: string;
  morning: number;
  afternoon: number;
  evening: number;
}

interface DistributionPoint {
  name: string;
  value: number;
  color: string;
}

interface ClassPopularityPoint {
  name: string;
  enrolled: number;
}

const COLORS = ["#22c55e", "#4ade80", "#16a34a", "#86efac", "#0f766e", "#14b8a6"]; 

function getMonthLabels(): string[] {
  const labels: string[] = [];
  const now = new Date();
  for (let i = 5; i >= 0; i -= 1) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
    labels.push(date.toLocaleDateString("en-US", { month: "short" }));
  }
  return labels;
}

function groupAttendanceByMonth(records: AttendanceRecord[]): MonthPoint[] {
  const labels = getMonthLabels();
  const counts = new Map<string, number>();
  labels.forEach((label) => counts.set(label, 0));

  records.forEach((record) => {
    const date = new Date(record.checkInTime);
    const label = date.toLocaleDateString("en-US", { month: "short" });
    if (counts.has(label)) {
      counts.set(label, (counts.get(label) || 0) + 1);
    }
  });

  return labels.map((label) => ({ month: label, visits: counts.get(label) || 0 }));
}

function groupAttendanceByDay(records: AttendanceRecord[]): AttendanceBucket[] {
  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const buckets: AttendanceBucket[] = dayNames.map((day) => ({
    day,
    morning: 0,
    afternoon: 0,
    evening: 0,
  }));

  records.forEach((record) => {
    const date = new Date(record.checkInTime);
    const dayIndex = date.getDay();
    const hour = date.getHours();

    if (hour < 12) {
      buckets[dayIndex].morning += 1;
    } else if (hour < 17) {
      buckets[dayIndex].afternoon += 1;
    } else {
      buckets[dayIndex].evening += 1;
    }
  });

  return buckets;
}

function buildPlanDistribution(plans: MembershipPlan[]): DistributionPoint[] {
  return plans.map((plan, index) => ({
    name: plan.name,
    value: plan.price,
    color: COLORS[index % COLORS.length],
  }));
}

function buildClassPopularity(records: Array<{ classType: string; enrolled: number }>): ClassPopularityPoint[] {
  const map = new Map<string, number>();
  records.forEach((record) => {
    map.set(record.classType, (map.get(record.classType) || 0) + record.enrolled);
  });
  return Array.from(map.entries()).map(([name, enrolled]) => ({ name, enrolled }));
}

export default function AdminReportsPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalMembers, setTotalMembers] = useState(0);
  const [totalClasses, setTotalClasses] = useState(0);
  const [totalPlans, setTotalPlans] = useState(0);
  const [totalTrainers, setTotalTrainers] = useState(0);
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
  const [plans, setPlans] = useState<MembershipPlan[]>([]);
  const [classPopularity, setClassPopularity] = useState<ClassPopularityPoint[]>([]);

  useEffect(() => {
    const loadReports = async () => {
      setLoading(true);
      setError(null);
      try {
        const now = new Date();
        const startDate = new Date(now.getFullYear(), now.getMonth() - 5, 1);
        const [members, trainers, classes, plansResponse, attendance] = await Promise.all([
          membersService.getAll({ limit: 1 }),
          trainersService.getAll({ limit: 1 }),
          classesService.getAll({ limit: 200 }),
          membershipsService.getAllPlans({ limit: 50 }),
          attendanceService.getAll({
            startDate: startDate.toISOString(),
            endDate: now.toISOString(),
            limit: 1000,
          }),
        ]);

        setTotalMembers(members.total || 0);
        setTotalTrainers(trainers.total || 0);
        setTotalClasses(classes.total || 0);
        setTotalPlans(plansResponse.total || 0);
        setAttendanceRecords(Array.isArray(attendance.data) ? attendance.data : []);
        const planList = Array.isArray(plansResponse.data) ? plansResponse.data : [];
        setPlans(planList);

        const classRows = Array.isArray(classes.data) ? classes.data : [];
        const popularity = buildClassPopularity(
          classRows.map((cls) => ({
            classType: cls.classType,
            enrolled:
              cls.availableSlots !== undefined ? cls.capacity - cls.availableSlots : 0,
          })),
        );
        setClassPopularity(popularity);
      } catch (err) {
        console.error("Error loading reports:", err);
        setError("Failed to load reports data.");
      } finally {
        setLoading(false);
      }
    };

    loadReports();
  }, []);

  const attendanceTrend = useMemo(
    () => groupAttendanceByMonth(attendanceRecords),
    [attendanceRecords],
  );

  const attendanceByDay = useMemo(
    () => groupAttendanceByDay(attendanceRecords),
    [attendanceRecords],
  );

  const attendanceHeatmap = useMemo(() => {
    const slots = ["morning", "afternoon", "evening"] as const;
    const maxValue = attendanceByDay.reduce((max, day) => {
      return Math.max(max, day.morning, day.afternoon, day.evening);
    }, 0);

    return {
      slots,
      maxValue,
    };
  }, [attendanceByDay]);

  const planDistribution = useMemo(
    () => buildPlanDistribution(plans),
    [plans],
  );

  const avgDailyVisits = useMemo(() => {
    if (!attendanceRecords.length) return 0;
    const uniqueDays = new Set(
      attendanceRecords.map((record) =>
        new Date(record.checkInTime).toDateString(),
      ),
    );
    return Math.round(attendanceRecords.length / uniqueDays.size);
  }, [attendanceRecords]);

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Reports & Analytics</h1>
            <p className="text-muted-foreground">Live operational metrics from the gym.</p>
          </div>
          <SecondaryButton>
            <Download className="mr-2 h-4 w-4" />
            Export Report
          </SecondaryButton>
        </div>

        {error && (
          <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-4 text-destructive">
            {error}
          </div>
        )}

        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <div className="rounded-lg border border-border bg-card p-4">
            <div className="flex items-center justify-between">
              <div className="rounded-lg bg-primary/10 p-2">
                <DollarSign className="h-5 w-5 text-primary" />
              </div>
              <div className="flex items-center gap-1 text-sm text-primary">
                <ArrowUpRight className="h-4 w-4" />
                Live
              </div>
            </div>
            <p className="mt-3 text-2xl font-bold text-foreground">—</p>
            <p className="text-sm text-muted-foreground">Revenue Tracking</p>
          </div>

          <div className="rounded-lg border border-border bg-card p-4">
            <div className="flex items-center justify-between">
              <div className="rounded-lg bg-primary/10 p-2">
                <Users className="h-5 w-5 text-primary" />
              </div>
              <div className="flex items-center gap-1 text-sm text-primary">
                <ArrowUpRight className="h-4 w-4" />
                Live
              </div>
            </div>
            <p className="mt-3 text-2xl font-bold text-foreground">
              {loading ? "…" : totalMembers}
            </p>
            <p className="text-sm text-muted-foreground">Total Members</p>
          </div>

          <div className="rounded-lg border border-border bg-card p-4">
            <div className="flex items-center justify-between">
              <div className="rounded-lg bg-primary/10 p-2">
                <Activity className="h-5 w-5 text-primary" />
              </div>
              <div className="flex items-center gap-1 text-sm text-primary">
                <ArrowUpRight className="h-4 w-4" />
                Live
              </div>
            </div>
            <p className="mt-3 text-2xl font-bold text-foreground">
              {loading ? "…" : avgDailyVisits}
            </p>
            <p className="text-sm text-muted-foreground">Daily Avg Visits</p>
          </div>

          <div className="rounded-lg border border-border bg-card p-4">
            <div className="flex items-center justify-between">
              <div className="rounded-lg bg-primary/10 p-2">
                <TrendingUp className="h-5 w-5 text-primary" />
              </div>
              <div className="flex items-center gap-1 text-sm text-primary">
                <ArrowUpRight className="h-4 w-4" />
                Live
              </div>
            </div>
            <p className="mt-3 text-2xl font-bold text-foreground">
              {loading ? "…" : totalClasses}
            </p>
            <p className="text-sm text-muted-foreground">Active Classes</p>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <div className="rounded-lg border border-border bg-card p-6">
            <h3 className="text-lg font-semibold text-foreground">Attendance Trend</h3>
            <p className="text-sm text-muted-foreground">Last 6 months of check-ins</p>
            <div className="mt-4 h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={attendanceTrend}>
                  <defs>
                    <linearGradient id="colorAttendance" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#262626" />
                  <XAxis dataKey="month" stroke="#a3a3a3" fontSize={12} />
                  <YAxis stroke="#a3a3a3" fontSize={12} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#141414",
                      border: "1px solid #262626",
                      borderRadius: "8px",
                      color: "#ffffff",
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="visits"
                    stroke="#22c55e"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#colorAttendance)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="rounded-lg border border-border bg-card p-6">
            <h3 className="text-lg font-semibold text-foreground">Plan Price Mix</h3>
            <p className="text-sm text-muted-foreground">Current membership plan pricing</p>
            <div className="mt-4 h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={planDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {planDistribution.map((entry) => (
                      <Cell key={`cell-${entry.name}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#141414",
                      border: "1px solid #262626",
                      borderRadius: "8px",
                      color: "#ffffff",
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-4 flex flex-wrap justify-center gap-4">
              {planDistribution.map((item) => (
                <div key={item.name} className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-sm text-muted-foreground">
                    {item.name}: ${item.value}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <div className="rounded-lg border border-border bg-card p-6">
            <h3 className="text-lg font-semibold text-foreground">Attendance by Day</h3>
            <p className="text-sm text-muted-foreground">Morning vs evening visits</p>
            <div className="mt-4 h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={attendanceByDay}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#262626" />
                  <XAxis dataKey="day" stroke="#a3a3a3" fontSize={12} />
                  <YAxis stroke="#a3a3a3" fontSize={12} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#141414",
                      border: "1px solid #262626",
                      borderRadius: "8px",
                      color: "#ffffff",
                    }}
                  />
                  <Bar dataKey="morning" stackId="a" fill="#22c55e" />
                  <Bar dataKey="afternoon" stackId="a" fill="#4ade80" />
                  <Bar dataKey="evening" stackId="a" fill="#86efac" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="rounded-lg border border-border bg-card p-6">
            <h3 className="text-lg font-semibold text-foreground">Popular Class Types</h3>
            <p className="text-sm text-muted-foreground">Enrollment by category</p>
            <div className="mt-4 h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={classPopularity} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#262626" />
                  <XAxis type="number" stroke="#a3a3a3" fontSize={12} />
                  <YAxis dataKey="name" type="category" stroke="#a3a3a3" fontSize={12} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#141414",
                      border: "1px solid #262626",
                      borderRadius: "8px",
                      color: "#ffffff",
                    }}
                  />
                  <Bar dataKey="enrolled" fill="#22c55e" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <div className="rounded-lg border border-border bg-card p-6">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h3 className="text-lg font-semibold text-foreground">Attendance Heatmap</h3>
              <p className="text-sm text-muted-foreground">
                Peak check-in windows by day
              </p>
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span>Low</span>
              <div className="flex items-center gap-1">
                {[0.15, 0.35, 0.55, 0.75, 0.95].map((opacity) => (
                  <span
                    key={opacity}
                    className="h-3 w-3 rounded-sm border border-border"
                    style={{ backgroundColor: `hsl(var(--primary) / ${opacity})` }}
                  />
                ))}
              </div>
              <span>High</span>
            </div>
          </div>

          <div className="mt-6 overflow-x-auto">
            <div className="min-w-[520px]">
              <div className="grid grid-cols-[120px_repeat(3,minmax(0,1fr))] gap-2 text-xs text-muted-foreground">
                <span />
                <span className="text-center uppercase tracking-wide">Morning</span>
                <span className="text-center uppercase tracking-wide">Afternoon</span>
                <span className="text-center uppercase tracking-wide">Evening</span>
              </div>

              <div className="mt-2 space-y-2">
                {attendanceByDay.map((day) => (
                  <div
                    key={day.day}
                    className="grid grid-cols-[120px_repeat(3,minmax(0,1fr))] gap-2 items-center"
                  >
                    <span className="text-sm text-foreground">{day.day}</span>
                    {attendanceHeatmap.slots.map((slot) => {
                      const value = day[slot];
                      const intensity =
                        attendanceHeatmap.maxValue === 0
                          ? 0.1
                          : 0.2 + (value / attendanceHeatmap.maxValue) * 0.7;
                      return (
                        <div
                          key={`${day.day}-${slot}`}
                          className="h-10 rounded-md border border-border flex items-center justify-center text-xs text-foreground"
                          style={{
                            backgroundColor: `hsl(var(--primary) / ${intensity})`,
                          }}
                          title={`${day.day} ${slot}: ${value} visits`}
                        >
                          {value}
                        </div>
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-lg border border-border bg-card p-6">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h3 className="text-lg font-semibold text-foreground">Operational Snapshot</h3>
              <p className="text-sm text-muted-foreground">Live counts from core modules</p>
            </div>
            <div className="text-sm text-muted-foreground">
              Members: {totalMembers} · Trainers: {totalTrainers} · Plans: {totalPlans}
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
