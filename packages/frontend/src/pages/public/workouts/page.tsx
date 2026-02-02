"use client"

import * as React from "react"
import { PublicLayout } from "@/components/layouts"
import { WorkoutPlanCard } from "@/components/gym"
import { cn } from "@/lib/utils"

const workoutPlans = [
  {
    title: "Beginner Full Body",
    goal: "muscle" as const,
    difficulty: "beginner" as const,
    duration: "8 weeks",
    daysPerWeek: 3,
    exercises: 24,
    description: "Perfect for those just starting their fitness journey. Build a strong foundation with compound movements.",
  },
  {
    title: "Fat Burner HIIT",
    goal: "fat-loss" as const,
    difficulty: "intermediate" as const,
    duration: "6 weeks",
    daysPerWeek: 4,
    exercises: 32,
    description: "High-intensity interval training program designed to maximize calorie burn and boost metabolism.",
  },
  {
    title: "Strength Builder",
    goal: "strength" as const,
    difficulty: "advanced" as const,
    duration: "12 weeks",
    daysPerWeek: 5,
    exercises: 48,
    description: "Progressive overload program focused on building raw strength with heavy compound lifts.",
  },
  {
    title: "Lean Muscle Program",
    goal: "muscle" as const,
    difficulty: "intermediate" as const,
    duration: "10 weeks",
    daysPerWeek: 4,
    exercises: 36,
    description: "Build lean muscle mass while maintaining low body fat with this balanced hypertrophy program.",
  },
  {
    title: "Cardio Endurance",
    goal: "endurance" as const,
    difficulty: "beginner" as const,
    duration: "8 weeks",
    daysPerWeek: 4,
    exercises: 28,
    description: "Improve cardiovascular fitness and stamina with progressive cardio training.",
  },
  {
    title: "Shred & Tone",
    goal: "fat-loss" as const,
    difficulty: "intermediate" as const,
    duration: "8 weeks",
    daysPerWeek: 5,
    exercises: 40,
    description: "Combination of resistance training and cardio to burn fat while preserving muscle.",
  },
  {
    title: "Powerlifting Prep",
    goal: "strength" as const,
    difficulty: "advanced" as const,
    duration: "16 weeks",
    daysPerWeek: 4,
    exercises: 32,
    description: "Competition-ready powerlifting program focused on squat, bench, and deadlift.",
  },
  {
    title: "Athletic Performance",
    goal: "endurance" as const,
    difficulty: "intermediate" as const,
    duration: "12 weeks",
    daysPerWeek: 5,
    exercises: 45,
    description: "Improve speed, agility, and overall athletic performance for sports.",
  },
  {
    title: "Mass Gainer",
    goal: "muscle" as const,
    difficulty: "advanced" as const,
    duration: "12 weeks",
    daysPerWeek: 6,
    exercises: 54,
    description: "High-volume bodybuilding program designed for serious muscle growth.",
  },
]

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
  const [selectedGoal, setSelectedGoal] = React.useState("all")
  const [selectedDifficulty, setSelectedDifficulty] = React.useState("all")

  const filteredPlans = workoutPlans.filter((plan) => {
    const goalMatch = selectedGoal === "all" || plan.goal === selectedGoal
    const difficultyMatch = selectedDifficulty === "all" || plan.difficulty === selectedDifficulty
    return goalMatch && difficultyMatch
  })

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
                <WorkoutPlanCard key={plan.title} {...plan} />
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

          {/* Custom Plan CTA */}
          <div className="mt-20 bg-gradient-to-r from-primary/10 to-accent/10 rounded-2xl p-8 md:p-12 text-center">
            <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4">
              Need a Custom Workout Plan?
            </h2>
            <p className="text-muted-foreground mb-6 max-w-xl mx-auto">
              Our expert trainers can create a personalized workout plan tailored to your specific goals, 
              fitness level, and schedule. Available with Elite membership.
            </p>
            <a
              href="/pricing"
              className="inline-flex items-center justify-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-lg font-semibold hover:bg-primary-dark transition-colors"
            >
              Get Custom Plan
            </a>
          </div>
        </div>
      </div>
    </PublicLayout>
  )
}
