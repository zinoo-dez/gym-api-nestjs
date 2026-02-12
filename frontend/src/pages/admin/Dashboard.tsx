import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Dumbbell, DollarSign, Clock } from "lucide-react";
import { memberGrowthData, revenueData, members, trainers, payments, notifications } from "@/data/mockData";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Badge } from "@/components/ui/badge";

const stats = [
  { title: "Total Members", value: "234", change: "+12%", icon: Users },
  { title: "Active Trainers", value: "5", change: "+2", icon: Dumbbell },
  { title: "Revenue (Feb)", value: "$14,200", change: "+11%", icon: DollarSign },
  { title: "Pending Payments", value: "2", change: "-3", icon: Clock },
];

const Dashboard = () => {
  const recentPayments = payments.slice(0, 5);
  const unreadNotifs = notifications.filter((n) => !n.read);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">Welcome back to GymPro Admin</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => (
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
                <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px", color: "hsl(var(--foreground))" }} />
                <Line type="monotone" dataKey="members" stroke="hsl(var(--primary))" strokeWidth={2} dot={{ fill: "hsl(var(--primary))" }} />
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
                <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px", color: "hsl(var(--foreground))" }} />
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
                  <p className="font-medium text-sm">{p.memberName}</p>
                  <p className="text-xs text-muted-foreground">{p.date}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-sm">${p.amount}</span>
                  <Badge variant={p.status === "paid" ? "default" : p.status === "pending" ? "secondary" : "destructive"}>
                    {p.status}
                  </Badge>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Notifications</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {unreadNotifs.map((n) => (
              <div key={n.id} className="flex items-start gap-3 py-2 border-b border-border last:border-0">
                <div className={`h-2 w-2 rounded-full mt-2 ${n.type === "alert" ? "bg-destructive" : n.type === "warning" ? "bg-yellow-500" : n.type === "success" ? "bg-primary" : "bg-blue-500"}`} />
                <div>
                  <p className="font-medium text-sm">{n.title}</p>
                  <p className="text-xs text-muted-foreground">{n.message}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
