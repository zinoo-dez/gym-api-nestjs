import { memo } from "react";
import { motion } from "framer-motion";

export const PrimaryButton = memo(function PrimaryButton({
  children,
  onClick,
  type = "button",
  isLoading = false,
  disabled = false,
  className = "",
  icon,
  fullWidth = false,
  size = "md",
  ...props
}) {
  const sizeStyles = {
    sm: "px-4 py-2 text-sm",
    md: "px-6 py-3.5 text-base",
    lg: "px-8 py-4 text-lg",
  };

  return (
    <motion.button
      type={type}
      onClick={onClick}
      disabled={disabled || isLoading}
      className={`
        relative font-bold rounded-2xl transition-all
        bg-primary text-dark-900 
        hover:bg-accent hover:scale-[1.02] hover:brightness-110
        focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-dark-900
        disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100
        shadow-glow hover:shadow-glow-lg
        dark:bg-primary dark:text-dark-900
        ${sizeStyles[size]}
        ${fullWidth ? "w-full" : ""}
        ${className}
      `}
      whileHover={!disabled && !isLoading ? { scale: 1.02 } : undefined}
      whileTap={!disabled && !isLoading ? { scale: 0.98 } : undefined}
      aria-busy={isLoading}
      aria-disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <span className="flex items-center justify-center gap-2">
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
          <span>Loading...</span>
        </span>
      ) : (
        <span className="flex items-center justify-center gap-2">
          {icon && <span className="w-5 h-5" aria-hidden="true">{icon}</span>}
          {children}
        </span>
      )}
    </motion.button>
  );
});
