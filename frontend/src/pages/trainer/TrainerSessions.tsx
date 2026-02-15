import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  trainerSessionsService,
  type BookableMember,
  type CreateTrainerSessionRequest,
  type TrainerSession,
} from "@/services/trainer-sessions.service";

const emptyProgress = {
  weight: "",
  bmi: "",
  bodyFat: "",
  muscleMass: "",
  benchPress: "",
  squat: "",
  deadlift: "",
  cardioEndurance: "",
};

const TrainerSessions = () => {
  const [sessions, setSessions] = useState<TrainerSession[]>([]);
  const [members, setMembers] = useState<BookableMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [selectedSessionId, setSelectedSessionId] = useState("");
  const [sessionFilter, setSessionFilter] = useState("");

  const [createForm, setCreateForm] = useState<CreateTrainerSessionRequest>({
    memberId: "",
    sessionDate: "",
    duration: 60,
    title: "Personal Training",
    description: "",
    notes: "",
    rate: 0,
  });

  const [progressForm, setProgressForm] = useState(emptyProgress);

  const load = async () => {
    setLoading(true);
    try {
      const [sessionsData, membersData] = await Promise.all([
        trainerSessionsService.getAll(),
        trainerSessionsService.getBookableMembers(),
      ]);

      setSessions(Array.isArray(sessionsData) ? sessionsData : []);
      setMembers(Array.isArray(membersData) ? membersData : []);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to load trainer sessions");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const sortedSessions = useMemo(
    () => [...sessions].sort((a, b) => +new Date(b.sessionDate) - +new Date(a.sessionDate)),
    [sessions],
  );
  const visibleSessions = useMemo(() => {
    const keyword = sessionFilter.trim().toLowerCase();
    if (!keyword) return sortedSessions;
    return sortedSessions.filter((s) =>
      `${s.title} ${s.member?.user?.firstName || ""} ${s.member?.user?.lastName || ""}`
        .toLowerCase()
        .includes(keyword),
    );
  }, [sortedSessions, sessionFilter]);

  const handleCreate = async () => {
    if (!createForm.memberId || !createForm.sessionDate || !createForm.title) {
      toast.error("Member, date/time and title are required");
      return;
    }

    try {
      setCreating(true);
      await trainerSessionsService.create({
        ...createForm,
        duration: Number(createForm.duration),
        rate: Number(createForm.rate),
      });
      toast.success("Session created");
      setCreateForm({
        memberId: "",
        sessionDate: "",
        duration: 60,
        title: "Personal Training",
        description: "",
        notes: "",
        rate: 0,
      });
      await load();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to create session");
    } finally {
      setCreating(false);
    }
  };

  const handleComplete = async (id: string) => {
    try {
      await trainerSessionsService.complete(id);
      toast.success("Session marked completed");
      await load();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to complete session");
    }
  };

  const handleRecordProgress = async () => {
    if (!selectedSessionId) {
      toast.error("Select a session to record progress");
      return;
    }

    const payload: any = {};
    for (const [key, value] of Object.entries(progressForm)) {
      if (value === "") continue;
      payload[key] = key === "cardioEndurance" ? value : Number(value);
    }

    try {
      await trainerSessionsService.recordProgress(selectedSessionId, payload);
      setProgressForm(emptyProgress);
      toast.success("Progress recorded");
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to record progress");
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Trainer Sessions</h1>
        <p className="text-sm text-muted-foreground">Book sessions and track client progress</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Book New Session</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label>Member</Label>
            <Select value={createForm.memberId} onValueChange={(value) => setCreateForm((p) => ({ ...p, memberId: value }))}>
              <SelectTrigger>
                <SelectValue placeholder="Select member" />
              </SelectTrigger>
              <SelectContent>
                {members.length === 0 ? (
                  <SelectItem value="__no_members__" disabled>
                    No members available for booking
                  </SelectItem>
                ) : (
                  members.map((m) => (
                    <SelectItem key={m.id} value={m.id}>
                      {m.firstName} {m.lastName}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Date & time</Label>
            <Input
              type="datetime-local"
              value={createForm.sessionDate}
              onChange={(e) => setCreateForm((p) => ({ ...p, sessionDate: e.target.value }))}
            />
          </div>
          <div>
            <Label>Title</Label>
            <Input value={createForm.title} onChange={(e) => setCreateForm((p) => ({ ...p, title: e.target.value }))} />
          </div>
          <div>
            <Label>Duration (min)</Label>
            <Input
              type="number"
              min="15"
              value={createForm.duration}
              onChange={(e) => setCreateForm((p) => ({ ...p, duration: Number(e.target.value) }))}
            />
          </div>
          <div>
            <Label>Rate</Label>
            <Input
              type="number"
              min="0"
              value={createForm.rate}
              onChange={(e) => setCreateForm((p) => ({ ...p, rate: Number(e.target.value) }))}
            />
          </div>
          <div>
            <Label>Description</Label>
            <Input
              value={createForm.description || ""}
              onChange={(e) => setCreateForm((p) => ({ ...p, description: e.target.value }))}
            />
          </div>
          <div className="md:col-span-2">
            <Label>Notes</Label>
            <Input
              value={createForm.notes || ""}
              onChange={(e) => setCreateForm((p) => ({ ...p, notes: e.target.value }))}
            />
          </div>
          <div className="md:col-span-2">
            <Button onClick={handleCreate} disabled={creating}>{creating ? "Creating..." : "Create Session"}</Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Record Progress</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Session</Label>
            <Select value={selectedSessionId} onValueChange={setSelectedSessionId}>
              <SelectTrigger>
                <SelectValue placeholder="Select completed or scheduled session" />
              </SelectTrigger>
              <SelectContent>
                {sortedSessions.map((s) => (
                  <SelectItem key={s.id} value={s.id}>
                    {new Date(s.sessionDate).toLocaleString()} • {s.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {Object.keys(emptyProgress).map((key) => (
              <div key={key}>
                <Label className="capitalize">{key.replace(/[A-Z]/g, (m) => ` ${m}`)}</Label>
                <Input
                  type={key === "cardioEndurance" ? "text" : "number"}
                  value={(progressForm as any)[key]}
                  onChange={(e) => setProgressForm((p: any) => ({ ...p, [key]: e.target.value }))}
                />
              </div>
            ))}
          </div>

          <Button onClick={handleRecordProgress}>Save Progress</Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Session List</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-3">
            <Label htmlFor="session-filter">Filter sessions</Label>
            <Input
              id="session-filter"
              placeholder="Filter by title or member..."
              value={sessionFilter}
              onChange={(e) => setSessionFilter(e.target.value)}
            />
          </div>
          {loading ? (
            <p className="text-sm text-muted-foreground">Loading sessions...</p>
          ) : visibleSessions.length === 0 ? (
            <p className="text-sm text-muted-foreground">No sessions yet.</p>
          ) : (
            <div className="space-y-3">
              {visibleSessions.map((s) => (
                <div key={s.id} className="border rounded-lg p-3 flex items-center justify-between gap-3">
                  <div>
                    <p className="font-medium text-sm">{s.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(s.sessionDate).toLocaleString()} • {s.duration} min • Rate {s.rate}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Member: {s.member?.user?.firstName || ""} {s.member?.user?.lastName || ""}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={s.status === "COMPLETED" ? "default" : "secondary"}>{s.status}</Badge>
                    {s.status !== "COMPLETED" && (
                      <Button size="sm" variant="outline" onClick={() => handleComplete(s.id)}>
                        Mark Complete
                      </Button>
                    )}
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

export default TrainerSessions;
