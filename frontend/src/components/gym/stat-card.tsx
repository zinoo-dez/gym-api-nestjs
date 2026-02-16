import * as React from "react"
import { cn } from "@/lib/utils"

interface StatCardProps {
  title: string
  value: string | number
  change?: {
    value: number
    type: "increase" | "decrease"
  }
  icon?: React.ReactNode
  className?: string
}

export function StatCard({ title, value, change, icon, className }: StatCardProps) {
  return (
    <div
      className={cn(
        "google-surface google-surface-hover",
        "transition-all duration-300",
        className
      )}
    >
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <p className="text-muted-foreground text-sm font-medium">{title}</p>
          <p className="text-3xl font-bold text-foreground">{value}</p>
          {change && (
            <div className="flex items-center gap-1">
              {change.type === "increase" ? (
                <svg
                  className="w-4 h-4 text-primary"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M7 17l9.2-9.2M17 17V7H7"
                  />
                </svg>
              ) : (
                <svg
                  className="w-4 h-4 text-destructive"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 7l-9.2 9.2M7 7v10h10"
                  />
                </svg>
              )}
              <span
                className={cn(
                  "text-sm font-medium",
                  change.type === "increase" ? "text-primary" : "text-destructive"
                )}
              >
                {change.value}%
              </span>
              <span className="text-muted-foreground text-sm">vs last month</span>
            </div>
          )}
        </div>
        {icon && (
          <div className="p-3 bg-primary/10 rounded-lg text-primary">
            {icon}
          </div>
        )}
      </div>
    </div>
  )
}
