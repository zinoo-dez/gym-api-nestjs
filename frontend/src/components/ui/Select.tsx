import * as React from "react";

import { cn } from "@/lib/utils";

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  hasError?: boolean;
}

const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, hasError, children, ...props }, ref) => {
    return (
      <select
        ref={ref}
        className={cn(
          "flex h-14 w-full rounded-[4px] border border-outline bg-transparent px-4 py-4 text-body-large transition-all duration-200 focus-visible:outline-none focus-visible:border-primary focus-visible:border-2 focus-visible:px-[15px] disabled:cursor-not-allowed disabled:opacity-38 disabled:border-on-surface/12 appearance-none",
          hasError && "border-error focus-visible:border-error",
          className,
        )}
        {...props}
      >
        {children}
      </select>
    );
  },
);

Select.displayName = "Select";

export { Select };
