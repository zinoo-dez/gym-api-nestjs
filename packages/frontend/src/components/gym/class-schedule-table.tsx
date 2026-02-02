"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

export interface ClassScheduleItem {
  id: string
  name: string
  trainer: string
  time: string
  duration: string
  day: string
  capacity: number
  enrolled: number
  level: "all" | "beginner" | "intermediate" | "advanced"
}

interface ClassScheduleTableProps {
  classes: ClassScheduleItem[]
  onBookClass?: (classId: string) => void
  className?: string
}

const levelColors = {
  all: "bg-primary/10 text-primary",
  beginner: "bg-green-500/10 text-green-400",
  intermediate: "bg-yellow-500/10 text-yellow-400",
  advanced: "bg-red-500/10 text-red-400",
}

export function ClassScheduleTable({
  classes,
  onBookClass,
  className,
}: ClassScheduleTableProps) {
  return (
    <div className={cn("w-full overflow-x-auto", className)}>
      <table className="w-full border-collapse">
        <thead>
          <tr className="border-b border-border">
            <th className="text-left py-4 px-4 text-sm font-semibold text-muted-foreground">
              Class
            </th>
            <th className="text-left py-4 px-4 text-sm font-semibold text-muted-foreground">
              Trainer
            </th>
            <th className="text-left py-4 px-4 text-sm font-semibold text-muted-foreground">
              Day
            </th>
            <th className="text-left py-4 px-4 text-sm font-semibold text-muted-foreground">
              Time
            </th>
            <th className="text-left py-4 px-4 text-sm font-semibold text-muted-foreground">
              Duration
            </th>
            <th className="text-left py-4 px-4 text-sm font-semibold text-muted-foreground">
              Level
            </th>
            <th className="text-left py-4 px-4 text-sm font-semibold text-muted-foreground">
              Availability
            </th>
            <th className="text-right py-4 px-4 text-sm font-semibold text-muted-foreground">
              Action
            </th>
          </tr>
        </thead>
        <tbody>
          {classes.map((classItem) => {
            const spotsLeft = classItem.capacity - classItem.enrolled
            const isFull = spotsLeft <= 0
            const isAlmostFull = spotsLeft <= 3 && !isFull

            return (
              <tr
                key={classItem.id}
                className="border-b border-border/50 hover:bg-secondary/30 transition-colors"
              >
                <td className="py-4 px-4">
                  <span className="font-medium text-foreground">{classItem.name}</span>
                </td>
                <td className="py-4 px-4">
                  <span className="text-muted-foreground">{classItem.trainer}</span>
                </td>
                <td className="py-4 px-4">
                  <span className="text-muted-foreground">{classItem.day}</span>
                </td>
                <td className="py-4 px-4">
                  <span className="text-foreground">{classItem.time}</span>
                </td>
                <td className="py-4 px-4">
                  <span className="text-muted-foreground">{classItem.duration}</span>
                </td>
                <td className="py-4 px-4">
                  <span
                    className={cn(
                      "text-xs font-medium px-2 py-1 rounded-full capitalize",
                      levelColors[classItem.level]
                    )}
                  >
                    {classItem.level === "all" ? "All Levels" : classItem.level}
                  </span>
                </td>
                <td className="py-4 px-4">
                  <div className="flex items-center gap-2">
                    <div className="w-20 h-2 bg-secondary rounded-full overflow-hidden">
                      <div
                        className={cn(
                          "h-full rounded-full transition-all",
                          isFull
                            ? "bg-destructive"
                            : isAlmostFull
                            ? "bg-yellow-500"
                            : "bg-primary"
                        )}
                        style={{
                          width: `${(classItem.enrolled / classItem.capacity) * 100}%`,
                        }}
                      />
                    </div>
                    <span
                      className={cn(
                        "text-xs font-medium",
                        isFull
                          ? "text-destructive"
                          : isAlmostFull
                          ? "text-yellow-500"
                          : "text-muted-foreground"
                      )}
                    >
                      {spotsLeft} left
                    </span>
                  </div>
                </td>
                <td className="py-4 px-4 text-right">
                  <button
                    onClick={() => onBookClass?.(classItem.id)}
                    disabled={isFull}
                    className={cn(
                      "text-sm font-medium px-4 py-2 rounded-lg transition-all",
                      isFull
                        ? "bg-secondary text-muted-foreground cursor-not-allowed"
                        : "bg-primary text-primary-foreground hover:bg-primary-dark"
                    )}
                  >
                    {isFull ? "Full" : "Book"}
                  </button>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
