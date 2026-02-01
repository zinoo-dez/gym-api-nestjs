/**
 * DashboardPage Component
 * Main dashboard with overview widgets and quick actions
 */

import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useMembers } from "../hooks/useMembers.js";
import { useClasses } from "../hooks/useClasses.js";
import { useAttendance } from "../hooks/useAttendance.js";
import { LoadingSpinner } from "../components/common/index.js";
import { AnimatedPage } from "../components/animated/index.js";
import { Button } from "../components/common/Button.jsx";

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
      description: "Register a new elite member",
      icon: "👤",
      link: "/members/new",
      color: "blue",
    },
    {
      title: "Schedule Class",
      description: "Create a new session",
      icon: "📅",
      link: "/classes/new",
      color: "emerald",
    },
    {
      title: "Attendance",
      description: "Initiate daily protocol",
      icon: "✓",
      link: "/attendance",
      color: "indigo",
    },
    {
      title: "Workout Plan",
      description: "Design performance cycle",
      icon: "🏋️",
      link: "/workouts/new",
      color: "violet",
    },
  ];

  const isLoading = membersLoading || classesLoading || attendanceLoading;

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-[60vh]">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin" />
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-[10px] font-black uppercase text-blue-500 animate-pulse">GYM</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <AnimatedPage className="pb-12 text-white">
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
        <div>
          <h1 className="text-4xl sm:text-5xl font-black italic uppercase tracking-tighter mb-2">
            Control <span className="text-gradient">Center</span>
          </h1>
          <p className="text-gray-500 font-bold uppercase tracking-[0.2em] text-[10px]">System Operational // {new Date().toLocaleDateString()}</p>
        </div>
        <div className="flex gap-4">
          <Link to="/attendance">
            <Button variant="premium" className="px-6 !py-2.5 text-[10px] uppercase tracking-widest font-black">
              Check-in Now
            </Button>
          </Link>
        </div>
      </div>

      {/* Overview Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        {[
          { label: "Elite Members", val: totalMembers, sub: `${activeMembers} Active`, icon: "👥", color: "from-blue-600/20" },
          { label: "Sessions Today", val: todayClasses, sub: "Scheduled", icon: "📅", color: "from-emerald-600/20" },
          { label: "Check-ins Today", val: todayAttendance, sub: "Attendance", icon: "✓", color: "from-indigo-600/20" },
          { 
            label: "Performance", 
            val: activeMembers > 0 ? Math.round((todayAttendance / activeMembers) * 100) : 0, 
            sub: "% Capacity", 
            icon: "📊", 
            color: "from-violet-600/20" 
          },
        ].map((stat, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className={`glass-morphism rounded-[2rem] p-8 border-l-4 ${i === 0 ? 'border-blue-500' : i === 1 ? 'border-emerald-500' : i === 2 ? 'border-indigo-500' : 'border-violet-500'} relative overflow-hidden group`}
          >
            <div className={`absolute inset-0 bg-gradient-to-br ${stat.color} to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
            <div className="flex items-center justify-between relative z-10">
              <div className="flex-1 min-w-0">
                <p className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-2 truncate">{stat.label}</p>
                <p className="text-4xl font-black italic tracking-tighter text-white mb-1">
                  {stat.val}{stat.label === "Performance" ? "%" : ""}
                </p>
                <div className="flex items-center gap-1.5">
                  <span className="w-1 h-1 rounded-full bg-blue-500 animate-pulse" />
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{stat.sub}</p>
                </div>
              </div>
              <div className="text-4xl opacity-20 group-hover:opacity-100 group-hover:scale-110 transition-all duration-500 grayscale group-hover:grayscale-0">{stat.icon}</div>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Quick Actions */}
        <div className="lg:col-span-2 glass-morphism rounded-[2.5rem] p-8 sm:p-10">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-xl font-black italic uppercase tracking-tighter">Quick Protocol</h2>
            <div className="w-8 h-[2px] bg-white/10" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {quickActions.map((action, i) => (
              <motion.div
                key={i}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Link
                  to={action.link}
                  className="block p-6 rounded-2xl bg-white/[0.03] border border-white/5 hover:border-white/20 transition-all group overflow-hidden relative"
                >
                  <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-white/5 to-transparent rounded-bl-full translate-x-12 -translate-y-12" />
                  <div className="flex items-start space-x-4 relative z-10">
                    <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center text-2xl group-hover:bg-blue-600 transition-colors duration-500">
                      {action.icon}
                    </div>
                    <div className="flex-1 min-w-0 pt-1">
                      <h3 className="font-black text-xs uppercase tracking-widest text-white mb-1 group-hover:text-blue-400 transition-colors">
                        {action.title}
                      </h3>
                      <p className="text-[10px] font-medium text-gray-500 uppercase tracking-wider">
                        {action.description}
                      </p>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Upcoming Classes */}
        <div className="glass-morphism rounded-[2.5rem] p-8">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-xl font-black italic uppercase tracking-tighter italic">Live Board</h2>
            <Link
              to="/classes"
              className="text-[10px] font-black uppercase tracking-widest text-blue-400 hover:text-white transition-colors"
            >
              All →
            </Link>
          </div>

          <div className="space-y-4">
            {upcomingClasses.length === 0 ? (
              <div className="text-center py-12 bg-white/[0.02] rounded-3xl border border-white/5 text-gray-600">
                <p className="text-4xl mb-4 opacity-20">📅</p>
                <p className="text-[10px] font-bold uppercase tracking-widest">No Active Protocol</p>
              </div>
            ) : (
              upcomingClasses.map((classItem, i) => (
                <motion.div
                  key={classItem.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                >
                  <Link
                    to={`/classes/${classItem.id}`}
                    className="block p-5 rounded-3xl bg-white/[0.03] border border-white/5 hover:border-blue-500/20 hover:bg-white/[0.05] transition-all group"
                  >
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-black text-[10px] uppercase tracking-widest text-white mb-2 truncate group-hover:text-blue-400 transition-colors">
                          {classItem.name}
                        </h3>
                        <div className="flex items-center gap-2 text-[10px] font-bold text-gray-500 uppercase tracking-tighter mb-2">
                          <span className="w-1 h-1 rounded-full bg-blue-500" />
                          {classItem.trainer?.firstName} {classItem.trainer?.lastName}
                        </div>
                        <div className="text-xs font-black italic tracking-tighter text-blue-500/80">
                          {new Date(classItem.startTime).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </div>
                      </div>
                      <div className="text-right flex-shrink-0 bg-white/5 rounded-2xl p-3 border border-white/5">
                        <div className="text-lg font-black italic tracking-tighter text-white">
                          {classItem.enrolled || 0}/{classItem.capacity}
                        </div>
                        <div className="text-[8px] font-black uppercase tracking-widest text-gray-600 italic">Occupancy</div>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Recent Activity Section */}
      <div className="mt-8 glass-morphism rounded-[2.5rem] p-8 sm:p-10">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-xl font-black italic uppercase tracking-tighter">System Log</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {attendanceData?.data?.slice(0, 6).map((record, i) => (
            <motion.div
              key={record.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: i * 0.05 }}
              className="flex items-center justify-between p-4 rounded-2xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.05] transition-colors gap-4"
            >
              <div className="flex items-center space-x-4 min-w-0 flex-1">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center text-white font-black italic text-xs flex-shrink-0 shadow-lg shadow-blue-500/10">
                  {record.member?.firstName?.[0] || "?"}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-black text-xs uppercase tracking-widest text-white truncate">
                    {record.member?.firstName || "Unknown"} {record.member?.lastName || ""}
                  </p>
                  <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest truncate">
                    {record.type === "gym_entry"
                      ? "Infrastructure Access"
                      : "Protocol Engagement"}
                  </p>
                </div>
              </div>
              <div className="text-[10px] font-black italic tracking-widest text-blue-500 whitespace-nowrap bg-blue-500/5 px-3 py-1.5 rounded-full border border-blue-500/10">
                {record.checkInTime ? new Date(record.checkInTime).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                }) : "--:--"}
              </div>
            </motion.div>
          ))}
          {(!attendanceData?.data || attendanceData.data.length === 0) && (
            <div className="col-span-full text-center py-12 text-gray-600 italic">
              <p className="text-[10px] font-bold uppercase tracking-widest">System Log Empty</p>
            </div>
          )}
        </div>
      </div>
    </AnimatedPage>
  );
}
