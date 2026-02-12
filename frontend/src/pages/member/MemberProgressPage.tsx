import { useEffect, useMemo, useState } from "react";
import { MemberLayout } from "../../layouts";
import { StatCard } from "@/components/gym";
import { attendanceService, type AttendanceRecord } from "@/services/attendance.service";
import { membersService } from "@/services/members.service";
import { LineChart, TrendingUp } from "lucide-react";

export default function MemberProgressPage() {
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadProgress = async () => {
      setLoading(true);
      setError(null);
      try {
        const member = await membersService.getMe();
        const response = await attendanceService.getAll({
          memberId: member.id,
          limit: 200,
        });
        setRecords(Array.isArray(response.data) ? response.data : []);
      } catch (err) {
        console.error("Error loading progress:", err);
        setError("Failed to load progress data.");
        setRecords([]);
      } finally {
        setLoading(false);
      }
    };

    loadProgress();
  }, []);

  const thisMonthVisits = useMemo(() => {
    const now = new Date();
    return records.filter((record) => {
      const date = new Date(record.checkInTime);
      return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
    }).length;
  }, [records]);

  const classVisits = useMemo(
    () => records.filter((record) => record.type === "CLASS_ATTENDANCE").length,
    [records],
  );

  const gymVisits = useMemo(
    () => records.filter((record) => record.type === "GYM_VISIT").length,
    [records],
  );

  return (
    <MemberLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">My Progress</h1>
            <p className="text-muted-foreground mt-2">Track your gym activity over time</p>
          </div>
        </div>

        {error && (
          <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4 text-destructive">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            icon={<LineChart className="w-6 h-6" />}
            label="Visits This Month"
            value={loading ? "…" : String(thisMonthVisits)}
          />
          <StatCard
            icon={<TrendingUp className="w-6 h-6" />}
            label="Total Visits"
            value={loading ? "…" : String(records.length)}
          />
          <StatCard
            icon={<LineChart className="w-6 h-6" />}
            label="Gym Visits"
            value={loading ? "…" : String(gymVisits)}
          />
          <StatCard
            icon={<LineChart className="w-6 h-6" />}
            label="Class Visits"
            value={loading ? "…" : String(classVisits)}
          />
        </div>

        <div className="bg-card border border-border rounded-lg overflow-hidden">
          <div className="p-6 border-b border-border">
            <h2 className="text-xl font-bold text-foreground">Attendance History</h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Date</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Type</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Class</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Check-in</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Check-out</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {loading ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-6 text-center text-muted-foreground">
                      Loading attendance history...
                    </td>
                  </tr>
                ) : records.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-6 text-center text-muted-foreground">
                      No attendance records found.
                    </td>
                  </tr>
                ) : (
                  records.map((record) => (
                    <tr key={record.id} className="hover:bg-muted/50">
                      <td className="px-6 py-4 text-sm text-foreground">
                        {new Date(record.checkInTime).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-sm text-foreground">
                        {record.type === "GYM_VISIT" ? "Gym Visit" : "Class Attendance"}
                      </td>
                      <td className="px-6 py-4 text-sm text-muted-foreground">
                        {record.classSchedule?.className ?? "—"}
                      </td>
                      <td className="px-6 py-4 text-sm text-muted-foreground">
                        {new Date(record.checkInTime).toLocaleTimeString()}
                      </td>
                      <td className="px-6 py-4 text-sm text-muted-foreground">
                        {record.checkOutTime ? new Date(record.checkOutTime).toLocaleTimeString() : "—"}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </MemberLayout>
  );
}
