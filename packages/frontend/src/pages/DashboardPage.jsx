/**
 * DashboardPage Component
 * Main dashboard with overview widgets and quick actions
 */

import { Link } from "react-router-dom";
import { useMembers } from "../hooks/useMembers.js";
import { useClasses } from "../hooks/useClasses.js";
import { useAttendance } from "../hooks/useAttendance.js";
import { LoadingSpinner } from "../components/common/index.js";
import { AnimatedPage } from "../components/animated/index.js";

export function DashboardPage() {
  // Get today's date for filtering
  const today = new Date().toISOString().split("T")[0];

  // Fetch dashboard data
  const { data: membersData, isLoading: membersLoading } = useMembers({
    limit: 1000,
  });
  const { data: classesData, isLoading: classesLoading } = useClasses({
    date: today,
    status: "scheduled",
  });
  const { data: attendanceData, isLoading: attendanceLoading } = useAttendance({
    startDate: today,
    endDate: today,
  });

  // Calculate metrics
  const totalMembers = membersData?.data?.length || 0;
  const activeMembers =
    membersData?.data?.filter((m) => m.status === "active").length || 0;
  const todayClasses = classesData?.data?.length || 0;
  const todayAttendance = attendanceData?.data?.length || 0;

  // Get upcoming classes (next 3)
  const upcomingClasses = classesData?.data?.slice(0, 3) || [];

  // Quick action items
  const quickActions = [
    {
      title: "Add Member",
      description: "Register a new gym member",
      icon: "👤",
      link: "/members/new",
      color: "blue",
    },
    {
      title: "Schedule Class",
      description: "Create a new class session",
      icon: "📅",
      link: "/classes/new",
      color: "green",
    },
    {
      title: "Record Attendance",
      description: "Check-in a member",
      icon: "✓",
      link: "/attendance",
      color: "purple",
    },
    {
      title: "Create Workout",
      description: "Design a workout plan",
      icon: "🏋️",
      link: "/workouts/new",
      color: "orange",
    },
  ];

  const isLoading = membersLoading || classesLoading || attendanceLoading;

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <AnimatedPage className="px-2 sm:px-0">
      <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4 sm:mb-6">Dashboard</h1>

      {/* Overview Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
        {/* Total Members */}
        <div className="bg-white rounded-lg shadow-md p-4 sm:p-6 border-l-4 border-blue-500">
          <div className="flex items-center justify-between">
            <div className="flex-1 min-w-0">
              <p className="text-xs sm:text-sm font-medium text-gray-600 truncate">Total Members</p>
              <p className="text-2xl sm:text-3xl font-bold text-gray-900 mt-1 sm:mt-2">
                {totalMembers}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                {activeMembers} active
              </p>
            </div>
            <div className="text-3xl sm:text-4xl ml-2">👥</div>
          </div>
        </div>

        {/* Today's Classes */}
        <div className="bg-white rounded-lg shadow-md p-4 sm:p-6 border-l-4 border-green-500">
          <div className="flex items-center justify-between">
            <div className="flex-1 min-w-0">
              <p className="text-xs sm:text-sm font-medium text-gray-600 truncate">
                Today's Classes
              </p>
              <p className="text-2xl sm:text-3xl font-bold text-gray-900 mt-1 sm:mt-2">
                {todayClasses}
              </p>
              <p className="text-xs text-gray-500 mt-1">Scheduled sessions</p>
            </div>
            <div className="text-3xl sm:text-4xl ml-2">📅</div>
          </div>
        </div>

        {/* Today's Attendance */}
        <div className="bg-white rounded-lg shadow-md p-4 sm:p-6 border-l-4 border-purple-500">
          <div className="flex items-center justify-between">
            <div className="flex-1 min-w-0">
              <p className="text-xs sm:text-sm font-medium text-gray-600 truncate">
                Today's Attendance
              </p>
              <p className="text-2xl sm:text-3xl font-bold text-gray-900 mt-1 sm:mt-2">
                {todayAttendance}
              </p>
              <p className="text-xs text-gray-500 mt-1">Check-ins today</p>
            </div>
            <div className="text-3xl sm:text-4xl ml-2">✓</div>
          </div>
        </div>

        {/* Attendance Rate */}
        <div className="bg-white rounded-lg shadow-md p-4 sm:p-6 border-l-4 border-orange-500">
          <div className="flex items-center justify-between">
            <div className="flex-1 min-w-0">
              <p className="text-xs sm:text-sm font-medium text-gray-600 truncate">
                Attendance Rate
              </p>
              <p className="text-2xl sm:text-3xl font-bold text-gray-900 mt-1 sm:mt-2">
                {activeMembers > 0
                  ? Math.round((todayAttendance / activeMembers) * 100)
                  : 0}
                %
              </p>
              <p className="text-xs text-gray-500 mt-1">Of active members</p>
            </div>
            <div className="text-3xl sm:text-4xl ml-2">📊</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
          <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-3 sm:mb-4">
            Quick Actions
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            {quickActions.map((action) => (
              <Link
                key={action.title}
                to={action.link}
                className={`p-3 sm:p-4 rounded-lg border-2 border-${action.color}-200 hover:border-${action.color}-400 hover:bg-${action.color}-50 transition-all group min-h-[80px] sm:min-h-0`}
              >
                <div className="flex items-start space-x-2 sm:space-x-3">
                  <div className="text-2xl sm:text-3xl">{action.icon}</div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-sm sm:text-base text-gray-900 group-hover:text-gray-700 truncate">
                      {action.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-gray-600 mt-1 line-clamp-2">
                      {action.description}
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Upcoming Classes */}
        <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
          <div className="flex items-center justify-between mb-3 sm:mb-4">
            <h2 className="text-lg sm:text-xl font-semibold text-gray-900">
              Upcoming Classes Today
            </h2>
            <Link
              to="/classes"
              className="text-xs sm:text-sm text-blue-600 hover:text-blue-800 font-medium whitespace-nowrap"
            >
              <span className="hidden sm:inline">View All →</span>
              <span className="sm:hidden">All →</span>
            </Link>
          </div>

          {upcomingClasses.length === 0 ? (
            <div className="text-center py-6 sm:py-8 text-gray-500">
              <p className="text-3xl sm:text-4xl mb-2">📅</p>
              <p className="text-sm sm:text-base">No classes scheduled for today</p>
            </div>
          ) : (
            <div className="space-y-2 sm:space-y-3">
              {upcomingClasses.map((classItem) => (
                <Link
                  key={classItem.id}
                  to={`/classes/${classItem.id}`}
                  className="block p-3 sm:p-4 rounded-lg border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-all"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-sm sm:text-base text-gray-900 truncate">
                        {classItem.name}
                      </h3>
                      <p className="text-xs sm:text-sm text-gray-600 mt-1 truncate">
                        {classItem.trainer?.firstName}{" "}
                        {classItem.trainer?.lastName}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {new Date(classItem.startTime).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}{" "}
                        -{" "}
                        {new Date(classItem.endTime).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <div className="text-xs sm:text-sm font-medium text-gray-900">
                        {classItem.enrolled || 0}/{classItem.capacity}
                      </div>
                      <div className="text-xs text-gray-500">enrolled</div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Recent Activity Section */}
      <div className="mt-4 sm:mt-6 bg-white rounded-lg shadow-md p-4 sm:p-6">
        <div className="flex items-center justify-between mb-3 sm:mb-4">
          <h2 className="text-lg sm:text-xl font-semibold text-gray-900">
            Recent Activity
          </h2>
        </div>
        <div className="space-y-2 sm:space-y-3">
          {attendanceData?.data?.slice(0, 5).map((record) => (
            <div
              key={record.id}
              className="flex items-center justify-between p-2 sm:p-3 rounded-lg bg-gray-50 gap-2"
            >
              <div className="flex items-center space-x-2 sm:space-x-3 min-w-0 flex-1">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-semibold text-xs sm:text-sm flex-shrink-0">
                  {record.member?.firstName?.[0]}
                  {record.member?.lastName?.[0]}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-sm sm:text-base text-gray-900 truncate">
                    {record.member?.firstName} {record.member?.lastName}
                  </p>
                  <p className="text-xs sm:text-sm text-gray-600 truncate">
                    {record.type === "gym_entry"
                      ? "Gym Check-in"
                      : "Class Attendance"}
                  </p>
                </div>
              </div>
              <div className="text-xs sm:text-sm text-gray-500 flex-shrink-0">
                {new Date(record.checkInTime).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </div>
            </div>
          ))}
          {(!attendanceData?.data || attendanceData.data.length === 0) && (
            <div className="text-center py-6 sm:py-8 text-gray-500">
              <p className="text-3xl sm:text-4xl mb-2">📋</p>
              <p className="text-sm sm:text-base">No recent activity</p>
            </div>
          )}
        </div>
      </div>
    </AnimatedPage>
  );
}
