import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { motion } from "framer-motion";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "relative inline-flex items-center justify-center gap-2 whitespace-nowrap overflow-hidden rounded-full text-sm font-medium tracking-[0.01em] ring-offset-background transition-[background-color,color,border-color,box-shadow,transform] duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/70 focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground shadow-[var(--surface-shadow-1)] hover:bg-primary/92 hover:shadow-[var(--surface-shadow-2)] active:bg-primary/88",
        destructive:
          "bg-destructive text-destructive-foreground shadow-[var(--surface-shadow-1)] hover:bg-destructive/92 hover:shadow-[var(--surface-shadow-2)] active:bg-destructive/88",
        outline:
          "border border-input bg-card text-foreground shadow-[var(--surface-shadow-1)] hover:bg-accent hover:text-accent-foreground",
        secondary:
          "border border-primary/20 bg-primary/10 text-primary hover:bg-primary/14 hover:border-primary/30",
        ghost: "bg-transparent text-foreground/80 hover:bg-accent hover:text-foreground",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-10 px-5 py-2",
        sm: "h-9 px-4",
        lg: "h-11 px-8",
        icon: "h-10 w-10 rounded-full",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

interface Ripple {
  id: number;
  x: number;
  y: number;
  size: number;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, onClick, disabled, ...props }, ref) => {
    const [ripples, setRipples] = React.useState<Ripple[]>([]);
    const buttonRef = React.useRef<HTMLButtonElement | null>(null);

    const setButtonRef = (node: HTMLButtonElement | null) => {
      buttonRef.current = node;

      if (typeof ref === "function") {
        ref(node);
      } else if (ref) {
        ref.current = node;
      }
    };

    const spawnRipple = (event: React.MouseEvent<HTMLButtonElement>) => {
      if (disabled || variant === "link") {
        return;
      }

      const button = buttonRef.current;
      if (!button) {
        return;
      }

      const rect = button.getBoundingClientRect();
      const size = Math.max(rect.width, rect.height) * 1.15;
      const ripple: Ripple = {
        id: Date.now() + Math.random(),
        x: event.clientX - rect.left - size / 2,
        y: event.clientY - rect.top - size / 2,
        size,
      };

      setRipples((prev) => [...prev, ripple]);

      window.setTimeout(() => {
        setRipples((prev) => prev.filter((item) => item.id !== ripple.id));
      }, 480);
    };

    if (asChild) {
      return (
        <Slot
          className={cn(buttonVariants({ variant, size }), className)}
          ref={ref}
          aria-disabled={disabled}
          {...props}
        />
      );
    }

    return (
      <motion.button
        whileHover={disabled ? undefined : { y: -1 }}
        whileTap={disabled ? undefined : { scale: 0.98 }}
        transition={{ type: "spring", stiffness: 320, damping: 26 }}
        className={cn(buttonVariants({ variant, size }), className)}
        ref={setButtonRef}
        disabled={disabled}
        onClick={(event) => {
          spawnRipple(event);
          onClick?.(event);
        }}
        {...props}
      >
        {ripples.map((ripple) => (
          <span
            key={ripple.id}
            className="pointer-events-none absolute rounded-full bg-current/20 animate-[ripple-wave_480ms_ease-out_forwards]"
            style={{
              width: ripple.size,
              height: ripple.size,
              left: ripple.x,
              top: ripple.y,
            }}
            aria-hidden="true"
          />
        ))}
        <span className="relative z-[1] inline-flex items-center justify-center gap-2">{props.children}</span>
      </motion.button>
    );
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
