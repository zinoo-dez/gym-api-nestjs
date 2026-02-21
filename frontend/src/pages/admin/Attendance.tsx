import { useCallback, useEffect, useMemo, useState } from "react";
import {
  attendanceService,
  type AttendanceRecord,
  type AttendanceType,
} from "@/services/attendance.service";
import { membersService, type Member } from "@/services/members.service";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RefreshCcw, ScanLine, LogOut } from "lucide-react";
import { toast } from "sonner";

const AttendancePage = () => {
  const [loading, setLoading] = useState(true);
  const [rows, setRows] = useState<AttendanceRecord[]>([]);
  const [members, setMembers] = useState<Member[]>([]);

  const [memberId, setMemberId] = useState("");
  const [type, setType] = useState<AttendanceType>("GYM_VISIT");
  const [classScheduleId, setClassScheduleId] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [attendanceResponse, memberResponse] = await Promise.all([
        attendanceService.getAll({ limit: 100 }),
        membersService.getAll({ limit: 200, isActive: true }),
      ]);

      setRows(Array.isArray(attendanceResponse?.data) ? attendanceResponse.data : []);
      setMembers(Array.isArray(memberResponse?.data) ? memberResponse.data : []);
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to load attendance data");
      setRows([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const openRows = useMemo(
    () => rows.filter((item) => !item.checkOutTime),
    [rows],
  );

  const submitCheckIn = async () => {
    if (!memberId) {
      toast.error("Please select a member");
      return;
    }

    setSubmitting(true);
    try {
      const created = await attendanceService.checkIn({
        memberId,
        type,
        classScheduleId: type === "CLASS_ATTENDANCE" ? classScheduleId || undefined : undefined,
      });
      setRows((prev) => [created, ...prev]);
      setClassScheduleId("");
      toast.success("Check-in recorded");
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to check in member");
    } finally {
      setSubmitting(false);
    }
  };

  const submitCheckOut = async (attendanceId: string) => {
    try {
      const updated = await attendanceService.checkOut(attendanceId);
      setRows((prev) => prev.map((row) => (row.id === attendanceId ? updated : row)));
      toast.success("Check-out recorded");
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to check out member");
    }
  };

  return (
    <div className="space-y-4">
      <section className="rounded-2xl border border-border bg-card p-4">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h1 className="m3-title-md">Attendance Control</h1>
            <p className="text-sm text-muted-foreground">
              Manual check-in/check-out for gym visits and class attendance.
            </p>
          </div>
          <Button variant="outline" onClick={load} disabled={loading}>
            <RefreshCcw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
        </div>
      </section>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-12">
        <Card className="xl:col-span-4">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ScanLine className="h-4 w-4" />
              Manual Check-in
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <Label>Member</Label>
              <Select value={memberId} onValueChange={setMemberId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select member" />
                </SelectTrigger>
                <SelectContent>
                  {members.map((member) => (
                    <SelectItem key={member.id} value={member.id}>
                      {member.firstName} {member.lastName} ({member.email})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Type</Label>
              <Select value={type} onValueChange={(value) => setType(value as AttendanceType)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="GYM_VISIT">GYM_VISIT</SelectItem>
                  <SelectItem value="CLASS_ATTENDANCE">CLASS_ATTENDANCE</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {type === "CLASS_ATTENDANCE" && (
              <div>
                <Label>Class Schedule ID</Label>
                <Input
                  value={classScheduleId}
                  onChange={(e) => setClassScheduleId(e.target.value)}
                  placeholder="Optional class schedule id"
                />
              </div>
            )}

            <Button onClick={submitCheckIn} disabled={submitting} className="w-full">
              {submitting ? "Saving..." : "Check In"}
            </Button>
          </CardContent>
        </Card>

        <Card className="xl:col-span-8">
          <CardHeader>
            <CardTitle>Active Check-ins ({openRows.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p className="text-sm text-muted-foreground">Loading...</p>
            ) : openRows.length === 0 ? (
              <p className="text-sm text-muted-foreground">No active check-ins.</p>
            ) : (
              <div className="space-y-2">
                {openRows.map((row) => (
                  <div
                    key={row.id}
                    className="flex flex-col gap-2 rounded-lg border p-3 md:flex-row md:items-center md:justify-between"
                  >
                    <div>
                      <p className="font-medium">
                        {row.member?.firstName} {row.member?.lastName}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(row.checkInTime).toLocaleString()} | {row.type}
                      </p>
                    </div>
                    <Button size="sm" onClick={() => submitCheckOut(row.id)}>
                      <LogOut className="mr-2 h-4 w-4" />
                      Check Out
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Attendance Records</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-sm text-muted-foreground">Loading...</p>
          ) : rows.length === 0 ? (
            <p className="text-sm text-muted-foreground">No attendance records found.</p>
          ) : (
            <div className="space-y-2">
              {rows.slice(0, 25).map((row) => (
                <div key={row.id} className="rounded-lg border p-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-medium">
                      {row.member?.firstName} {row.member?.lastName}
                    </p>
                    <Badge variant="outline">{row.type}</Badge>
                    <Badge
                      className={
                        row.checkOutTime
                          ? "bg-emerald-100 text-emerald-700"
                          : "bg-blue-100 text-blue-700"
                      }
                    >
                      {row.checkOutTime ? "Closed" : "Open"}
                    </Badge>
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">
                    In: {new Date(row.checkInTime).toLocaleString()}
                    {row.checkOutTime
                      ? ` | Out: ${new Date(row.checkOutTime).toLocaleString()}`
                      : ""}
                  </p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AttendancePage;
