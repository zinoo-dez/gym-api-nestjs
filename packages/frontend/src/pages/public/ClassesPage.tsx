
import * as React from "react"
import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import { PublicLayout } from "../../layouts"
import { ClassScheduleTable, type ClassScheduleItem, SecondaryButton } from "@/components/gym"
import { cn } from "@/lib/utils"
import { classesService, type ClassSchedule } from "@/services/classes.service"
import { useGymSettings } from "@/hooks/use-gym-settings"

const convertClassToScheduleItem = (cls: ClassSchedule): ClassScheduleItem => {
  const startTime = new Date(cls.schedule)
  const duration = cls.duration
  const endTime = new Date(startTime.getTime() + duration * 60000)
  const enrolled = cls.availableSlots !== undefined ? cls.capacity - cls.availableSlots : 0
  
  return {
    id: cls.id,
    name: cls.name,
    trainer: cls.trainerName || 'TBA',
    time: startTime.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }),
    duration: `${duration} min`,
    day: startTime.toLocaleDateString('en-US', { weekday: 'long' }),
    capacity: cls.capacity,
    enrolled,
    level: 'all' as const,
  }
}

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
  const {
    classesTitle,
    classesSubtitle,
    ctaTitle,
    ctaSubtitle,
    ctaButtonLabel,
  } = useGymSettings()
  const [selectedDay, setSelectedDay] = useState("All")
  const [selectedLevel, setSelectedLevel] = useState("all")
  const [classes, setClasses] = useState<ClassScheduleItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchClasses = async () => {
      try {
        const response = await classesService.getAll({ limit: 50 })
        const scheduleItems = Array.isArray(response.data) ? response.data.map(convertClassToScheduleItem) : []
        setClasses(scheduleItems)
      } catch (error) {
        console.error('Error fetching classes:', error)
        setClasses([]) // Ensure it's always an array
      } finally {
        setLoading(false)
      }
    }

    fetchClasses()
  }, [])

  const filteredClasses = (classes || []).filter((cls) => {
    const dayMatch = selectedDay === "All" || cls.day === selectedDay
    const levelMatch = selectedLevel === "all" || cls.level === selectedLevel
    return dayMatch && levelMatch
  })

  if (loading) {
    return (
      <PublicLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-muted-foreground">Loading classes...</p>
          </div>
        </div>
      </PublicLayout>
    )
  }

  return (
    <PublicLayout>
      <div className="pt-28 pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center mb-16">
            <h1 className="text-4xl sm:text-5xl font-bold text-foreground mb-4">
              {classesTitle}
            </h1>
            <div
              className="text-lg text-muted-foreground max-w-2xl mx-auto [&_img]:max-w-full [&_img]:rounded-xl"
              dangerouslySetInnerHTML={{ __html: classesSubtitle || "" }}
            />
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
            <h2 className="text-2xl font-bold text-foreground mb-4">
              {ctaTitle}
            </h2>
            <div
              className="text-muted-foreground mb-4 [&_img]:max-w-full [&_img]:rounded-xl"
              dangerouslySetInnerHTML={{ __html: ctaSubtitle || "" }}
            />
            <Link
              to="/pricing"
              className="text-primary font-medium hover:underline"
            >
              {ctaButtonLabel}
            </Link>
          </div>
        </div>
      </div>
    </PublicLayout>
  )
}
