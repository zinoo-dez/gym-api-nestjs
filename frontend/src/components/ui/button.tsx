import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { motion } from "framer-motion";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "relative inline-flex cursor-pointer items-center justify-center gap-2 whitespace-nowrap overflow-hidden rounded-full text-sm font-bold tracking-tight ring-offset-background transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 active:scale-[0.98]",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground shadow-lg shadow-primary/10 hover:bg-primary/90",
        destructive:
          "bg-red-600 text-white shadow-lg shadow-red-100/50 hover:bg-red-700",
        outline:
          "border border-border bg-background text-foreground hover:bg-secondary hover:border-border hover:text-foreground",
        secondary:
          "bg-accent text-accent-foreground hover:bg-accent/80",
        ghost: "bg-transparent text-muted-foreground hover:bg-secondary hover:text-foreground",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-11 px-6",
        sm: "h-9 px-4 text-xs",
        lg: "h-12 px-10 text-base",
        icon: "h-11 w-11 rounded-xl",
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

const extractNodeText = (node: React.ReactNode): string => {
  if (node === null || node === undefined || typeof node === "boolean") {
    return "";
  }
  if (typeof node === "string" || typeof node === "number") {
    return String(node);
  }
  if (Array.isArray(node)) {
    return node.map(extractNodeText).join(" ");
  }
  if (React.isValidElement<{ children?: React.ReactNode }>(node)) {
    return extractNodeText(node.props.children);
  }
  return "";
};

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, onClick, disabled, children, title, ...props }, ref) => {
    const [ripples, setRipples] = React.useState<Ripple[]>([]);
    const buttonRef = React.useRef<HTMLButtonElement | null>(null);
    const autoTitle = title
      ?? (typeof props["aria-label"] === "string" && props["aria-label"].trim()
        ? props["aria-label"]
        : extractNodeText(children).trim() || undefined);

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
          title={autoTitle}
          {...props}
        />
      );
    }

    return (
      <motion.button
        whileHover={disabled ? undefined : { y: -0.5 }}
        whileTap={disabled ? undefined : { scale: 0.97 }}
        transition={{ type: "spring", stiffness: 400, damping: 30 }}
        className={cn(buttonVariants({ variant, size }), className)}
        ref={setButtonRef}
        disabled={disabled}
        title={autoTitle}
        onClick={(event) => {
          spawnRipple(event);
          onClick?.(event);
        }}
        {...props}
      >
        {ripples.map((ripple) => (
          <span
            key={ripple.id}
            className="pointer-events-none absolute rounded-full bg-current/10 animate-[ripple-wave_500ms_ease-out_forwards]"
            style={{
              width: ripple.size,
              height: ripple.size,
              left: ripple.x,
              top: ripple.y,
            }}
            aria-hidden="true"
          />
        ))}
        <span className="relative z-[1] inline-flex items-center justify-center gap-2">{children}</span>
      </motion.button>
    );
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
