"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { PrimaryButton } from "./primary-button"
import { SecondaryButton } from "./secondary-button"

interface PricingCardProps {
  name: string
  price: number
  period?: "month" | "year"
  description?: string
  features: string[]
  isPopular?: boolean
  onSelect?: () => void
  className?: string
}

export function PricingCard({
  name,
  price,
  period = "month",
  description,
  features,
  isPopular = false,
  onSelect,
  className,
}: PricingCardProps) {
  return (
    <div
      className={cn(
        "relative bg-card border rounded-2xl p-8 flex flex-col",
        "transition-all duration-300",
        isPopular
          ? "border-primary shadow-[0_0_40px_rgba(34,197,94,0.2)]"
          : "border-border card-hover",
        className
      )}
    >
      {isPopular && (
        <div className="absolute -top-4 left-1/2 -translate-x-1/2">
          <span className="bg-primary text-primary-foreground text-sm font-semibold px-4 py-1.5 rounded-full">
            Most Popular
          </span>
        </div>
      )}

      <div className="text-center mb-8">
        <h3 className="text-xl font-bold text-foreground mb-2">{name}</h3>
        {description && (
          <p className="text-muted-foreground text-sm">{description}</p>
        )}
        <div className="mt-4">
          <span className="text-4xl font-bold text-foreground">${price}</span>
          <span className="text-muted-foreground">/{period}</span>
        </div>
      </div>

      <ul className="space-y-4 mb-8 flex-1" role="list">
        {features.map((feature, index) => (
          <li key={index} className="flex items-start gap-3">
            <svg
              className="w-5 h-5 text-primary flex-shrink-0 mt-0.5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
            <span className="text-foreground text-sm">{feature}</span>
          </li>
        ))}
      </ul>

      {isPopular ? (
        <PrimaryButton onClick={onSelect} className="w-full">
          Get Started
        </PrimaryButton>
      ) : (
        <SecondaryButton onClick={onSelect} className="w-full">
          Get Started
        </SecondaryButton>
      )}
    </div>
  )
}
