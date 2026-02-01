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
      <div className="min-h-screen bg-[#050505] flex justify-center items-center">
        <div className="relative">
          <div className="w-20 h-20 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin" />
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-xs font-black uppercase text-blue-500 animate-pulse italic">GYM</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050505] text-white relative overflow-hidden">
      {/* Premium Background Effects */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-10%] right-[-5%] w-[600px] h-[600px] bg-blue-600/10 blur-[130px] rounded-full animate-pulse" />
        <div className="absolute bottom-[10%] left-[-10%] w-[700px] h-[700px] bg-indigo-600/5 blur-[150px] rounded-full" />
        <div className="absolute top-[30%] left-[20%] w-[400px] h-[400px] bg-violet-600/10 blur-[100px] rounded-full" />
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03]" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />
      </div>

      <AnimatedPage className="relative z-10 pb-20 pt-8 px-4 sm:px-6 lg:px-8 max-w-[1920px] mx-auto">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
          <div>
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-5xl sm:text-7xl font-black italic uppercase tracking-tighter mb-3 leading-none"
            >
              Control <span className="text-gradient">Center</span>
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="text-gray-500 font-bold uppercase tracking-[0.2em] text-[10px] flex items-center gap-2"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
              System Operational // {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </motion.p>
          </div>
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="flex gap-4"
          >
            <Link to="/attendance">
              <Button variant="premium" className="px-8 !py-3.5 text-[10px] uppercase tracking-widest font-black !rounded-full">
                Check-in Now
              </Button>
            </Link>
          </motion.div>
        </div>

        {/* Overview Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {[
            { label: "Elite Members", val: totalMembers, sub: `${activeMembers} Active`, icon: "👥", color: "from-blue-600/20", borderColor: "border-blue-500" },
            { label: "Sessions Today", val: todayClasses, sub: "Scheduled", icon: "📅", color: "from-emerald-600/20", borderColor: "border-emerald-500" },
            { label: "Check-ins Today", val: todayAttendance, sub: "Attendance", icon: "✓", color: "from-indigo-600/20", borderColor: "border-indigo-500" },
            { 
              label: "Performance", 
              val: activeMembers > 0 ? Math.round((todayAttendance / activeMembers) * 100) : 0, 
              sub: "% Capacity", 
              icon: "📊", 
              color: "from-violet-600/20",
              borderColor: "border-violet-500"
            },
          ].map((stat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + i * 0.1, duration: 0.6 }}
              className={`glass-morphism rounded-[2.5rem] p-8 border-l-4 ${stat.borderColor} relative overflow-hidden group cursor-pointer hover:scale-[1.02] transition-transform duration-500`}
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${stat.color} to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
              <div className="absolute -right-8 -top-8 text-[120px] opacity-[0.03] group-hover:scale-110 transition-transform duration-700">{stat.icon}</div>
              <div className="flex items-center justify-between relative z-10">
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] font-black uppercase tracking-[0.25em] text-gray-500 mb-3 truncate">{stat.label}</p>
                  <p className="text-5xl font-black italic tracking-tighter text-white mb-2">
                    {stat.val}{stat.label === "Performance" ? "%" : ""}
                  </p>
                  <div className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{stat.sub}</p>
                  </div>
                </div>
                <div className="text-5xl opacity-10 group-hover:opacity-30 group-hover:scale-110 transition-all duration-500">{stat.icon}</div>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Quick Actions */}
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.7, duration: 0.6 }}
            className="lg:col-span-2 glass-morphism rounded-[3rem] p-10 sm:p-12 relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/5 blur-[100px] rounded-full" />
            <div className="flex items-center justify-between mb-10 relative z-10">
              <h2 className="text-2xl sm:text-3xl font-black italic uppercase tracking-tighter">Quick Protocol</h2>
              <div className="w-12 h-[2px] bg-gradient-to-r from-blue-500 to-transparent" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 relative z-10">
              {quickActions.map((action, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.8 + i * 0.1 }}
                  whileHover={{ scale: 1.03, y: -4 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Link
                    to={action.link}
                    className="block p-8 rounded-[2rem] bg-white/[0.03] border border-white/10 hover:border-blue-500/30 hover:bg-white/[0.06] transition-all duration-500 group overflow-hidden relative"
                  >
                    <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-600/10 to-transparent rounded-bl-full translate-x-16 -translate-y-16 group-hover:translate-x-12 group-hover:-translate-y-12 transition-transform duration-700" />
                    <div className="flex items-start space-x-5 relative z-10">
                      <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-white/10 to-white/5 flex items-center justify-center text-3xl group-hover:from-blue-600 group-hover:to-indigo-600 transition-all duration-500 shadow-lg group-hover:shadow-blue-500/20 group-hover:scale-110">
                        {action.icon}
                      </div>
                      <div className="flex-1 min-w-0 pt-1">
                        <h3 className="font-black text-sm uppercase tracking-[0.2em] text-white mb-2 group-hover:text-blue-400 transition-colors">
                          {action.title}
                        </h3>
                        <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider group-hover:text-gray-300 transition-colors">
                          {action.description}
                        </p>
                      </div>
                      <div className="text-blue-500/0 group-hover:text-blue-500/100 transition-colors duration-500">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Upcoming Classes */}
          <motion.div 
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.7, duration: 0.6 }}
            className="glass-morphism rounded-[3rem] p-10 relative overflow-hidden"
          >
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-indigo-600/5 blur-[100px] rounded-full" />
            <div className="flex items-center justify-between mb-10 relative z-10">
              <h2 className="text-2xl font-black italic uppercase tracking-tighter">Live Board</h2>
              <Link
                to="/classes"
                className="group flex items-center gap-2 text-blue-400 hover:text-white transition-colors"
              >
                <span className="text-[10px] font-black uppercase tracking-[0.25em]">All</span>
                <span className="w-6 h-[2px] bg-blue-400 group-hover:w-10 transition-all" />
              </Link>
            </div>

            <div className="space-y-5 relative z-10">
              {upcomingClasses.length === 0 ? (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center py-16 bg-white/[0.02] rounded-[2rem] border border-white/5"
                >
                  <div className="text-6xl mb-6 opacity-10">📅</div>
                  <p className="text-[10px] font-black uppercase tracking-[0.25em] text-gray-600">No Active Protocol</p>
                </motion.div>
              ) : (
                upcomingClasses.map((classItem, i) => (
                  <motion.div
                    key={classItem.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.9 + i * 0.1 }}
                  >
                    <Link
                      to={`/classes/${classItem.id}`}
                      className="block p-6 rounded-[2rem] bg-white/[0.03] border border-white/10 hover:border-blue-500/30 hover:bg-white/[0.06] transition-all duration-500 group"
                    >
                      <div className="flex items-center justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <h3 className="font-black text-xs uppercase tracking-[0.2em] text-white mb-3 truncate group-hover:text-blue-400 transition-colors">
                            {classItem.name}
                          </h3>
                          <div className="flex items-center gap-2 text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-3">
                            <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
                            {classItem.trainer?.firstName} {classItem.trainer?.lastName}
                          </div>
                          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-500/10 border border-blue-500/20 rounded-full">
                            <svg className="w-3 h-3 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span className="text-xs font-black italic tracking-tight text-blue-400">
                              {new Date(classItem.startTime).toLocaleTimeString([], {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </span>
                          </div>
                        </div>
                        <div className="text-right flex-shrink-0 bg-gradient-to-br from-white/10 to-white/5 rounded-2xl p-4 border border-white/10 group-hover:from-blue-600/20 group-hover:to-indigo-600/10 group-hover:border-blue-500/30 transition-all duration-500">
                          <div className="text-2xl font-black italic tracking-tighter text-white mb-1">
                            {classItem.enrolled || 0}/{classItem.capacity}
                          </div>
                          <div className="text-[8px] font-black uppercase tracking-[0.2em] text-gray-500 italic">Occupancy</div>
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                ))
              )}
            </div>
          </motion.div>
        </div>

        {/* Recent Activity Section */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2, duration: 0.6 }}
          className="mt-12 glass-morphism rounded-[3rem] p-10 sm:p-12 relative overflow-hidden"
        >
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 bg-violet-600/5 blur-[120px] rounded-full" />
          <div className="flex items-center justify-between mb-10 relative z-10">
            <h2 className="text-2xl sm:text-3xl font-black italic uppercase tracking-tighter">System Log</h2>
            <div className="flex items-center gap-2 px-4 py-2 bg-blue-500/10 border border-blue-500/20 rounded-full">
              <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-400">Live</span>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 relative z-10">
            {attendanceData?.data?.slice(0, 6).map((record, i) => (
              <motion.div
                key={record.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 1.3 + i * 0.05 }}
                className="flex items-center justify-between p-6 rounded-[2rem] bg-white/[0.03] border border-white/10 hover:bg-white/[0.06] hover:border-blue-500/20 transition-all duration-500 gap-4 group"
              >
                <div className="flex items-center space-x-4 min-w-0 flex-1">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center text-white font-black italic text-lg flex-shrink-0 shadow-lg shadow-blue-500/20 group-hover:scale-110 transition-transform duration-500">
                    {record.member?.firstName?.[0] || "?"}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-black text-xs uppercase tracking-[0.2em] text-white truncate mb-1.5 group-hover:text-blue-400 transition-colors">
                      {record.member?.firstName || "Unknown"} {record.member?.lastName || ""}
                    </p>
                    <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider truncate">
                      {record.type === "gym_entry"
                        ? "Infrastructure Access"
                        : "Protocol Engagement"}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-[10px] font-black italic tracking-wider text-blue-400 whitespace-nowrap bg-blue-500/10 px-4 py-2 rounded-full border border-blue-500/20">
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {record.checkInTime ? new Date(record.checkInTime).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  }) : "--:--"}
                </div>
              </motion.div>
            ))}
            {(!attendanceData?.data || attendanceData.data.length === 0) && (
              <div className="col-span-full text-center py-16 text-gray-600">
                <div className="text-6xl mb-6 opacity-10">📊</div>
                <p className="text-[10px] font-black uppercase tracking-[0.25em]">System Log Empty</p>
              </div>
            )}
          </div>
        </motion.div>
      </AnimatedPage>
    </div>
  );
}
