
import { Link } from "react-router-dom"
import { MemberLayout } from "../../layouts"
import { StatCard, PrimaryButton, WorkoutPlanCard } from "@/components/gym"

const memberStats = [
  {
    title: "This Month Visits",
    value: "18",
    change: { value: 20, type: "increase" as const },
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
      </svg>
    ),
  },
  {
    title: "Classes Attended",
    value: "12",
    change: { value: 8, type: "increase" as const },
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    ),
  },
  {
    title: "Current Streak",
    value: "7 days",
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z" />
      </svg>
    ),
  },
  {
    title: "Membership Status",
    value: "Pro",
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
      </svg>
    ),
  },
]

const upcomingClasses = [
  { name: "Morning HIIT", trainer: "Sarah Chen", time: "Tomorrow, 6:00 AM", duration: "45 min" },
  { name: "Power Yoga", trainer: "Emily Rodriguez", time: "Tomorrow, 7:30 AM", duration: "60 min" },
  { name: "Spin Class", trainer: "Sarah Chen", time: "Wednesday, 5:30 PM", duration: "45 min" },
]

const todayWorkout = {
  title: "Upper Body Strength",
  exercises: [
    { name: "Bench Press", sets: 4, reps: "8-10", completed: true },
    { name: "Incline Dumbbell Press", sets: 3, reps: "10-12", completed: true },
    { name: "Lat Pulldown", sets: 4, reps: "10-12", completed: false },
    { name: "Seated Row", sets: 3, reps: "10-12", completed: false },
    { name: "Shoulder Press", sets: 3, reps: "10-12", completed: false },
    { name: "Tricep Pushdown", sets: 3, reps: "12-15", completed: false },
  ],
}

const suggestedPlans = [
  {
    title: "Progressive Overload",
    goal: "strength" as const,
    difficulty: "intermediate" as const,
    duration: "8 weeks",
    daysPerWeek: 4,
    exercises: 32,
    description: "Build strength with progressive loading techniques",
  },
  {
    title: "Shred Program",
    goal: "fat-loss" as const,
    difficulty: "intermediate" as const,
    duration: "6 weeks",
    daysPerWeek: 5,
    exercises: 40,
    description: "High-intensity fat burning with muscle preservation",
  },
]

export default function MemberDashboardPage() {
  return (
    <MemberLayout>
      <div className="space-y-6">
        {/* Welcome Section */}
        <div className="bg-gradient-to-r from-primary/20 to-accent/20 rounded-2xl p-6 md:p-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-foreground mb-2">Welcome back, John!</h1>
              <p className="text-muted-foreground">
                You&apos;re on a 7-day streak. Keep up the great work!
              </p>
            </div>
            <PrimaryButton>
              Check In Now
            </PrimaryButton>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {memberStats.map((stat) => (
            <StatCard key={stat.title} {...stat} />
          ))}
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Today's Workout */}
          <div className="lg:col-span-2 bg-card border border-border rounded-xl p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-foreground">Today&apos;s Workout</h2>
              <span className="text-primary text-sm font-medium">
                {todayWorkout.exercises.filter(e => e.completed).length}/{todayWorkout.exercises.length} completed
              </span>
            </div>
            
            <h3 className="text-xl font-bold text-foreground mb-4">{todayWorkout.title}</h3>
            
            <div className="space-y-3">
              {todayWorkout.exercises.map((exercise, index) => (
                <div
                  key={index}
                  className={`flex items-center justify-between p-4 rounded-lg border transition-colors ${
                    exercise.completed 
                      ? "bg-primary/10 border-primary/20" 
                      : "bg-secondary/30 border-border"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <button
                      className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${
                        exercise.completed 
                          ? "bg-primary border-primary text-primary-foreground" 
                          : "border-muted-foreground"
                      }`}
                    >
                      {exercise.completed && (
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </button>
                    <span className={`font-medium ${exercise.completed ? "text-muted-foreground line-through" : "text-foreground"}`}>
                      {exercise.name}
                    </span>
                  </div>
                  <span className="text-muted-foreground text-sm">
                    {exercise.sets} sets x {exercise.reps}
                  </span>
                </div>
              ))}
            </div>

            <div className="mt-6 flex gap-4">
              <PrimaryButton className="flex-1">Continue Workout</PrimaryButton>
              <button className="px-4 py-2 text-muted-foreground hover:text-foreground transition-colors">
                Skip Today
              </button>
            </div>
          </div>

          {/* Upcoming Classes */}
          <div className="bg-card border border-border rounded-xl p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-foreground">Upcoming Classes</h2>
              <Link to="/member/classes" className="text-primary text-sm font-medium hover:underline">
                View All
              </Link>
            </div>
            
            <div className="space-y-4">
              {upcomingClasses.map((cls, index) => (
                <div key={index} className="p-4 bg-secondary/30 rounded-lg">
                  <h3 className="font-medium text-foreground">{cls.name}</h3>
                  <p className="text-muted-foreground text-sm mt-1">{cls.trainer}</p>
                  <div className="flex items-center justify-between mt-3">
                    <span className="text-sm text-muted-foreground">{cls.time}</span>
                    <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">{cls.duration}</span>
                  </div>
                </div>
              ))}
            </div>

            <button className="w-full mt-4 py-3 border border-dashed border-border rounded-lg text-muted-foreground hover:text-foreground hover:border-primary/50 transition-colors">
              + Book Another Class
            </button>
          </div>
        </div>

        {/* Suggested Plans */}
        <div>
          <h2 className="text-lg font-semibold text-foreground mb-4">Recommended For You</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {suggestedPlans.map((plan) => (
              <WorkoutPlanCard key={plan.title} {...plan} />
            ))}
          </div>
        </div>
      </div>
    </MemberLayout>
  )
}
