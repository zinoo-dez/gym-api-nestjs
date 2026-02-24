import * as React from "react"

import { cn } from "@/lib/utils"

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  hasError?: boolean;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, hasError, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-14 w-full rounded-[4px] border border-outline bg-transparent px-4 py-4 text-body-large transition-all duration-200 placeholder:text-on-surface-variant focus-visible:outline-none focus-visible:border-primary focus-visible:border-2 focus-visible:px-[15px] disabled:cursor-not-allowed disabled:opacity-38 disabled:border-on-surface/12",
          hasError && "border-error focus-visible:border-error",
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Input.displayName = "Input"

export { Input }
