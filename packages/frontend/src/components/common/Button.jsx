import { memo } from "react";
import { motion } from "framer-motion";
import { buttonVariants } from "../../utils/animations";
import { usePreferencesStore } from "../../stores/usePreferencesStore";

export const Button = memo(function Button({
  children,
  onClick,
  type = "button",
  variant = "primary",
  isLoading = false,
  disabled = false,
  className = "",
  "aria-label": ariaLabel,
  ...props
}) {
  const prefersReducedMotion = usePreferencesStore(
    (state) => state.prefersReducedMotion,
  );

  const baseStyles = "px-4 py-3 rounded-xl font-bold transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base flex items-center justify-center";
  
  const variantStyles = {
    primary: "bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500",
    secondary: "bg-gray-200 text-gray-900 hover:bg-gray-300 focus:ring-gray-500",
    danger: "bg-red-600 text-white hover:bg-red-700 focus:ring-red-500",
    success: "bg-green-600 text-white hover:bg-green-700 focus:ring-green-500",
    premium: "bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:shadow-lg hover:shadow-blue-500/25 active:scale-95",
    ghost: "bg-white/5 text-white hover:bg-white/10 border border-white/10",
  };

  return (
    <motion.button
      type={type}
      onClick={onClick}
      disabled={disabled || isLoading}
      className={`${baseStyles} ${variantStyles[variant]} ${className}`}
      whileHover={!disabled && !isLoading && !prefersReducedMotion ? "hover" : undefined}
      whileTap={!disabled && !isLoading && !prefersReducedMotion ? "tap" : undefined}
      variants={buttonVariants}
      aria-label={ariaLabel}
      aria-busy={isLoading}
      aria-disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <span className="flex items-center justify-center">
          <svg
            className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
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
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
          Loading...
        </span>
      ) : (
        children
      )}
    </motion.button>
  );
});
