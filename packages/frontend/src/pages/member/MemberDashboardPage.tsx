import { Link } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import { MemberLayout } from "../../layouts";
import { StatCard, PrimaryButton, WorkoutPlanCard } from "@/components/gym";
import {
  attendanceService,
  type AttendanceRecord,
  type AttendanceType,
} from "@/services/attendance.service";
import { membersService } from "@/services/members.service";
import type { WorkoutPlan } from "@/services/workout-plans.service";
import { toast } from "sonner";

interface BookingView {
  id: string;
  name: string;
  trainer?: string;
  startTime: Date;
  duration: number;
}

function mapGoal(
  goal: string,
): "muscle" | "fat-loss" | "strength" | "endurance" {
  switch (goal) {
    case "WEIGHT_LOSS":
      return "fat-loss";
    case "MUSCLE_GAIN":
      return "muscle";
    case "ENDURANCE":
      return "endurance";
    case "FLEXIBILITY":
      return "strength";
    default:
      return "strength";
  }
}

function calculateStreak(records: AttendanceRecord[]): number {
  if (records.length === 0) return 0;
  const dates = new Set(
    records.map((record) => new Date(record.checkInTime).toDateString()),
  );
  let streak = 0;
  let cursor = new Date();

  while (dates.has(cursor.toDateString())) {
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }

  return streak;
}

export default function MemberDashboardPage() {
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [workoutPlans, setWorkoutPlans] = useState<WorkoutPlan[]>([]);
  const [bookings, setBookings] = useState<BookingView[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [memberName, setMemberName] = useState<string>("Member");
  const [memberActive, setMemberActive] = useState(true);
  const [currentSubscription, setCurrentSubscription] = useState<any>(null);
  const [memberId, setMemberId] = useState<string | null>(null);
  const [activeAttendance, setActiveAttendance] =
    useState<AttendanceRecord | null>(null);
  const [checkingIn, setCheckingIn] = useState(false);
  const [checkingOut, setCheckingOut] = useState(false);

  useEffect(() => {
    const loadDashboard = async () => {
      setLoading(true);
      setError(null);
      try {
        const member = await membersService.getMe();
        setMemberId(member.id);
        setMemberName(
          `${member.firstName} ${member.lastName}`.trim() || "Member",
        );
        setMemberActive(member.isActive);

        // Get active subscription
        const activeSubscription = member.subscriptions?.find(
          (sub: any) => sub.status === "ACTIVE",
        );
        setCurrentSubscription(activeSubscription);

        const [attendanceResponse, plansResponse, bookingsResponse] =
          await Promise.all([
            attendanceService.getAll({ memberId: member.id, limit: 200 }),
            membersService.getMyWorkoutPlans(),
            membersService.getMyBookings(),
          ]);

        setAttendance(
          Array.isArray(attendanceResponse.data) ? attendanceResponse.data : [],
        );
        const openRecord = Array.isArray(attendanceResponse.data)
          ? attendanceResponse.data.find((record: AttendanceRecord) => !record.checkOutTime)
          : null;
        setActiveAttendance(openRecord ?? null);
        setWorkoutPlans(Array.isArray(plansResponse) ? plansResponse : []);

        const now = new Date();
        const normalizedBookings = Array.isArray(bookingsResponse)
          ? bookingsResponse
              .map((booking: any) => {
                const startTime = booking.classSchedule?.startTime
                  ? new Date(booking.classSchedule.startTime)
                  : null;
                if (!startTime) return null;
                return {
                  id: booking.id,
                  name: booking.class?.name || "Class",
                  trainer: booking.class?.trainer
                    ? `${booking.class.trainer.firstName} ${booking.class.trainer.lastName}`
                    : undefined,
                  startTime,
                  duration: booking.class?.duration || 0,
                } as BookingView;
              })
              .filter(Boolean)
              .filter(
                (booking: BookingView | null) =>
                  booking && booking.startTime >= now,
              )
              .sort(
                (a: BookingView, b: BookingView) =>
                  a.startTime.getTime() - b.startTime.getTime(),
              )
          : [];
        setBookings(normalizedBookings as BookingView[]);
      } catch (err) {
        console.error("Error loading member dashboard:", err);
        setError("Failed to load dashboard data.");
        setAttendance([]);
        setWorkoutPlans([]);
        setBookings([]);
        setActiveAttendance(null);
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, []);

  const handleCheckIn = async () => {
    if (!memberId) return;
    setCheckingIn(true);
    try {
      const record = await attendanceService.checkIn({
        memberId,
        type: "GYM_VISIT" as AttendanceType,
      });
      toast.success("Checked in successfully");
      setActiveAttendance(record);
      setAttendance((prev) => [record, ...prev]);
    } catch (err: any) {
      const message =
        err.response?.data?.message || "Failed to check in.";
      toast.error(message);
    } finally {
      setCheckingIn(false);
    }
  };

  const handleCheckOut = async () => {
    if (!activeAttendance) return;
    setCheckingOut(true);
    try {
      const record = await attendanceService.checkOut(activeAttendance.id);
      toast.success("Checked out successfully");
      setActiveAttendance(null);
      setAttendance((prev) =>
        prev.map((item) => (item.id === record.id ? record : item)),
      );
    } catch (err: any) {
      const message =
        err.response?.data?.message || "Failed to check out.";
      toast.error(message);
    } finally {
      setCheckingOut(false);
    }
  };

  const thisMonthVisits = useMemo(() => {
    const now = new Date();
    return attendance.filter((record) => {
      const date = new Date(record.checkInTime);
      return (
        date.getMonth() === now.getMonth() &&
        date.getFullYear() === now.getFullYear()
      );
    }).length;
  }, [attendance]);

  const classesAttended = useMemo(
    () =>
      attendance.filter((record) => record.type === "CLASS_ATTENDANCE").length,
    [attendance],
  );

  const streak = useMemo(() => calculateStreak(attendance), [attendance]);

  const latestPlan = workoutPlans[0];
  const planExercises = Array.isArray(latestPlan?.exercises)
    ? latestPlan.exercises
    : [];

  const suggestedPlans = workoutPlans.slice(0, 2).map((plan) => ({
    title: plan.name,
    goal: mapGoal(plan.goal),
    difficulty: "beginner" as const,
    duration: "4 weeks",
    daysPerWeek: 3,
    exercises: Array.isArray(plan.exercises) ? plan.exercises.length : 0,
    description: plan.description || "",
  }));

  return (
    <MemberLayout>
      <div className="space-y-6">
        <div className="bg-gradient-to-r from-primary/20 to-accent/20 rounded-2xl p-6 md:p-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-foreground mb-2">
                Welcome back, {memberName}!
              </h1>
              <p className="text-muted-foreground">
                {streak > 0
                  ? `You're on a ${streak}-day streak. Keep it up!`
                  : "Let's start a new streak today."}
              </p>
              {currentSubscription && (
                <div className="mt-3 inline-flex items-center gap-2 bg-primary/10 text-primary px-3 py-1.5 rounded-full text-sm font-medium">
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  {currentSubscription.membershipPlan?.name || "Active Plan"} -
                  Expires{" "}
                  {new Date(currentSubscription.endDate).toLocaleDateString()}
                </div>
              )}
              {!currentSubscription && (
                <div className="mt-3">
                  <Link
                    to="/member/plans"
                    className="inline-flex items-center gap-2 bg-accent/20 text-accent px-3 py-1.5 rounded-full text-sm font-medium hover:bg-accent/30 transition-colors"
                  >
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 4v16m8-8H4"
                      />
                    </svg>
                    Subscribe to a Plan
                  </Link>
                </div>
              )}
            </div>
            {activeAttendance ? (
              <PrimaryButton onClick={handleCheckOut} disabled={checkingOut}>
                {checkingOut ? "Checking out..." : "Check Out"}
              </PrimaryButton>
            ) : (
              <PrimaryButton onClick={handleCheckIn} disabled={checkingIn}>
                {checkingIn ? "Checking in..." : "Check In Now"}
              </PrimaryButton>
            )}
          </div>
        </div>

        {error && (
          <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4 text-destructive">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="This Month Visits"
            value={loading ? "…" : String(thisMonthVisits)}
            icon={
              <svg
                className="w-6 h-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
                />
              </svg>
            }
          />
          <StatCard
            title="Classes Attended"
            value={loading ? "…" : String(classesAttended)}
            icon={
              <svg
                className="w-6 h-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
            }
          />
          <StatCard
            title="Current Streak"
            value={loading ? "…" : `${streak} days`}
            icon={
              <svg
                className="w-6 h-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z"
                />
              </svg>
            }
          />
          <StatCard
            title="Membership Plan"
            value={
              loading
                ? "…"
                : currentSubscription
                  ? currentSubscription.membershipPlan?.name || "Active"
                  : "No Plan"
            }
            icon={
              <svg
                className="w-6 h-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"
                />
              </svg>
            }
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-card border border-border rounded-xl p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-foreground">
                Latest Workout Plan
              </h2>
              <span className="text-primary text-sm font-medium">
                {planExercises.length} exercises
              </span>
            </div>

            <h3 className="text-xl font-bold text-foreground mb-4">
              {latestPlan?.name || "No workout plan assigned"}
            </h3>

            <div className="space-y-3">
              {planExercises.length > 0 ? (
                planExercises
                  .slice(0, 6)
                  .map((exercise: any, index: number) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-4 rounded-lg border bg-secondary/30 border-border"
                    >
                      <div className="flex items-center gap-3">
                        <span className="font-medium text-foreground">
                          {exercise.name || `Exercise ${index + 1}`}
                        </span>
                      </div>
                      <span className="text-muted-foreground text-sm">
                        {exercise.sets ? `${exercise.sets} sets` : "Sets"} x{" "}
                        {exercise.reps || "reps"}
                      </span>
                    </div>
                  ))
              ) : (
                <div className="text-muted-foreground">
                  No exercises available.
                </div>
              )}
            </div>

            <div className="mt-6 flex gap-4">
              <PrimaryButton className="flex-1">View Plan</PrimaryButton>
              <button className="px-4 py-2 text-muted-foreground hover:text-foreground transition-colors">
                Skip Today
              </button>
            </div>
          </div>

          <div className="bg-card border border-border rounded-xl p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-foreground">
                Upcoming Classes
              </h2>
              <Link
                to="/member/classes"
                className="text-primary text-sm font-medium hover:underline"
              >
                View All
              </Link>
            </div>

            <div className="space-y-4">
              {bookings.length > 0 ? (
                bookings.slice(0, 3).map((cls) => (
                  <div key={cls.id} className="p-4 bg-secondary/30 rounded-lg">
                    <h3 className="font-medium text-foreground">{cls.name}</h3>
                    <p className="text-muted-foreground text-sm mt-1">
                      {cls.trainer || "TBA"}
                    </p>
                    <div className="flex items-center justify-between mt-3">
                      <span className="text-sm text-muted-foreground">
                        {cls.startTime.toLocaleDateString()}{" "}
                        {cls.startTime.toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                      <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">
                        {cls.duration} min
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-muted-foreground">
                  No upcoming classes.
                </div>
              )}
            </div>

            <button className="w-full mt-4 py-3 border border-dashed border-border rounded-lg text-muted-foreground hover:text-foreground hover:border-primary/50 transition-colors">
              + Book Another Class
            </button>
          </div>
        </div>

        <div>
          <h2 className="text-lg font-semibold text-foreground mb-4">
            Recommended For You
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {suggestedPlans.length > 0 ? (
              suggestedPlans.map((plan) => (
                <WorkoutPlanCard
                  key={plan.title}
                  title={plan.title}
                  goal={plan.goal}
                  difficulty={plan.difficulty}
                  duration={plan.duration}
                  daysPerWeek={plan.daysPerWeek}
                  exercises={plan.exercises}
                  description={plan.description}
                />
              ))
            ) : (
              <div className="text-muted-foreground">
                No workout plans available.
              </div>
            )}
          </div>
        </div>
      </div>
    </MemberLayout>
  );
}
