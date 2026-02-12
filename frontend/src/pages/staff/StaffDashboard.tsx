import { useParams, Link } from "react-router-dom";
import { staff } from "@/data/mockData";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, Briefcase, Clock, CheckCircle2, ListTodo, TrendingUp, CalendarDays, Target } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

const weeklyHours = [
  { day: "Mon", hours: 8 }, { day: "Tue", hours: 7.5 }, { day: "Wed", hours: 8 },
  { day: "Thu", hours: 9 }, { day: "Fri", hours: 7 }, { day: "Sat", hours: 4 }, { day: "Sun", hours: 0 },
];

const taskDistribution = [
  { name: "Completed", value: 24, color: "hsl(var(--primary))" },
  { name: "In Progress", value: 8, color: "hsl(var(--muted-foreground))" },
  { name: "Pending", value: 4, color: "hsl(var(--destructive))" },
];

const StaffDashboard = () => {
  const { id } = useParams();
  const person = staff.find((s) => s.id === id);

  if (!person) return (
    <div className="flex flex-col items-center justify-center h-64 gap-4">
      <p className="text-muted-foreground">Staff member not found</p>
      <Button variant="outline" asChild><Link to="/staff"><ArrowLeft className="h-4 w-4 mr-2" />Back</Link></Button>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild><Link to="/staff"><ArrowLeft className="h-5 w-5" /></Link></Button>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold">Hi {person.name.split(" ")[0]},</h1>
            <span className="text-muted-foreground text-lg">Welcome back!</span>
          </div>
          <p className="text-sm text-muted-foreground">Staff Dashboard • {person.role} — {person.department}</p>
        </div>
        <Badge variant={person.status === "active" ? "default" : "secondary"} className="text-sm">{person.status}</Badge>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { icon: Clock, label: "Hours This Week", value: "43.5h", change: "↑ 5%", color: "bg-primary/20 text-primary" },
          { icon: ListTodo, label: "Tasks Completed", value: "24", change: "↑ 12%", color: "bg-blue-500/20 text-blue-500" },
          { icon: Target, label: "Efficiency", value: "94%", change: "↑ 3%", color: "bg-green-500/20 text-green-500" },
          { icon: CalendarDays, label: "Attendance", value: "98%", change: "↑ 1%", color: "bg-yellow-500/20 text-yellow-500" },
        ].map((stat, i) => (
          <Card key={i} className="bg-card border-border">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className={`h-10 w-10 rounded-xl ${stat.color} flex items-center justify-center`}><stat.icon className="h-5 w-5" /></div>
                <div>
                  <p className="text-2xl font-bold">{stat.value}</p>
                  <p className="text-xs text-muted-foreground">{stat.label}</p>
                </div>
                <Badge variant="secondary" className="ml-auto text-xs">{stat.change}</Badge>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2 bg-card border-border">
          <CardHeader className="pb-2"><CardTitle className="text-lg">Weekly Hours</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={weeklyHours}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="day" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8 }} />
                <Bar dataKey="hours" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardHeader className="pb-2"><CardTitle className="text-lg">Task Distribution</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={160}>
              <PieChart>
                <Pie data={taskDistribution} cx="50%" cy="50%" innerRadius={40} outerRadius={65} dataKey="value" stroke="none">
                  {taskDistribution.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                </Pie>
                <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8 }} />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex justify-center gap-4 mt-2">
              {taskDistribution.map((item, i) => (
                <div key={i} className="flex items-center gap-1 text-xs">
                  <div className="h-2 w-2 rounded-full" style={{ background: item.color }} />
                  <span className="text-muted-foreground">{item.name}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tasks & Schedule */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className="bg-card border-border">
          <CardHeader className="pb-2"><CardTitle className="text-lg">Recent Tasks</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {[
              { task: "Process membership renewals", status: "done" },
              { task: "Update equipment inventory", status: "done" },
              { task: "Prepare monthly report", status: "progress" },
              { task: "Schedule maintenance", status: "progress" },
              { task: "Review supply orders", status: "pending" },
            ].map((item, i) => (
              <div key={i} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className={`h-4 w-4 ${item.status === "done" ? "text-primary" : "text-muted-foreground"}`} />
                  <span className="text-sm">{item.task}</span>
                </div>
                <Badge variant={item.status === "done" ? "default" : item.status === "progress" ? "secondary" : "outline"}>
                  {item.status === "done" ? "Done" : item.status === "progress" ? "In Progress" : "Pending"}
                </Badge>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardHeader className="pb-2"><CardTitle className="text-lg">Performance</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            {[
              { label: "Task Completion", value: 94 },
              { label: "Punctuality", value: 98 },
              { label: "Team Collaboration", value: 90 },
              { label: "Quality Score", value: 92 },
            ].map((metric, i) => (
              <div key={i} className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span>{metric.label}</span>
                  <span className="font-medium">{metric.value}%</span>
                </div>
                <Progress value={metric.value} className="h-2" />
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default StaffDashboard;
