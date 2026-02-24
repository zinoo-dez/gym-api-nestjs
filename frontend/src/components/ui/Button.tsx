import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full text-label-large transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-38 active:scale-95",
  {
    variants: {
      variant: {
        filled: "bg-primary text-on-primary hover:shadow-md",
        tonal: "bg-secondary-container text-on-secondary-container hover:shadow-sm",
        outlined: "border border-outline bg-transparent text-primary hover:bg-primary/5",
        text: "bg-transparent text-primary hover:bg-primary/5",
        elevated: "bg-surface-container-low text-primary shadow-sm hover:shadow-md hover:bg-primary/5",
        error: "bg-error text-on-error hover:shadow-md",
      },
      size: {
        default: "h-10 px-6",
        sm: "h-8 px-4 text-label-medium",
        lg: "h-12 px-8",
        icon: "h-10 w-10 p-2",
      },
    },
    defaultVariants: {
      variant: "filled",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
