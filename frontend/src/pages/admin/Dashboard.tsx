import { motion } from "framer-motion";
import { Users, CreditCard, Activity, AlertTriangle, UserPlus, DollarSign, Calendar, FileText } from "lucide-react";
import { KPICard } from "@/components/ui/KPICard";
import { ActionCard } from "@/components/ui/ActionCard";
import { ChartCard } from "@/components/ui/ChartCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, PieChart, Pie } from "recharts";

const performanceData = [
  { name: "Jan", members: 400, revenue: 2400 },
  { name: "Feb", members: 300, revenue: 1398 },
  { name: "Mar", members: 200, revenue: 9800 },
  { name: "Apr", members: 278, revenue: 3908 },
  { name: "May", members: 189, revenue: 4800 },
  { name: "Jun", members: 239, revenue: 3800 },
  { name: "Jul", members: 349, revenue: 4300 },
];

const memberStatsData = [
  { name: "Premium", value: 400 },
  { name: "Standard", value: 300 },
  { name: "Basic", value: 300 },
];
const COLORS = ["hsl(var(--primary))", "hsl(var(--secondary))", "hsl(var(--muted))"];

export function Dashboard() {
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  return (
    <div className="space-y-8">
      {/* 2.2 Section 1: Overview KPIs */}
      <motion.div 
        variants={container} 
        initial="hidden" 
        animate="show"
        className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
      >
        <KPICard title="Total Members" value="4,231" trend={{ value: 12, isPositive: true }} icon={Users} />
        <KPICard title="Active Memberships" value="3,802" trend={{ value: 5, isPositive: true }} icon={Activity} />
        <KPICard title="Monthly Revenue" value="$42,500" trend={{ value: 3.2, isPositive: true }} icon={CreditCard} />
        <KPICard title="Expiring Soon" value="142" trend={{ value: 2.1, isPositive: false }} icon={AlertTriangle} />
      </motion.div>

      {/* 2.2 Section 2: Analytics & Insights */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <ChartCard title="Revenue Overview" className="lg:col-span-4">
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={performanceData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `$${value}`} />
                <Tooltip 
                  contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px" }}
                  itemStyle={{ color: "hsl(var(--foreground))" }}
                />
                <Line type="monotone" dataKey="revenue" stroke="hsl(var(--primary))" strokeWidth={3} dot={false} activeDot={{ r: 8 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>
        
        <ChartCard title="Membership Distribution" className="lg:col-span-3">
          <div className="h-[300px] flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={memberStatsData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  fill="#8884d8"
                  paddingAngle={5}
                  dataKey="value"
                  stroke="none"
                >
                  {memberStatsData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px" }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {/* 2.2 Section 3: Actionable Alerts */}
        <Card className="col-span-1 shadow-sm border dark:bg-card/50 dark:backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-lg">System Alerts</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {[1, 2, 3].map((_, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
                className="flex items-center justify-between rounded-lg border p-3 hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="flex size-8 items-center justify-center rounded-full bg-warning/20 text-warning">
                    <AlertTriangle className="size-4" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Overdue Payment</p>
                    <p className="text-xs text-muted-foreground">John Doe - $45.00</p>
                  </div>
                </div>
                <button className="text-xs font-semibold text-primary hover:underline">View</button>
              </motion.div>
            ))}
          </CardContent>
        </Card>

        {/* 2.2 Section 4: Management Shortcuts */}
        <div className="col-span-1 lg:col-span-2 space-y-4">
          <h3 className="text-lg font-medium tracking-tight">Quick Actions</h3>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <ActionCard title="Add Member" icon={UserPlus} />
            <ActionCard title="Record Payment" icon={DollarSign} />
            <ActionCard title="Manage Plans" icon={Calendar} />
            <ActionCard title="View Reports" icon={FileText} />
          </div>
        </div>
      </div>

      {/* 2.2 Section 5: Recent Activity */}
      <Card className="shadow-sm border dark:bg-card/50 dark:backdrop-blur-sm">
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-0">
            {[
              { id: 1, text: "Sarah Connor started Premium Membership", time: "10 mins ago", status: "success" },
              { id: 2, text: "Monthly recurring payment failed for Mike Smith", time: "1 hour ago", status: "danger" },
              { id: 3, text: "New class schedule published for June", time: "2 hours ago", status: "info" },
            ].map((activity, i) => (
              <motion.div
                key={activity.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="flex items-center justify-between border-b p-4 last:border-0 hover:bg-muted/50 cursor-pointer transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className={`size-2 rounded-full bg-${activity.status}`} />
                  <p className="text-sm font-medium text-foreground">{activity.text}</p>
                </div>
                <span className="text-xs text-muted-foreground">{activity.time}</span>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
