import { Link } from "react-router-dom";
import { AdminLayout } from "../../layouts";
import { StatCard, PrimaryButton } from "@/components/gym";
import { useQuery } from "@tanstack/react-query";
import { dashboardService } from "@/services";

export default function AdminDashboardPage() {
  // Fetch dashboard data
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ["dashboard", "stats"],
    queryFn: () => dashboardService.getStats(),
  });

  const { data: recentMembers = [], isLoading: membersLoading } = useQuery({
    queryKey: ["dashboard", "recent-members"],
    queryFn: () => dashboardService.getRecentMembers(),
  });

  const { data: popularClasses = [], isLoading: classesLoading } = useQuery({
    queryKey: ["dashboard", "popular-classes"],
    queryFn: () => dashboardService.getPopularClasses(),
  });

  const { data: upcomingClasses } = useQuery({
    queryKey: ["dashboard", "upcoming-classes", 7],
    queryFn: () => dashboardService.getUpcomingClasses(7),
  });

  const { data: recentActivity = [], isLoading: activityLoading } = useQuery({
    queryKey: ["dashboard", "recent-activity"],
    queryFn: () => dashboardService.getRecentActivity(),
  });

  // Format stats for StatCard component
  const statsData = stats
    ? [
        {
          title: "Total Members",
          value: stats.totalMembers.value.toLocaleString(),
          change: {
            value: stats.totalMembers.change,
            type: stats.totalMembers.type,
          },
          icon: (
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
                d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"
              />
            </svg>
          ),
        },
        {
          title: "Active Memberships",
          value: stats.activeMemberships.value.toLocaleString(),
          change: {
            value: stats.activeMemberships.change,
            type: stats.activeMemberships.type,
          },
          icon: (
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
                d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z"
              />
            </svg>
          ),
        },
        {
          title: "Expiring Memberships",
          value: stats.expiringMemberships.value.toLocaleString(),
          change: {
            value: stats.expiringMemberships.change,
            type: stats.expiringMemberships.type,
          },
          icon: (
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
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          ),
        },
        {
          title: "Today's Check-ins",
          value: stats.todayCheckIns.value.toLocaleString(),
          change: {
            value: stats.todayCheckIns.change,
            type: stats.todayCheckIns.type,
          },
          icon: (
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
          ),
        },
        {
          title: "Monthly Revenue",
          value: `$${stats.monthlyRevenue.value.toLocaleString()}`,
          change: {
            value: stats.monthlyRevenue.change,
            type: stats.monthlyRevenue.type,
          },
          icon: (
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
                d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          ),
        },
        {
          title: "Upcoming Attendance",
          value: upcomingClasses
            ? `${upcomingClasses.totalBookings}/${upcomingClasses.totalCapacity}`
            : "0/0",
          icon: (
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
                d="M8 7V3m8 4V3m-9 8h10m-9 4h6m2 6H6a2 2 0 01-2-2V7a2 2 0 012-2h12a2 2 0 012 2v12a2 2 0 01-2 2z"
              />
            </svg>
          ),
        },
      ]
    : [];

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              Dashboard Overview
            </h1>
            <p className="text-muted-foreground">
              Welcome back, Admin. Here&apos;s what&apos;s happening today.
            </p>
          </div>
          <Link to="/admin/members">
            <PrimaryButton>
              <svg
                className="w-4 h-4 mr-2"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                />
              </svg>
              Add New Member
            </PrimaryButton>
          </Link>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {statsLoading
            ? // Loading skeletons
              Array.from({ length: 6 }).map((_, i) => (
                <div
                  key={i}
                  className="bg-card border border-border rounded-xl p-6 animate-pulse"
                >
                  <div className="h-4 bg-muted rounded w-1/2 mb-4"></div>
                  <div className="h-8 bg-muted rounded w-3/4"></div>
                </div>
              ))
            : statsData.map((stat) => <StatCard key={stat.title} {...stat} />)}
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Members */}
          <div className="lg:col-span-2 bg-card border border-border rounded-xl p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-foreground">
                Recent Members
              </h2>
              <Link
                to="/admin/members"
                className="text-primary text-sm font-medium hover:underline"
              >
                View All
              </Link>
            </div>
            <div className="overflow-x-auto">
              {membersLoading ? (
                <div className="space-y-4">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div
                      key={i}
                      className="h-16 bg-muted rounded animate-pulse"
                    ></div>
                  ))}
                </div>
              ) : recentMembers.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">
                  No recent members
                </p>
              ) : (
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-3 text-sm font-medium text-muted-foreground">
                        Member
                      </th>
                      <th className="text-left py-3 text-sm font-medium text-muted-foreground">
                        Plan
                      </th>
                      <th className="text-left py-3 text-sm font-medium text-muted-foreground">
                        Joined
                      </th>
                      <th className="text-left py-3 text-sm font-medium text-muted-foreground">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentMembers.map((member) => (
                      <tr key={member.id} className="border-b border-border/50">
                        <td className="py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center">
                              <span className="text-primary text-sm font-semibold">
                                {member.name
                                  .split(" ")
                                  .map((n) => n[0])
                                  .join("")}
                              </span>
                            </div>
                            <div>
                              <p className="text-foreground font-medium">
                                {member.name}
                              </p>
                              <p className="text-muted-foreground text-sm">
                                {member.email}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="py-4">
                          <span
                            className={`text-xs font-medium px-2 py-1 rounded-full ${
                              member.plan.toLowerCase().includes("elite")
                                ? "bg-primary/10 text-primary"
                                : member.plan.toLowerCase().includes("pro")
                                  ? "bg-blue-500/10 text-blue-400"
                                  : "bg-secondary text-muted-foreground"
                            }`}
                          >
                            {member.plan}
                          </span>
                        </td>
                        <td className="py-4 text-muted-foreground text-sm">
                          {member.joined}
                        </td>
                        <td className="py-4">
                          <span
                            className={`text-xs font-medium px-2 py-1 rounded-full ${
                              member.status === "active"
                                ? "bg-green-500/10 text-green-400"
                                : "bg-yellow-500/10 text-yellow-400"
                            }`}
                          >
                            {member.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-card border border-border rounded-xl p-6">
            <h2 className="text-lg font-semibold text-foreground mb-6">
              Recent Activity
            </h2>
            {activityLoading ? (
              <div className="space-y-4">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div
                    key={i}
                    className="h-16 bg-muted rounded animate-pulse"
                  ></div>
                ))}
              </div>
            ) : recentActivity.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">
                No recent activity
              </p>
            ) : (
              <div className="space-y-4">
                {recentActivity.map((activity, index) => (
                  <div key={index} className="flex gap-3">
                    <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0" />
                    <div>
                      <p className="text-foreground text-sm font-medium">
                        {activity.action}
                      </p>
                      <p className="text-muted-foreground text-xs">
                        {activity.detail}
                      </p>
                      <p className="text-muted-foreground text-xs mt-1">
                        {activity.time}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Upcoming Classes */}
        <div className="bg-card border border-border rounded-xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-foreground">
              Upcoming Attendance (Next 7 Days)
            </h2>
            <Link
              to="/admin/classes"
              className="text-primary text-sm font-medium hover:underline"
            >
              Manage Classes
            </Link>
          </div>
          {!upcomingClasses ? (
            <p className="text-muted-foreground text-center py-8">
              Loading upcoming classes...
            </p>
          ) : upcomingClasses.totalUpcomingClasses === 0 ? (
            <p className="text-muted-foreground text-center py-8">
              No upcoming classes scheduled
            </p>
          ) : (
            <div className="space-y-4">
              <div className="flex flex-wrap items-center gap-4">
                <div className="rounded-lg bg-background border border-border px-4 py-3">
                  <p className="text-xs text-muted-foreground">Total Booked</p>
                  <p className="text-lg font-semibold text-foreground">
                    {upcomingClasses.totalBookings}
                  </p>
                </div>
                <div className="rounded-lg bg-background border border-border px-4 py-3">
                  <p className="text-xs text-muted-foreground">Total Capacity</p>
                  <p className="text-lg font-semibold text-foreground">
                    {upcomingClasses.totalCapacity}
                  </p>
                </div>
                <div className="rounded-lg bg-background border border-border px-4 py-3">
                  <p className="text-xs text-muted-foreground">Utilization</p>
                  <p className="text-lg font-semibold text-foreground">
                    {upcomingClasses.utilization}%
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                {upcomingClasses.topClasses.map((cls) => (
                  <div
                    key={cls.id}
                    className="bg-background border border-border rounded-lg p-4"
                  >
                    <h3 className="font-medium text-foreground mb-1">
                      {cls.name}
                    </h3>
                    <p className="text-muted-foreground text-sm mb-2">
                      {cls.trainer}
                    </p>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">
                        {new Date(cls.startTime).toLocaleDateString()}
                      </span>
                      <span
                        className={`font-medium ${
                          cls.booked === cls.capacity
                            ? "text-destructive"
                            : "text-primary"
                        }`}
                      >
                        {cls.booked}/{cls.capacity}
                      </span>
                    </div>
                    <div className="mt-2 h-1.5 bg-secondary rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${
                          cls.booked === cls.capacity
                            ? "bg-destructive"
                            : "bg-primary"
                        }`}
                        style={{
                          width: `${(cls.booked / cls.capacity) * 100}%`,
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Popular Classes */}
        <div className="bg-card border border-border rounded-xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-foreground">
              Popular Classes Today
            </h2>
            <Link
              to="/admin/classes"
              className="text-primary text-sm font-medium hover:underline"
            >
              Manage Classes
            </Link>
          </div>
          {classesLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <div
                  key={i}
                  className="h-32 bg-muted rounded-lg animate-pulse"
                ></div>
              ))}
            </div>
          ) : popularClasses.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">
              No classes scheduled for today
            </p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
              {popularClasses.map((cls) => (
                <div
                  key={cls.id}
                  className="bg-background border border-border rounded-lg p-4"
                >
                  <h3 className="font-medium text-foreground mb-1">
                    {cls.name}
                  </h3>
                  <p className="text-muted-foreground text-sm mb-2">
                    {cls.trainer}
                  </p>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">{cls.time}</span>
                    <span
                      className={`font-medium ${
                        cls.enrolled === cls.capacity
                          ? "text-destructive"
                          : "text-primary"
                      }`}
                    >
                      {cls.enrolled}/{cls.capacity}
                    </span>
                  </div>
                  <div className="mt-2 h-1.5 bg-secondary rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${
                        cls.enrolled === cls.capacity
                          ? "bg-destructive"
                          : "bg-primary"
                      }`}
                      style={{
                        width: `${(cls.enrolled / cls.capacity) * 100}%`,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
