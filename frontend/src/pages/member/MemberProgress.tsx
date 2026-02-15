import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { trainerSessionsService, type TrainerSession } from "@/services/trainer-sessions.service";

interface ProgressItem {
  id: string;
  recordedAt: string;
  weight?: number;
  bmi?: number;
  bodyFat?: number;
  muscleMass?: number;
  benchPress?: number;
  squat?: number;
  deadlift?: number;
  cardioEndurance?: string;
}

const MemberProgress = () => {
  const [sessions, setSessions] = useState<TrainerSession[]>([]);
  const [progress, setProgress] = useState<ProgressItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [sessionFilter, setSessionFilter] = useState("");

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const [sessionRows, progressRows] = await Promise.all([
          trainerSessionsService.getAll(),
          trainerSessionsService.getMyProgress(),
        ]);
        setSessions(Array.isArray(sessionRows) ? sessionRows : []);
        setProgress(Array.isArray(progressRows) ? progressRows : []);
      } catch (err: any) {
        toast.error(err?.response?.data?.message || "Failed to load progress data");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  const upcomingCount = useMemo(
    () => sessions.filter((s) => s.status === "SCHEDULED" && +new Date(s.sessionDate) > Date.now()).length,
    [sessions],
  );
  const visibleSessions = useMemo(() => {
    const keyword = sessionFilter.trim().toLowerCase();
    if (!keyword) return sessions;
    return sessions.filter((s) => s.title.toLowerCase().includes(keyword));
  }, [sessions, sessionFilter]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Trainer Sessions & Progress</h1>
        <p className="text-sm text-muted-foreground">Track your booked sessions and progress updates</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Total Sessions</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{sessions.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Upcoming</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{upcomingCount}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Progress Entries</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{progress.length}</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Session History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-3">
            <Label htmlFor="member-session-filter">Filter sessions</Label>
            <Input
              id="member-session-filter"
              placeholder="Filter by title..."
              value={sessionFilter}
              onChange={(e) => setSessionFilter(e.target.value)}
            />
          </div>
          {loading ? (
            <p className="text-sm text-muted-foreground">Loading...</p>
          ) : visibleSessions.length === 0 ? (
            <p className="text-sm text-muted-foreground">No trainer sessions yet.</p>
          ) : (
            <div className="space-y-3">
              {visibleSessions.map((s) => (
                <div key={s.id} className="border rounded-lg p-3 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">{s.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(s.sessionDate).toLocaleString()} • {s.duration} min
                    </p>
                  </div>
                  <Badge variant={s.status === "COMPLETED" ? "default" : "secondary"}>{s.status}</Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Progress Timeline</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-sm text-muted-foreground">Loading...</p>
          ) : progress.length === 0 ? (
            <p className="text-sm text-muted-foreground">No progress records yet.</p>
          ) : (
            <div className="space-y-3">
              {progress.map((row) => (
                <div key={row.id} className="border rounded-lg p-3">
                  <p className="text-xs text-muted-foreground mb-2">{new Date(row.recordedAt).toLocaleString()}</p>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
                    <div>Weight: {row.weight ?? "-"}</div>
                    <div>BMI: {row.bmi ?? "-"}</div>
                    <div>Body Fat: {row.bodyFat ?? "-"}</div>
                    <div>Muscle: {row.muscleMass ?? "-"}</div>
                    <div>Bench: {row.benchPress ?? "-"}</div>
                    <div>Squat: {row.squat ?? "-"}</div>
                    <div>Deadlift: {row.deadlift ?? "-"}</div>
                    <div>Cardio: {row.cardioEndurance ?? "-"}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default MemberProgress;
