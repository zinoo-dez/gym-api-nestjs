import React, { useEffect, useMemo, useState } from "react";
import { AdminLayout } from "@/layouts";
import { PrimaryButton, FormInput } from "@/components/gym";
import { FormSelect } from "@/components/gym/form-select";
import { FormModal } from "@/components/gym/form-modal";
import { FormSearchableSelect } from "@/components/gym/form-searchable-select";
import { attendanceService, type AttendanceRecord, type AttendanceType } from "@/services/attendance.service";
import { membersService, type Member } from "@/services/members.service";
import { classesService, type ClassSchedule } from "@/services/classes.service";
import { toast } from "sonner";

export default function AdminAttendancePage() {
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [typeFilter, setTypeFilter] = useState<"all" | AttendanceType>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [isCheckInOpen, setIsCheckInOpen] = useState(false);
  const [checkingIn, setCheckingIn] = useState(false);
  const [checkingOutId, setCheckingOutId] = useState<string | null>(null);
  const [checkInForm, setCheckInForm] = useState({
    memberId: "",
    type: "GYM_VISIT" as AttendanceType,
    classScheduleId: "",
  });

  const [members, setMembers] = useState<Member[]>([]);
  const [classSchedules, setClassSchedules] = useState<ClassSchedule[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const [attendanceRes, membersRes, classesRes] = await Promise.all([
          attendanceService.getAll({ limit: 100 }),
          membersService.getAll({ limit: 1000 }),
          classesService.getAll({ limit: 1000 }),
        ]);

        setRecords(Array.isArray(attendanceRes.data) ? attendanceRes.data : []);
        setMembers(Array.isArray(membersRes.data) ? membersRes.data : (membersRes as any).data || []);
        setClassSchedules(Array.isArray(classesRes.data) ? classesRes.data : (classesRes as any).data || []);
      } catch (err) {
        console.error("Error loading attendance data:", err);
        setError("Failed to load attendance records.");
        setRecords([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
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

  const memberOptions = useMemo(() => 
    members.map((member) => ({
      label: `${member.firstName} ${member.lastName} (${member.email})`,
      value: member.id,
    })),
  [members]);

  const classOptions = useMemo(() => 
    classSchedules.map((schedule) => ({
      label: `${schedule.name} (${schedule.trainerName || "No Trainer"})`,
      value: schedule.id,
    })),
  [classSchedules]);

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Attendance</h1>
            <p className="text-muted-foreground">Track member check-ins and class attendance.</p>
          </div>
          <div className="flex items-center gap-2">
            <PrimaryButton onClick={() => setIsCheckInOpen(true)}>
              Manual Check-In
            </PrimaryButton>
            <PrimaryButton>Export Attendance</PrimaryButton>
          </div>
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
                  <th className="px-4 py-3 text-right text-sm font-medium text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">
                      Loading attendance...
                    </td>
                  </tr>
                ) : error ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-destructive">
                      {error}
                    </td>
                  </tr>
                ) : filteredRecords.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">
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
                      <td className="px-4 py-4 text-right">
                        {record.checkOutTime ? (
                          <span className="text-xs text-muted-foreground">Closed</span>
                        ) : (
                          <button
                            type="button"
                            onClick={async () => {
                              setCheckingOutId(record.id);
                              try {
                                const updated = await attendanceService.checkOut(record.id);
                                setRecords((prev) =>
                                  prev.map((item) => (item.id === updated.id ? updated : item)),
                                );
                                toast.success("Checked out");
                              } catch (err: any) {
                                toast.error(
                                  err?.response?.data?.message || "Failed to check out",
                                );
                              } finally {
                                setCheckingOutId(null);
                              }
                            }}
                            className="text-sm text-primary hover:underline"
                            disabled={checkingOutId === record.id}
                          >
                            {checkingOutId === record.id ? "Checking..." : "Check Out"}
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        <FormModal
          isOpen={isCheckInOpen}
          onClose={() => setIsCheckInOpen(false)}
          title="Manual Check-In"
          onSubmit={async () => {
            if (!checkInForm.memberId) {
              toast.error("Please select a member");
              return;
            }
            if (checkInForm.type === "CLASS_ATTENDANCE" && !checkInForm.classScheduleId) {
              toast.error("Please select a class");
              return;
            }

            setCheckingIn(true);
            try {
              const record = await attendanceService.checkIn({
                memberId: checkInForm.memberId,
                type: checkInForm.type,
                classScheduleId:
                  checkInForm.type === "CLASS_ATTENDANCE"
                    ? checkInForm.classScheduleId
                    : undefined,
              });
              setRecords((prev) => [record, ...prev]);
              toast.success("Check-in recorded");
              setIsCheckInOpen(false);
              setCheckInForm({ memberId: "", type: "GYM_VISIT", classScheduleId: "" });
            } catch (err: any) {
              toast.error(
                err?.response?.data?.message || "Failed to check in",
              );
            } finally {
              setCheckingIn(false);
            }
          }}
          submitText="Check In"
          isLoading={checkingIn}
        >
          <FormSearchableSelect
            label="Member"
            value={checkInForm.memberId}
            onChange={(val) =>
              setCheckInForm((prev) => ({ ...prev, memberId: val }))
            }
            options={memberOptions}
            placeholder="Search member..."
            required
          />
          <FormSelect
            label="Type"
            value={checkInForm.type}
            onChange={(e) =>
              setCheckInForm((prev) => ({
                ...prev,
                type: e.target.value as AttendanceType,
              }))
            }
            options={[
              { label: "Gym Visit", value: "GYM_VISIT" },
              { label: "Class Attendance", value: "CLASS_ATTENDANCE" },
            ]}
          />
          {checkInForm.type === "CLASS_ATTENDANCE" && (
            <FormSearchableSelect
              label="Class Schedule"
              value={checkInForm.classScheduleId}
              onChange={(val) =>
                setCheckInForm((prev) => ({
                  ...prev,
                  classScheduleId: val,
                }))
              }
              options={classOptions}
              placeholder="Search class..."
              required
            />
          )}
        </FormModal>
      </div>
    </AdminLayout>
  );
}
