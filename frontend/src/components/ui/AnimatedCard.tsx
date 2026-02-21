import * as React from "react";
import { motion, HTMLMotionProps } from "framer-motion";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "./Card";

interface AnimatedCardProps extends Omit<HTMLMotionProps<"div">, "children"> {
  className?: string;
  children?: React.ReactNode;
}

export const AnimatedCard = React.forwardRef<HTMLDivElement, AnimatedCardProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <motion.div
        ref={ref}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        whileHover={{ y: -4, transition: { duration: 0.2 } }}
        className={cn("h-full", className)}
        {...props}
      >
        <Card className="h-full border-none shadow-md transition-shadow hover:shadow-lg dark:bg-card/50 dark:backdrop-blur-sm">
          {children}
        </Card>
      </motion.div>
    );
  }
);
AnimatedCard.displayName = "AnimatedCard";
