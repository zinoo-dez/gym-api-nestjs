
import * as React from "react"
import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import { PublicLayout } from "../../layouts"
import { WorkoutPlanCard } from "@/components/gym"
import { cn } from "@/lib/utils"
import { workoutPlansService, type WorkoutPlan } from "@/services/workout-plans.service"

const goals = [
  { value: "all", label: "All Goals" },
  { value: "muscle", label: "Build Muscle" },
  { value: "fat-loss", label: "Fat Loss" },
  { value: "strength", label: "Strength" },
  { value: "endurance", label: "Endurance" },
]

const difficulties = [
  { value: "all", label: "All Levels" },
  { value: "beginner", label: "Beginner" },
  { value: "intermediate", label: "Intermediate" },
  { value: "advanced", label: "Advanced" },
]

export default function WorkoutsPage() {
  const [selectedGoal, setSelectedGoal] = useState("all")
  const [selectedDifficulty, setSelectedDifficulty] = useState("all")
  const [workoutPlans, setWorkoutPlans] = useState<WorkoutPlan[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchWorkoutPlans = async () => {
      try {
        const response = await workoutPlansService.getAll({ limit: 50 })
        setWorkoutPlans(Array.isArray(response.data) ? response.data : [])
      } catch (error) {
        console.error('Error fetching workout plans:', error)
        setWorkoutPlans([])
      } finally {
        setLoading(false)
      }
    }

    fetchWorkoutPlans()
  }, [])

  const filteredPlans = (workoutPlans || []).filter((plan) => {
    const goalMatch = selectedGoal === "all" || plan.goal === selectedGoal
    const difficultyMatch = selectedDifficulty === "all" || plan.difficulty === selectedDifficulty
    return goalMatch && difficultyMatch
  })

  if (loading) {
    return (
      <PublicLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-muted-foreground">Loading workout plans...</p>
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
              Workout <span className="text-primary">Plans</span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Structured programs designed by expert trainers to help you achieve your specific fitness goals.
            </p>
          </div>

          {!workoutPlans || workoutPlans.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-muted-foreground mb-4">
                No workout plans available at the moment. Please check back later.
              </p>
            </div>
          ) : (
            <>
              {/* Filters */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
                {/* Goal Filter */}
                <div className="flex flex-wrap items-center justify-center gap-2">
                  {goals.map((goal) => (
                    <button
                      key={goal.value}
                      onClick={() => setSelectedGoal(goal.value)}
                      className={cn(
                        "px-4 py-2 rounded-lg text-sm font-medium transition-colors",
                        selectedGoal === goal.value
                          ? "bg-primary text-primary-foreground"
                          : "bg-card border border-border text-muted-foreground hover:text-foreground hover:border-primary/50"
                      )}
                    >
                      {goal.label}
                    </button>
                  ))}
                </div>

                <div className="w-px h-6 bg-border hidden sm:block" />

                {/* Difficulty Filter */}
                <div className="flex flex-wrap items-center justify-center gap-2">
                  {difficulties.map((difficulty) => (
                    <button
                      key={difficulty.value}
                      onClick={() => setSelectedDifficulty(difficulty.value)}
                      className={cn(
                        "px-4 py-2 rounded-lg text-sm font-medium transition-colors",
                        selectedDifficulty === difficulty.value
                          ? "bg-secondary text-foreground"
                          : "text-muted-foreground hover:text-foreground"
                      )}
                    >
                      {difficulty.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Workout Plans Grid */}
              {filteredPlans.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {filteredPlans.map((plan) => (
                    <WorkoutPlanCard 
                      key={plan.id} 
                      title={plan.name}
                      goal={plan.goal}
                      difficulty={plan.difficulty}
                      duration={`${plan.durationWeeks} weeks`}
                      daysPerWeek={plan.daysPerWeek}
                      exercises={plan.exercises?.length || 0}
                      description={plan.description || ''}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-20">
                  <p className="text-muted-foreground mb-4">No workout plans match your filters.</p>
                  <button
                    onClick={() => { setSelectedGoal("all"); setSelectedDifficulty("all"); }}
                    className="text-primary font-medium hover:underline"
                  >
                    Clear Filters
                  </button>
                </div>
              )}
            </>
          )}

          {/* Join CTA */}
          <div className="mt-20 text-center bg-card border border-border rounded-2xl p-12">
            <h2 className="text-2xl font-bold text-foreground mb-4">
              Want Custom Workout Plans?
            </h2>
            <p className="text-muted-foreground mb-6 max-w-xl mx-auto">
              Our expert trainers can create personalized workout plans tailored to your specific goals, 
              fitness level, and schedule. Available with membership.
            </p>
            <Link
              to="/pricing"
              className="inline-flex items-center justify-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-lg font-semibold hover:bg-primary-dark transition-colors"
            >
              View Membership Plans
            </Link>
          </div>
        </div>
      </div>
    </PublicLayout>
  )
}
