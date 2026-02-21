import * as React from "react";
import { motion, HTMLMotionProps } from "framer-motion";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface ActionCardProps extends HTMLMotionProps<"button"> {
  title: string;
  icon: LucideIcon;
  onClick?: () => void;
  className?: string;
}

export const ActionCard = React.forwardRef<HTMLButtonElement, ActionCardProps>(
  ({ title, icon: Icon, onClick, className, ...props }, ref) => {
    return (
      <motion.button
        ref={ref}
        onClick={onClick}
        whileHover={{ scale: 1.02, y: -2 }}
        whileTap={{ scale: 0.98 }}
        className={cn(
          "group relative flex flex-col items-center justify-center gap-4 rounded-xl border bg-card p-6 text-card-foreground shadow-sm transition-colors hover:border-primary/50 hover:bg-primary/5 dark:bg-card/50 dark:backdrop-blur-sm",
          className
        )}
        {...props}
      >
        <div className="flex size-14 items-center justify-center rounded-full bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
          <Icon className="size-6" />
        </div>
        <span className="text-sm font-semibold tracking-tight">{title}</span>
      </motion.button>
    );
  }
);
ActionCard.displayName = "ActionCard";
