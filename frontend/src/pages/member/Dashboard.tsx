import { motion } from "framer-motion";
import { Play, TrendingUp, Calendar, Zap, CreditCard, User, LogOut } from "lucide-react";
import { KPICard } from "@/components/ui/KPICard";
import { ActionCard } from "@/components/ui/ActionCard";
import { ChartCard } from "@/components/ui/ChartCard";
import { Card, CardContent } from "@/components/ui/Card";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { useAuthStore } from "@/store/auth.store";

const attendanceData = [
  { day: "Mon", visits: 1 },
  { day: "Tue", visits: 0 },
  { day: "Wed", visits: 1 },
  { day: "Thu", visits: 2 },
  { day: "Fri", visits: 1 },
  { day: "Sat", visits: 3 },
  { day: "Sun", visits: 0 },
];

export function Dashboard() {
  const { user, logout } = useAuthStore();
  
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  return (
    <div className="mx-auto max-w-5xl space-y-8 p-4 md:p-8">
      {/* 3.2 Section 1: Hero Welcome */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary to-primary/80 p-8 text-primary-foreground shadow-lg"
      >
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-4">
            <div className="inline-flex items-center rounded-full bg-white/20 px-3 py-1 text-xs font-medium backdrop-blur-sm">
              Premium Member
            </div>
            <h1 className="text-3xl md:text-5xl font-bold tracking-tight">
              Welcome back, {user?.firstName || 'Athlete'}!
            </h1>
            <p className="max-w-md text-primary-foreground/80 md:text-lg">
              You're doing great. Keep the momentum going and crush your goals today.
            </p>
          </div>
          
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <button className="flex items-center gap-2 rounded-full bg-white px-6 py-3 font-semibold text-primary shadow hover:bg-white/90 transition-colors">
              <Play className="size-5" />
              Book Workout
            </button>
          </motion.div>
        </div>
        
        {/* Decorative background circle */}
        <div className="absolute right-0 top-0 -mr-16 -mt-16 size-80 rounded-full bg-white/10 blur-3xl" />
      </motion.div>

      {/* 3.2 Section 2: Progress Snapshot */}
      <motion.div 
        variants={container} 
        initial="hidden" 
        animate="show"
        className="grid gap-4 grid-cols-2 md:grid-cols-4"
      >
        <KPICard title="Attendance" value="12" trend={{ value: 4, isPositive: true }} icon={Zap} />
        <KPICard title="Day Streak" value="3" icon={TrendingUp} />
        <KPICard title="Days Left" value="45" icon={Calendar} />
        <KPICard title="Next Renew" value="Oct 12" icon={CreditCard} />
      </motion.div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* 3.2 Section 3: Progress Visualization */}
        <ChartCard title="Workout Frequency" className="md:col-span-2 shadow-sm border">
          <div className="h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={attendanceData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorVisits" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="day" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px" }}
                />
                <Area type="monotone" dataKey="visits" stroke="hsl(var(--primary))" fillOpacity={1} fill="url(#colorVisits)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>

        {/* 3.2 Section 5: Motivation & Tips */}
        <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="md:col-span-1"
        >
          <Card className="h-full bg-gradient-to-b from-card to-card/50 border shadow-sm flex flex-col justify-center text-center p-8 overflow-hidden group">
            <motion.div 
                animate={{ rotate: [0, 10, -10, 0] }} 
                transition={{ repeat: Infinity, duration: 5, ease: "easeInOut" }}
                className="mx-auto mb-6 flex size-16 items-center justify-center rounded-full bg-primary/10 text-primary"
            >
              <Zap className="size-8" />
            </motion.div>
            <h3 className="mb-2 text-xl font-bold">Daily Tip</h3>
            <p className="text-muted-foreground">
              "Consistency is what transforms average into excellence. Stay hydrated and rest well!"
            </p>
          </Card>
        </motion.div>
      </div>

      {/* 3.2 Section 4: Quick Actions */}
      <div>
        <h3 className="mb-4 text-xl font-semibold tracking-tight">Quick Actions</h3>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          <ActionCard title="Check In" icon={Zap} className="hover:border-primary" />
          <ActionCard title="View Membership" icon={CreditCard} />
          <ActionCard title="Profile" icon={User} />
          <ActionCard title="Log Out" icon={LogOut} onClick={() => logout()} />
        </div>
      </div>
    </div>
  );
}
