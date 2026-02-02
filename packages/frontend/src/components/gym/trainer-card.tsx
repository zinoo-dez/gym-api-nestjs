import React from "react"
import { cn } from "@/lib/utils"

interface TrainerCardProps {
  name: string
  specialty: string
  experience: string
  image: string
  certifications?: string[]
  rating?: number
  onViewProfile?: () => void
  className?: string
}

export function TrainerCard({
  name,
  specialty,
  experience,
  image,
  certifications,
  rating,
  onViewProfile,
  className,
}: TrainerCardProps) {
  return (
    <div
      className={cn(
        "bg-card border border-border rounded-2xl overflow-hidden",
        "transition-all duration-300 card-hover group",
        className
      )}
    >
      <div className="relative aspect-[4/5] overflow-hidden">
        <img
          src={image || "/placeholder.svg"}
          alt={`${name} - ${specialty}`}
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/20 to-transparent" />
        
        {rating && (
          <div className="absolute top-4 right-4 flex items-center gap-1 bg-background/80 backdrop-blur-sm px-2 py-1 rounded-full">
            <svg
              className="w-4 h-4 text-yellow-500"
              fill="currentColor"
              viewBox="0 0 20 20"
              aria-hidden="true"
            >
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
            <span className="text-sm font-medium text-foreground">{rating}</span>
          </div>
        )}
        
        <div className="absolute bottom-0 left-0 right-0 p-6">
          <h3 className="text-xl font-bold text-foreground mb-1">{name}</h3>
          <p className="text-primary font-medium">{specialty}</p>
        </div>
      </div>

      <div className="p-6 space-y-4">
        <div className="flex items-center gap-2 text-muted-foreground">
          <svg
            className="w-5 h-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <span className="text-sm">{experience} experience</span>
        </div>

        {certifications && certifications.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {certifications.slice(0, 3).map((cert, index) => (
              <span
                key={index}
                className="text-xs bg-secondary text-secondary-foreground px-2 py-1 rounded-md"
              >
                {cert}
              </span>
            ))}
          </div>
        )}

        <button
          onClick={onViewProfile}
          className="w-full text-center text-primary font-medium hover:underline transition-all"
        >
          View Profile
        </button>
      </div>
    </div>
  )
}
