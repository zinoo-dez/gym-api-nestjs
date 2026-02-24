import * as React from "react";

import { cn } from "@/lib/utils";

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  hasError?: boolean;
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, hasError, ...props }, ref) => {
    return (
      <textarea
        ref={ref}
        className={cn(
          "flex min-h-32 w-full rounded-[4px] border border-outline bg-transparent px-4 py-4 text-body-large transition-all duration-200 placeholder:text-on-surface-variant focus-visible:outline-none focus-visible:border-primary focus-visible:border-2 focus-visible:px-[15px] disabled:cursor-not-allowed disabled:opacity-38 disabled:border-on-surface/12",
          hasError && "border-error focus-visible:border-error",
          className,
        )}
        {...props}
      />
    );
  },
);

Textarea.displayName = "Textarea";

export { Textarea };
