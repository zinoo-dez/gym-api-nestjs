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

  const baseStyles = "relative px-6 py-3.5 rounded-2xl font-bold transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-black disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base flex items-center justify-center overflow-hidden group";
  
  const variantStyles = {
    primary: "bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500 shadow-lg shadow-blue-600/20",
    secondary: "bg-white/10 text-white hover:bg-white/20 backdrop-blur-md border border-white/10 focus:ring-gray-500",
    danger: "bg-red-600/90 text-white hover:bg-red-700 focus:ring-red-500 shadow-lg shadow-red-600/20",
    success: "bg-emerald-600 text-white hover:bg-emerald-700 focus:ring-emerald-500 shadow-lg shadow-emerald-600/20",
    premium: "bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 text-white hover:shadow-2xl hover:shadow-blue-500/40 active:scale-[0.98] border border-white/10",
    ghost: "bg-transparent text-gray-400 hover:text-white hover:bg-white/5 border border-transparent hover:border-white/10",
    outline: "bg-transparent text-white border-2 border-white/20 hover:border-white/40 hover:bg-white/5",
  };

  return (
    <motion.button
      type={type}
      onClick={onClick}
      disabled={disabled || isLoading}
      className={`${baseStyles} ${variantStyles[variant] || variantStyles.primary} ${className}`}
      whileHover={!disabled && !isLoading && !prefersReducedMotion ? "hover" : undefined}
      whileTap={!disabled && !isLoading && !prefersReducedMotion ? "tap" : undefined}
      variants={buttonVariants}
      aria-label={ariaLabel}
      aria-busy={isLoading}
      aria-disabled={disabled || isLoading}
      {...props}
    >
      {/* Shine effect for premium button */}
      {variant === "premium" && (
        <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-shine pointer-events-none" />
      )}

      {isLoading ? (
        <span className="flex items-center justify-center">
          <svg
            className="animate-spin -ml-1 mr-3 h-5 w-5 text-current"
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
          Processing...
        </span>
      ) : (
        <span className="relative z-10 flex items-center gap-2">
          {children}
        </span>
      )}
    </motion.button>
  );
});
