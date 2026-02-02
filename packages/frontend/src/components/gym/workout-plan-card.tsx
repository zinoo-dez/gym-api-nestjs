"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { PrimaryButton } from "./primary-button"

interface WorkoutPlanCardProps {
  title: string
  goal: "muscle" | "fat-loss" | "strength" | "endurance"
  difficulty: "beginner" | "intermediate" | "advanced"
  duration: string
  daysPerWeek: number
  exercises: number
  description?: string
  onViewPlan?: () => void
  className?: string
}

const goalConfig = {
  muscle: { label: "Build Muscle", color: "bg-blue-500/10 text-blue-400" },
  "fat-loss": { label: "Fat Loss", color: "bg-orange-500/10 text-orange-400" },
  strength: { label: "Strength", color: "bg-red-500/10 text-red-400" },
  endurance: { label: "Endurance", color: "bg-purple-500/10 text-purple-400" },
}

const difficultyConfig = {
  beginner: { label: "Beginner", bars: 1 },
  intermediate: { label: "Intermediate", bars: 2 },
  advanced: { label: "Advanced", bars: 3 },
}

export function WorkoutPlanCard({
  title,
  goal,
  difficulty,
  duration,
  daysPerWeek,
  exercises,
  description,
  onViewPlan,
  className,
}: WorkoutPlanCardProps) {
  const goalInfo = goalConfig[goal]
  const difficultyInfo = difficultyConfig[difficulty]

  return (
    <div
      className={cn(
        "bg-card border border-border rounded-2xl p-6",
        "transition-all duration-300 card-hover",
        className
      )}
    >
      <div className="flex items-start justify-between mb-4">
        <span className={cn("text-xs font-medium px-3 py-1 rounded-full", goalInfo.color)}>
          {goalInfo.label}
        </span>
        <div className="flex items-center gap-1" aria-label={`Difficulty: ${difficultyInfo.label}`}>
          {[1, 2, 3].map((bar) => (
            <div
              key={bar}
              className={cn(
                "w-1.5 h-4 rounded-full",
                bar <= difficultyInfo.bars ? "bg-primary" : "bg-border"
              )}
            />
          ))}
        </div>
      </div>

      <h3 className="text-xl font-bold text-foreground mb-2">{title}</h3>
      {description && (
        <p className="text-muted-foreground text-sm mb-4 line-clamp-2">{description}</p>
      )}

      <div className="grid grid-cols-3 gap-4 py-4 border-t border-b border-border mb-4">
        <div className="text-center">
          <p className="text-lg font-bold text-foreground">{duration}</p>
          <p className="text-xs text-muted-foreground">Duration</p>
        </div>
        <div className="text-center">
          <p className="text-lg font-bold text-foreground">{daysPerWeek}</p>
          <p className="text-xs text-muted-foreground">Days/Week</p>
        </div>
        <div className="text-center">
          <p className="text-lg font-bold text-foreground">{exercises}</p>
          <p className="text-xs text-muted-foreground">Exercises</p>
        </div>
      </div>

      <PrimaryButton onClick={onViewPlan} className="w-full" size="sm">
        View Plan
      </PrimaryButton>
    </div>
  )
}
