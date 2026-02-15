import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { CalendarDays, CheckCircle2, Clock3, Users } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { trainerSessionsService, type TrainerSession } from "@/services/trainer-sessions.service";
import { useAuthStore } from "@/store/auth.store";
import { toast } from "sonner";

const TrainerDashboard = () => {
  const user = useAuthStore((state) => state.user);
  const [sessions, setSessions] = useState<TrainerSession[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      try {
        const rows = await trainerSessionsService.getAll();
        setSessions(Array.isArray(rows) ? rows : []);
      } catch (err: any) {
        toast.error(err?.response?.data?.message || "Failed to load trainer dashboard");
        setSessions([]);
      } finally {
        setIsLoading(false);
      }
    };

    load();
  }, []);

  const now = Date.now();
  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);
  const endOfToday = new Date();
  endOfToday.setHours(23, 59, 59, 999);

  const stats = useMemo(() => {
    const upcoming = sessions.filter(
      (s) => s.status === "SCHEDULED" && new Date(s.sessionDate).getTime() > now,
    );
    const completed = sessions.filter((s) => s.status === "COMPLETED");
    const activeClients = new Set(sessions.map((s) => s.memberId)).size;

    return {
      total: sessions.length,
      upcoming: upcoming.length,
      completed: completed.length,
      activeClients,
    };
  }, [sessions, now]);

  const todaySchedule = useMemo(
    () =>
      sessions
        .filter((s) => {
          const t = new Date(s.sessionDate).getTime();
          return t >= startOfToday.getTime() && t <= endOfToday.getTime();
        })
        .sort((a, b) => +new Date(a.sessionDate) - +new Date(b.sessionDate)),
    [sessions, startOfToday, endOfToday],
  );

  const recentSessions = useMemo(
    () => [...sessions].sort((a, b) => +new Date(b.sessionDate) - +new Date(a.sessionDate)).slice(0, 8),
    [sessions],
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Trainer Dashboard</h1>
          <p className="text-sm text-muted-foreground">
            {user?.firstName ? `Welcome back, ${user.firstName}.` : "Manage your sessions and members."}
          </p>
        </div>
        <Button asChild>
          <Link to="/trainer/sessions">Manage Sessions</Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { title: "Total Sessions", value: stats.total, icon: CalendarDays },
          { title: "Upcoming", value: stats.upcoming, icon: Clock3 },
          { title: "Completed", value: stats.completed, icon: CheckCircle2 },
          { title: "Active Clients", value: stats.activeClients, icon: Users },
        ].map((item) => (
          <Card key={item.title}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">{item.title}</p>
                  <p className="text-2xl font-bold">{item.value}</p>
                </div>
                <item.icon className="h-5 w-5 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Today&apos;s Schedule</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <p className="text-sm text-muted-foreground">Loading schedule...</p>
            ) : todaySchedule.length === 0 ? (
              <p className="text-sm text-muted-foreground">No sessions scheduled for today.</p>
            ) : (
              <div className="space-y-3">
                {todaySchedule.map((session) => (
                  <div key={session.id} className="rounded-lg border p-3 flex items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-medium">{session.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(session.sessionDate).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                        {" • "}
                        {session.duration} min
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Member: {session.member?.user?.firstName || ""} {session.member?.user?.lastName || ""}
                      </p>
                    </div>
                    <Badge variant={session.status === "COMPLETED" ? "default" : "secondary"}>
                      {session.status}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Sessions</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <p className="text-sm text-muted-foreground">Loading sessions...</p>
            ) : recentSessions.length === 0 ? (
              <p className="text-sm text-muted-foreground">No sessions found.</p>
            ) : (
              <div className="space-y-3">
                {recentSessions.map((session) => (
                  <div key={session.id} className="rounded-lg border p-3 flex items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-medium">{session.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(session.sessionDate).toLocaleString()} • {session.rate}
                      </p>
                    </div>
                    <Badge variant={session.status === "COMPLETED" ? "default" : "outline"}>
                      {session.status}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default TrainerDashboard;
