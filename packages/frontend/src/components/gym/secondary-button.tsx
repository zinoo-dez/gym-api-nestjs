
import * as React from "react"
import { cn } from "@/lib/utils"

interface SecondaryButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  size?: "sm" | "md" | "lg"
  isLoading?: boolean
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
  variant?: "outline" | "ghost"
}

export function SecondaryButton({
  className,
  children,
  size = "md",
  isLoading = false,
  leftIcon,
  rightIcon,
  variant = "outline",
  disabled,
  ...props
}: SecondaryButtonProps) {
  const sizeClasses = {
    sm: "px-4 py-2 text-sm",
    md: "px-6 py-3 text-base",
    lg: "px-8 py-4 text-lg",
  }

  const variantClasses = {
    outline: "border-2 border-primary text-primary hover:bg-primary hover:text-primary-foreground",
    ghost: "text-foreground hover:bg-secondary hover:text-foreground",
  }

  return (
    <button
      className={cn(
        "inline-flex items-center justify-center gap-2 font-semibold",
        "bg-transparent rounded-lg transition-all duration-300",
        "focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background",
        "disabled:opacity-50 disabled:cursor-not-allowed",
        "active:scale-[0.98]",
        variantClasses[variant],
        sizeClasses[size],
        className
      )}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <svg
          className="animate-spin h-5 w-5"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
      ) : (
        leftIcon
      )}
      {children}
      {!isLoading && rightIcon}
    </button>
  )
}
