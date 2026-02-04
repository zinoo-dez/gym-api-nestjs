import React, { useEffect, useMemo, useState } from "react";
import { AdminLayout } from "@/layouts";
import { PrimaryButton } from "@/components/gym";
import { attendanceService, type AttendanceRecord, type AttendanceType } from "@/services/attendance.service";

export default function AdminAttendancePage() {
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [typeFilter, setTypeFilter] = useState<"all" | AttendanceType>("all");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const loadAttendance = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await attendanceService.getAll({ limit: 100 });
        setRecords(Array.isArray(response.data) ? response.data : []);
      } catch (err) {
        console.error("Error loading attendance:", err);
        setError("Failed to load attendance records.");
        setRecords([]);
      } finally {
        setLoading(false);
      }
    };

    loadAttendance();
  }, []);

  const filteredRecords = useMemo(() => {
    const query = searchQuery.toLowerCase();
    return records.filter((record) => {
      const name = record.member
        ? `${record.member.firstName} ${record.member.lastName}`.toLowerCase()
        : "";
      const email = record.member?.email?.toLowerCase() ?? "";
      const matchesSearch =
        name.includes(query) ||
        email.includes(query) ||
        record.memberId.toLowerCase().includes(query);
      const matchesType = typeFilter === "all" || record.type === typeFilter;
      return matchesSearch && matchesType;
    });
  }, [records, searchQuery, typeFilter]);

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Attendance</h1>
            <p className="text-muted-foreground">Track member check-ins and class attendance.</p>
          </div>
          <PrimaryButton>Export Attendance</PrimaryButton>
        </div>

        <div className="flex flex-col gap-4 sm:flex-row">
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="Search by member name, email, or ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-lg border border-border bg-card py-2 pl-4 pr-4 text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value as "all" | AttendanceType)}
            className="rounded-lg border border-border bg-card px-3 py-2 text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          >
            <option value="all">All Types</option>
            <option value="GYM_VISIT">Gym Visit</option>
            <option value="CLASS_ATTENDANCE">Class Attendance</option>
          </select>
        </div>

        <div className="overflow-hidden rounded-lg border border-border bg-card">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-muted/50">
                  <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Member</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Type</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Check-in</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Check-out</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Class</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {loading ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">
                      Loading attendance...
                    </td>
                  </tr>
                ) : error ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-8 text-center text-destructive">
                      {error}
                    </td>
                  </tr>
                ) : filteredRecords.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">
                      No attendance records found.
                    </td>
                  </tr>
                ) : (
                  filteredRecords.map((record) => (
                    <tr key={record.id} className="transition-colors hover:bg-muted/30">
                      <td className="px-4 py-4">
                        <div>
                          <p className="text-foreground font-medium">
                            {record.member
                              ? `${record.member.firstName} ${record.member.lastName}`
                              : record.memberId}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {record.member?.email ?? "—"}
                          </p>
                        </div>
                      </td>
                      <td className="px-4 py-4 text-muted-foreground">
                        {record.type === "GYM_VISIT" ? "Gym Visit" : "Class Attendance"}
                      </td>
                      <td className="px-4 py-4 text-muted-foreground">
                        {new Date(record.checkInTime).toLocaleString()}
                      </td>
                      <td className="px-4 py-4 text-muted-foreground">
                        {record.checkOutTime ? new Date(record.checkOutTime).toLocaleString() : "—"}
                      </td>
                      <td className="px-4 py-4 text-muted-foreground">
                        {record.classSchedule?.className ?? "—"}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
