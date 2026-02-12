import { useParams, Link } from "react-router-dom";
import { trainers, members } from "@/data/mockData";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, Users, Calendar, TrendingUp, Star, Clock, Award, CheckCircle2 } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from "recharts";

const sessionData = [
  { day: "Mon", sessions: 4 }, { day: "Tue", sessions: 6 }, { day: "Wed", sessions: 3 },
  { day: "Thu", sessions: 7 }, { day: "Fri", sessions: 5 }, { day: "Sat", sessions: 8 }, { day: "Sun", sessions: 2 },
];

const monthlyClients = [
  { month: "Jan", clients: 8 }, { month: "Feb", clients: 10 }, { month: "Mar", clients: 12 },
  { month: "Apr", clients: 11 }, { month: "May", clients: 15 }, { month: "Jun", clients: 18 },
];

const TrainerDashboard = () => {
  const { id } = useParams();
  const trainer = trainers.find((t) => t.id === id);

  if (!trainer) return (
    <div className="flex flex-col items-center justify-center h-64 gap-4">
      <p className="text-muted-foreground">Trainer not found</p>
      <Button variant="outline" asChild><Link to="/trainers"><ArrowLeft className="h-4 w-4 mr-2" />Back</Link></Button>
    </div>
  );

  const statusColor = trainer.status === "active" ? "default" : trainer.status === "on-leave" ? "secondary" : "destructive";

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild><Link to="/trainers"><ArrowLeft className="h-5 w-5" /></Link></Button>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold">Hi {trainer.name.split(" ")[0]},</h1>
            <span className="text-muted-foreground text-lg">Welcome back!</span>
          </div>
          <p className="text-sm text-muted-foreground">Trainer Dashboard • {trainer.specialization}</p>
        </div>
        <Badge variant={statusColor} className="text-sm">{trainer.status}</Badge>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { icon: Users, label: "Active Clients", value: trainer.clients, change: "↑ 12%", color: "bg-primary/20 text-primary" },
          { icon: Calendar, label: "Sessions/Week", value: 35, change: "↑ 8%", color: "bg-blue-500/20 text-blue-500" },
          { icon: Star, label: "Rating", value: "4.9", change: "↑ 0.2", color: "bg-yellow-500/20 text-yellow-500" },
          { icon: Award, label: "Completion Rate", value: "96%", change: "↑ 3%", color: "bg-green-500/20 text-green-500" },
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
          <CardHeader className="pb-2"><CardTitle className="text-lg">Weekly Sessions</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={sessionData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="day" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8 }} />
                <Bar dataKey="sessions" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardHeader className="pb-2"><CardTitle className="text-lg">Client Growth</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={monthlyClients}>
                <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8 }} />
                <Line type="monotone" dataKey="clients" stroke="hsl(var(--primary))" strokeWidth={2} dot={{ fill: "hsl(var(--primary))" }} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Schedule & Performance */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className="bg-card border-border">
          <CardHeader className="pb-2"><CardTitle className="text-lg">Today's Schedule</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {[
              { time: "6:00 AM", client: "Alex Johnson", type: "Strength" },
              { time: "7:30 AM", client: "Lisa Anderson", type: "HIIT" },
              { time: "9:00 AM", client: "David Brown", type: "Cardio" },
              { time: "10:30 AM", client: "Mike Chen", type: "Flexibility" },
              { time: "2:00 PM", client: "Sarah Williams", type: "Strength" },
            ].map((session, i) => (
              <div key={i} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                <div className="flex items-center gap-3">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">{session.client}</p>
                    <p className="text-xs text-muted-foreground">{session.time}</p>
                  </div>
                </div>
                <Badge variant="outline">{session.type}</Badge>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardHeader className="pb-2"><CardTitle className="text-lg">Performance</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            {[
              { label: "Client Satisfaction", value: 96 },
              { label: "Session Completion", value: 92 },
              { label: "Goal Achievement", value: 88 },
              { label: "On-Time Rate", value: 98 },
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

export default TrainerDashboard;
