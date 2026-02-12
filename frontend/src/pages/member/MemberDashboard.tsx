import { useParams, Link } from "react-router-dom";
import { members, payments } from "@/data/mockData";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, Flame, Dumbbell, Heart, Droplets, TrendingUp, Clock, Activity, CheckCircle2 } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from "recharts";

const workoutData = [
  { day: "Mon", minutes: 45 }, { day: "Tue", minutes: 60 }, { day: "Wed", minutes: 0 },
  { day: "Thu", minutes: 75 }, { day: "Fri", minutes: 50 }, { day: "Sat", minutes: 90 }, { day: "Sun", minutes: 30 },
];

const monthlyProgress = [
  { month: "Jan", calories: 12400 }, { month: "Feb", calories: 15200 }, { month: "Mar", calories: 13800 },
  { month: "Apr", calories: 16500 }, { month: "May", calories: 18200 }, { month: "Jun", calories: 17100 },
];

const checklistItems = [
  { label: "Morning Workout", done: true, value: "0.5h 45s" },
  { label: "Apple", done: false, value: "Fruit Juice" },
  { label: "Running", done: true, value: "4.596m" },
  { label: "Water Intake", done: false, value: "3,000 ml" },
];

const MemberDashboard = () => {
  const { id } = useParams();
  const member = members.find((m) => m.id === id);
  const memberPayments = payments.filter((p) => p.memberId === id);

  if (!member) return (
    <div className="flex flex-col items-center justify-center h-64 gap-4">
      <p className="text-muted-foreground">Member not found</p>
      <Button variant="outline" asChild><Link to="/members"><ArrowLeft className="h-4 w-4 mr-2" />Back</Link></Button>
    </div>
  );

  const statusColor = member.status === "active" ? "default" : member.status === "inactive" ? "secondary" : "destructive";

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild><Link to="/members"><ArrowLeft className="h-5 w-5" /></Link></Button>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold">Hi {member.name.split(" ")[0]},</h1>
            <span className="text-muted-foreground text-lg">Welcome back!</span>
          </div>
          <p className="text-sm text-muted-foreground">Health Records Dashboard</p>
        </div>
        <Badge variant={statusColor} className="text-sm">{member.status}</Badge>
      </div>

      {/* Top Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-card border-border">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-primary/20 flex items-center justify-center"><Flame className="h-5 w-5 text-primary" /></div>
              <div>
                <p className="text-2xl font-bold">19,365</p>
                <p className="text-xs text-muted-foreground">KCAL Totally</p>
              </div>
              <Badge variant="secondary" className="ml-auto text-xs">↑ 16%</Badge>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-destructive/20 flex items-center justify-center"><Heart className="h-5 w-5 text-destructive" /></div>
              <div>
                <p className="text-2xl font-bold">89 <span className="text-sm font-normal text-muted-foreground">bpm</span></p>
                <p className="text-xs text-muted-foreground">Heart Rate</p>
              </div>
              <Badge variant="secondary" className="ml-auto text-xs">+7%</Badge>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-blue-500/20 flex items-center justify-center"><Droplets className="h-5 w-5 text-blue-500" /></div>
              <div>
                <p className="text-2xl font-bold">97.5<span className="text-sm font-normal text-muted-foreground">%</span></p>
                <p className="text-xs text-muted-foreground">SpO2 Level</p>
              </div>
              <Badge variant="secondary" className="ml-auto text-xs">±0.2%</Badge>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-primary/20 flex items-center justify-center"><Dumbbell className="h-5 w-5 text-primary" /></div>
              <div>
                <p className="text-2xl font-bold">265</p>
                <p className="text-xs text-muted-foreground">Calories Burned</p>
              </div>
              <Badge variant="secondary" className="ml-auto text-xs">↑ 24%</Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2 bg-card border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Analytics Tracker</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={workoutData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="day" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8 }} />
                <Bar dataKey="minutes" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Progress</CardTitle>
              <Badge variant="outline">Running</Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Running</span>
              <span className="text-2xl font-bold">139</span>
            </div>
            <Progress value={72} className="h-2" />
            <div className="grid grid-cols-3 gap-2 text-center">
              <div><p className="text-xs text-muted-foreground">Running</p><p className="text-sm font-medium">4.5km</p></div>
              <div><p className="text-xs text-muted-foreground">Workout</p><p className="text-sm font-medium">45min</p></div>
              <div><p className="text-xs text-muted-foreground">Daily</p><p className="text-sm font-medium">✓</p></div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="bg-card border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Monthly Calories</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={160}>
              <AreaChart data={monthlyProgress}>
                <defs>
                  <linearGradient id="calGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8 }} />
                <Area type="monotone" dataKey="calories" stroke="hsl(var(--primary))" fill="url(#calGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Checklist</CardTitle>
              <Activity className="h-4 w-4 text-primary" />
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {checklistItems.map((item, i) => (
              <div key={i} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className={`h-4 w-4 ${item.done ? "text-primary" : "text-muted-foreground"}`} />
                  <span className={`text-sm ${item.done ? "" : "text-muted-foreground"}`}>{item.label}</span>
                </div>
                <span className="text-xs text-muted-foreground">{item.value}</span>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Workout</CardTitle>
              <Badge variant="secondary" className="text-xs">↑ 18%</Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-xs text-muted-foreground">Time Tracking</p>
              <p className="text-2xl font-bold">139<span className="text-sm font-normal text-muted-foreground">/160h</span></p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><p className="text-xs text-muted-foreground">Oxygen</p><p className="text-lg font-bold">97.5%</p></div>
              <div><p className="text-xs text-muted-foreground">Pulse</p><p className="text-lg font-bold">89 bpm</p></div>
            </div>
            <div className="flex gap-1">
              {["S","M","T","W","T","F","S"].map((d, i) => (
                <div key={i} className={`flex-1 h-8 rounded text-xs flex items-center justify-center ${i === 1 || i === 3 || i === 5 ? "bg-primary/20 text-primary" : "bg-muted text-muted-foreground"}`}>{d}</div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Payment History */}
      {memberPayments.length > 0 && (
        <Card className="bg-card border-border">
          <CardHeader><CardTitle className="text-lg">Payment History</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-2">
              {memberPayments.map((p) => (
                <div key={p.id} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                  <div><p className="text-sm font-medium">{p.plan}</p><p className="text-xs text-muted-foreground">{p.date}</p></div>
                  <div className="flex items-center gap-3">
                    <span className="font-medium">${p.amount}</span>
                    <Badge variant={p.status === "paid" ? "default" : p.status === "pending" ? "secondary" : "destructive"}>{p.status}</Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default MemberDashboard;
