import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { MaterialIcon } from "./MaterialIcon";
import { AlertType } from "@/context/AlertContext";

interface AlertProps {
  message: string;
  type: AlertType;
  onClose: () => void;
  duration?: number;
}

const typeConfig = {
  success: {
    icon: "check_circle",
    className: "bg-success/10 text-success border-success/20",
    iconColor: "text-success",
    progressColor: "bg-success",
  },
  error: {
    icon: "error",
    className: "bg-destructive/10 text-destructive border-destructive/20",
    iconColor: "text-destructive",
    progressColor: "bg-destructive",
  },
  warning: {
    icon: "warning",
    className: "bg-secondary text-secondary-foreground border-secondary/20",
    iconColor: "text-secondary",
    progressColor: "bg-secondary",
  },
  info: {
    icon: "info",
    className: "bg-primary/10 text-primary border-primary/20",
    iconColor: "text-primary",
    progressColor: "bg-primary",
  },
};

export const Alert: React.FC<AlertProps> = ({ message, type, onClose, duration = 5000 }) => {
  const config = typeConfig[type];
  const [progress, setProgress] = useState(100);

  useEffect(() => {
    if (duration === Infinity) return;

    const startTime = Date.now();
    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const remaining = Math.max(0, 100 - (elapsed / duration) * 100);
      setProgress(remaining);
      if (remaining === 0) clearInterval(interval);
    }, 10);

    return () => clearInterval(interval);
  }, [duration]);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 50, scale: 0.9, filter: "blur(10px)" }}
      animate={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
      exit={{ opacity: 0, scale: 0.95, filter: "blur(5px)", transition: { duration: 0.2 } }}
      transition={{ type: "spring", stiffness: 300, damping: 25 }}
      whileHover={{ scale: 1.02 }}
      className={cn(
        "relative flex w-full max-w-sm overflow-hidden rounded-2xl border p-4 shadow-xl backdrop-blur-md",
        config.className
      )}
    >
      <div className="mr-3 flex-shrink-0">
        <MaterialIcon icon={config.icon} className={cn("text-2xl", config.iconColor)} fill />
      </div>
      
      <div className="flex-1 pr-6">
        <p className="text-sm font-medium leading-tight">{message}</p>
      </div>

      <button
        onClick={onClose}
        className="absolute right-2 top-2 rounded-full p-1 opacity-60 transition-opacity hover:bg-black/5 hover:opacity-100 dark:hover:bg-white/10"
      >
        <MaterialIcon icon="close" className="text-lg" />
      </button>

      {duration !== Infinity && (
        <div className="absolute bottom-0 left-0 h-1 w-full bg-black/5 dark:bg-white/10">
          <motion.div
            className={cn("h-full", config.progressColor)}
            initial={{ width: "100%" }}
            animate={{ width: `${progress}%` }}
            transition={{ ease: "linear" }}
          />
        </div>
      )}
    </motion.div>
  );
};
