import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-lg border px-2 py-0.5 text-[10px] font-bold uppercase tracking-tight transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default: "border-transparent bg-gray-900 text-white hover:bg-gray-800",
        secondary: "border-transparent bg-gray-100 text-gray-900 hover:bg-gray-200",
        destructive: "border-transparent bg-red-100 text-red-700 hover:bg-red-200",
        outline: "border-gray-200 bg-white text-gray-600",
        "m3-primary": "border-none bg-blue-50 text-blue-700 hover:bg-blue-100",
        "m3-success": "border-none bg-emerald-50 text-emerald-700 hover:bg-emerald-100",
        "m3-warning": "border-none bg-amber-50 text-amber-700 hover:bg-amber-100",
        "m3-error": "border-none bg-red-50 text-red-700 hover:bg-red-100",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
