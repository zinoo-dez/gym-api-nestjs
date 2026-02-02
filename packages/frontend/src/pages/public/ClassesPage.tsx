
import * as React from "react"
import { PublicLayout } from "../../layouts"
import { ClassScheduleTable, type ClassScheduleItem, SecondaryButton } from "@/components/gym"
import { cn } from "@/lib/utils"

const classSchedule: ClassScheduleItem[] = [
  { id: "1", name: "Morning HIIT", trainer: "Sarah Chen", time: "6:00 AM", duration: "45 min", day: "Monday", capacity: 20, enrolled: 18, level: "intermediate" },
  { id: "2", name: "Power Yoga", trainer: "Emily Rodriguez", time: "7:30 AM", duration: "60 min", day: "Monday", capacity: 15, enrolled: 12, level: "all" },
  { id: "3", name: "CrossFit WOD", trainer: "James Park", time: "12:00 PM", duration: "60 min", day: "Monday", capacity: 12, enrolled: 12, level: "advanced" },
  { id: "4", name: "Spin Class", trainer: "Sarah Chen", time: "5:30 PM", duration: "45 min", day: "Monday", capacity: 25, enrolled: 22, level: "all" },
  { id: "5", name: "Boxing Basics", trainer: "Lisa Anderson", time: "7:00 PM", duration: "60 min", day: "Monday", capacity: 16, enrolled: 10, level: "beginner" },
  { id: "6", name: "Strength Training", trainer: "Alex Thompson", time: "6:00 AM", duration: "60 min", day: "Tuesday", capacity: 15, enrolled: 8, level: "intermediate" },
  { id: "7", name: "Pilates", trainer: "Emily Rodriguez", time: "9:00 AM", duration: "50 min", day: "Tuesday", capacity: 12, enrolled: 11, level: "all" },
  { id: "8", name: "HIIT Circuit", trainer: "Sarah Chen", time: "12:00 PM", duration: "45 min", day: "Tuesday", capacity: 20, enrolled: 15, level: "intermediate" },
  { id: "9", name: "Bodybuilding", trainer: "Marcus Williams", time: "6:00 PM", duration: "75 min", day: "Tuesday", capacity: 10, enrolled: 9, level: "advanced" },
  { id: "10", name: "MMA Conditioning", trainer: "Lisa Anderson", time: "7:30 PM", duration: "60 min", day: "Tuesday", capacity: 14, enrolled: 7, level: "intermediate" },
  { id: "11", name: "Sunrise Yoga", trainer: "Emily Rodriguez", time: "6:00 AM", duration: "60 min", day: "Wednesday", capacity: 15, enrolled: 14, level: "all" },
  { id: "12", name: "CrossFit Open", trainer: "James Park", time: "12:00 PM", duration: "60 min", day: "Wednesday", capacity: 12, enrolled: 10, level: "all" },
  { id: "13", name: "Spin & Burn", trainer: "Sarah Chen", time: "5:30 PM", duration: "45 min", day: "Wednesday", capacity: 25, enrolled: 25, level: "intermediate" },
  { id: "14", name: "Core & More", trainer: "Alex Thompson", time: "7:00 PM", duration: "45 min", day: "Wednesday", capacity: 20, enrolled: 12, level: "beginner" },
]

const classTypes = [
  { name: "HIIT", description: "High-intensity interval training for maximum calorie burn", icon: "🔥" },
  { name: "Yoga", description: "Mind-body practice for flexibility and stress relief", icon: "🧘" },
  { name: "CrossFit", description: "Functional movements at high intensity", icon: "💪" },
  { name: "Spin", description: "Indoor cycling for cardio endurance", icon: "🚴" },
  { name: "Boxing", description: "Learn boxing techniques while getting fit", icon: "🥊" },
  { name: "Pilates", description: "Core-focused low-impact exercise", icon: "🎯" },
]

const days = ["All", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]

export default function ClassesPage() {
  const [selectedDay, setSelectedDay] = React.useState("All")
  const [selectedLevel, setSelectedLevel] = React.useState("all")

  const filteredClasses = classSchedule.filter((cls) => {
    const dayMatch = selectedDay === "All" || cls.day === selectedDay
    const levelMatch = selectedLevel === "all" || cls.level === selectedLevel
    return dayMatch && levelMatch
  })

  return (
    <PublicLayout>
      <div className="pt-28 pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center mb-16">
            <h1 className="text-4xl sm:text-5xl font-bold text-foreground mb-4">
              Group <span className="text-primary">Fitness Classes</span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              From high-energy HIIT to relaxing yoga, find the perfect class to match your fitness goals and schedule.
            </p>
          </div>

          {/* Class Types */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-16">
            {classTypes.map((type) => (
              <div
                key={type.name}
                className="bg-card border border-border rounded-xl p-4 text-center hover:border-primary/50 transition-colors"
              >
                <span className="text-3xl mb-2 block">{type.icon}</span>
                <h3 className="font-semibold text-foreground mb-1">{type.name}</h3>
                <p className="text-xs text-muted-foreground">{type.description}</p>
              </div>
            ))}
          </div>

          {/* Schedule Section */}
          <div className="bg-card border border-border rounded-2xl p-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
              <h2 className="text-xl font-bold text-foreground">Class Schedule</h2>
              
              <div className="flex flex-wrap items-center gap-4">
                {/* Day Filter */}
                <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0">
                  {days.map((day) => (
                    <button
                      key={day}
                      onClick={() => setSelectedDay(day)}
                      className={cn(
                        "px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition-colors",
                        selectedDay === day
                          ? "bg-primary text-primary-foreground"
                          : "bg-secondary text-muted-foreground hover:text-foreground"
                      )}
                    >
                      {day}
                    </button>
                  ))}
                </div>

                {/* Level Filter */}
                <select
                  value={selectedLevel}
                  onChange={(e) => setSelectedLevel(e.target.value)}
                  className="px-3 py-1.5 bg-secondary border border-border rounded-lg text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="all">All Levels</option>
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                </select>
              </div>
            </div>

            {filteredClasses.length > 0 ? (
              <ClassScheduleTable classes={filteredClasses} />
            ) : (
              <div className="text-center py-12">
                <p className="text-muted-foreground">No classes match your filters.</p>
                <SecondaryButton 
                  className="mt-4" 
                  onClick={() => { setSelectedDay("All"); setSelectedLevel("all"); }}
                >
                  Clear Filters
                </SecondaryButton>
              </div>
            )}
          </div>

          {/* Membership CTA */}
          <div className="mt-12 text-center">
            <p className="text-muted-foreground mb-4">
              Unlimited class access included with Pro and Elite memberships.
            </p>
            <Link
              to="/pricing"
              className="text-primary font-medium hover:underline"
            >
              View Membership Plans →
            </Link>
          </div>
        </div>
      </div>
    </PublicLayout>
  )
}
