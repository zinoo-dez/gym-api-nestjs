
import { AdminLayout } from "@/layouts";
import { SecondaryButton } from "@/components/gym";
import {
  Users,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Calendar,
  Activity,
  Download,
  ArrowUpRight,
  ArrowDownRight,
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

const revenueData = [
  { month: "Jan", revenue: 42000, members: 820 },
  { month: "Feb", revenue: 45000, members: 845 },
  { month: "Mar", revenue: 48000, members: 890 },
  { month: "Apr", revenue: 51000, members: 920 },
  { month: "May", revenue: 54000, members: 950 },
  { month: "Jun", revenue: 58000, members: 980 },
  { month: "Jul", revenue: 62000, members: 1020 },
  { month: "Aug", revenue: 65000, members: 1050 },
  { month: "Sep", revenue: 68000, members: 1100 },
  { month: "Oct", revenue: 72000, members: 1150 },
  { month: "Nov", revenue: 75000, members: 1200 },
  { month: "Dec", revenue: 78000, members: 1247 },
];

const attendanceData = [
  { day: "Mon", morning: 150, afternoon: 120, evening: 200 },
  { day: "Tue", morning: 130, afternoon: 100, evening: 180 },
  { day: "Wed", morning: 160, afternoon: 130, evening: 210 },
  { day: "Thu", morning: 140, afternoon: 110, evening: 190 },
  { day: "Fri", morning: 120, afternoon: 90, evening: 160 },
  { day: "Sat", morning: 200, afternoon: 180, evening: 140 },
  { day: "Sun", morning: 180, afternoon: 150, evening: 100 },
];

const membershipDistribution = [
  { name: "Basic", value: 245, color: "#22c55e" },
  { name: "Pro", value: 412, color: "#4ade80" },
  { name: "Elite", value: 156, color: "#16a34a" },
  { name: "Student", value: 89, color: "#86efac" },
];

const classPopularity = [
  { name: "HIIT", enrolled: 180 },
  { name: "Yoga", enrolled: 150 },
  { name: "Spin", enrolled: 140 },
  { name: "Strength", enrolled: 120 },
  { name: "Zumba", enrolled: 100 },
  { name: "Pilates", enrolled: 80 },
];

export default function AdminReportsPage() {
  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              Reports & Analytics
            </h1>
            <p className="text-muted-foreground">
              Track gym performance and member insights
            </p>
          </div>
          <SecondaryButton>
            <Download className="mr-2 h-4 w-4" />
            Export Report
          </SecondaryButton>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <div className="rounded-lg border border-border bg-card p-4">
            <div className="flex items-center justify-between">
              <div className="rounded-lg bg-primary/10 p-2">
                <DollarSign className="h-5 w-5 text-primary" />
              </div>
              <div className="flex items-center gap-1 text-sm text-primary">
                <ArrowUpRight className="h-4 w-4" />
                12.5%
              </div>
            </div>
            <p className="mt-3 text-2xl font-bold text-foreground">$78,000</p>
            <p className="text-sm text-muted-foreground">Monthly Revenue</p>
          </div>

          <div className="rounded-lg border border-border bg-card p-4">
            <div className="flex items-center justify-between">
              <div className="rounded-lg bg-primary/10 p-2">
                <Users className="h-5 w-5 text-primary" />
              </div>
              <div className="flex items-center gap-1 text-sm text-primary">
                <ArrowUpRight className="h-4 w-4" />
                8.2%
              </div>
            </div>
            <p className="mt-3 text-2xl font-bold text-foreground">1,247</p>
            <p className="text-sm text-muted-foreground">Total Members</p>
          </div>

          <div className="rounded-lg border border-border bg-card p-4">
            <div className="flex items-center justify-between">
              <div className="rounded-lg bg-primary/10 p-2">
                <Activity className="h-5 w-5 text-primary" />
              </div>
              <div className="flex items-center gap-1 text-sm text-destructive">
                <ArrowDownRight className="h-4 w-4" />
                2.1%
              </div>
            </div>
            <p className="mt-3 text-2xl font-bold text-foreground">342</p>
            <p className="text-sm text-muted-foreground">Daily Avg Visits</p>
          </div>

          <div className="rounded-lg border border-border bg-card p-4">
            <div className="flex items-center justify-between">
              <div className="rounded-lg bg-primary/10 p-2">
                <TrendingUp className="h-5 w-5 text-primary" />
              </div>
              <div className="flex items-center gap-1 text-sm text-primary">
                <ArrowUpRight className="h-4 w-4" />
                5.3%
              </div>
            </div>
            <p className="mt-3 text-2xl font-bold text-foreground">94.2%</p>
            <p className="text-sm text-muted-foreground">Retention Rate</p>
          </div>
        </div>

        {/* Charts Row 1 */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Revenue Chart */}
          <div className="rounded-lg border border-border bg-card p-6">
            <h3 className="text-lg font-semibold text-foreground">
              Revenue Overview
            </h3>
            <p className="text-sm text-muted-foreground">
              Monthly revenue for the year
            </p>
            <div className="mt-4 h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={revenueData}>
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
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
                    formatter={(value: number) => [
                      `$${value.toLocaleString()}`,
                      "Revenue",
                    ]}
                  />
                  <Area
                    type="monotone"
                    dataKey="revenue"
                    stroke="#22c55e"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#colorRevenue)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Membership Distribution */}
          <div className="rounded-lg border border-border bg-card p-6">
            <h3 className="text-lg font-semibold text-foreground">
              Membership Distribution
            </h3>
            <p className="text-sm text-muted-foreground">
              Breakdown by plan type
            </p>
            <div className="mt-4 h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={membershipDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {membershipDistribution.map((entry, index) => (
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
              {membershipDistribution.map((item) => (
                <div key={item.name} className="flex items-center gap-2">
                  <div
                    className="h-3 w-3 rounded-full"
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="text-sm text-muted-foreground">
                    {item.name}: {item.value}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Charts Row 2 */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Attendance Pattern */}
          <div className="rounded-lg border border-border bg-card p-6">
            <h3 className="text-lg font-semibold text-foreground">
              Weekly Attendance Pattern
            </h3>
            <p className="text-sm text-muted-foreground">
              Visits by time of day
            </p>
            <div className="mt-4 h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={attendanceData}>
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
                  <Bar dataKey="morning" fill="#16a34a" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="afternoon" fill="#22c55e" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="evening" fill="#4ade80" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-4 flex justify-center gap-6">
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-[#16a34a]" />
                <span className="text-sm text-muted-foreground">Morning</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-[#22c55e]" />
                <span className="text-sm text-muted-foreground">Afternoon</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-[#4ade80]" />
                <span className="text-sm text-muted-foreground">Evening</span>
              </div>
            </div>
          </div>

          {/* Class Popularity */}
          <div className="rounded-lg border border-border bg-card p-6">
            <h3 className="text-lg font-semibold text-foreground">
              Class Popularity
            </h3>
            <p className="text-sm text-muted-foreground">
              Total enrollments by class type
            </p>
            <div className="mt-4 h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={classPopularity} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#262626" />
                  <XAxis type="number" stroke="#a3a3a3" fontSize={12} />
                  <YAxis
                    dataKey="name"
                    type="category"
                    stroke="#a3a3a3"
                    fontSize={12}
                    width={60}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#141414",
                      border: "1px solid #262626",
                      borderRadius: "8px",
                      color: "#ffffff",
                    }}
                  />
                  <Bar
                    dataKey="enrolled"
                    fill="#22c55e"
                    radius={[0, 4, 4, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Recent Activity Table */}
        <div className="rounded-lg border border-border bg-card p-6">
          <h3 className="text-lg font-semibold text-foreground">
            Recent Member Activity
          </h3>
          <p className="text-sm text-muted-foreground">
            Latest check-ins and registrations
          </p>
          <div className="mt-4 overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
                    Member
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
                    Activity
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
                    Plan
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
                    Time
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {[
                  {
                    name: "John Smith",
                    activity: "Check-in",
                    plan: "Pro",
                    time: "2 mins ago",
                  },
                  {
                    name: "Sarah Johnson",
                    activity: "Class Booking",
                    plan: "Elite",
                    time: "15 mins ago",
                  },
                  {
                    name: "Mike Chen",
                    activity: "New Registration",
                    plan: "Basic",
                    time: "32 mins ago",
                  },
                  {
                    name: "Emily Davis",
                    activity: "Plan Upgrade",
                    plan: "Pro",
                    time: "1 hour ago",
                  },
                  {
                    name: "James Wilson",
                    activity: "Check-in",
                    plan: "Elite",
                    time: "1 hour ago",
                  },
                ].map((item, i) => (
                  <tr
                    key={`${item.name}-${item.time}`}
                    className="transition-colors hover:bg-muted/30"
                  >
                    <td className="px-4 py-3 text-foreground">{item.name}</td>
                    <td className="px-4 py-3 text-foreground">{item.activity}</td>
                    <td className="px-4 py-3">
                      <span className="rounded-full bg-primary/20 px-2 py-1 text-xs text-primary">
                        {item.plan}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {item.time}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
