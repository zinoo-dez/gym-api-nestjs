import * as React from "react";

import { cn } from "@/lib/utils";

export interface InputProps extends React.ComponentProps<"input"> {
  floatingLabel?: string;
  containerClassName?: string;
  error?: boolean;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, containerClassName, type, floatingLabel, placeholder, error, ...props }, ref) => {
    const inputBaseClass = cn(
      "w-full rounded-xl border border-gray-200 bg-white text-gray-900 shadow-none transition-all placeholder:text-gray-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600/50 disabled:cursor-not-allowed disabled:opacity-50",
      error ? "border-red-300 focus-visible:ring-red-600/50" : "hover:border-gray-300",
      floatingLabel ? "peer h-12 px-4 pb-1.5 pt-5 text-sm placeholder:text-transparent" : "h-11 px-4 py-2 text-sm",
      className,
    );

    if (floatingLabel) {
      return (
        <label className={cn("relative block", containerClassName)}>
          <input ref={ref} type={type} className={inputBaseClass} placeholder={placeholder ?? " "} {...props} />
          <span
            className={cn(
              "pointer-events-none absolute left-3 top-2 z-[1] bg-card px-1 text-[11px] font-medium text-muted-foreground transition-all duration-150",
              "peer-placeholder-shown:top-1/2 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:px-0 peer-placeholder-shown:text-sm",
              "peer-focus:top-2 peer-focus:translate-y-0 peer-focus:px-1 peer-focus:text-[11px] peer-focus:text-primary",
              error && "text-destructive peer-focus:text-destructive",
            )}
          >
            {floatingLabel}
          </span>
        </label>
      );
    }

    return (
      <input
        type={type}
        className={inputBaseClass}
        ref={ref}
        placeholder={placeholder}
        {...props}
      />
    );
  },
);
Input.displayName = "Input";

export { Input };
