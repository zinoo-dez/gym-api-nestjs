'use client';

import React from 'react';
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface FormInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  fullWidth?: boolean;
  icon?: React.ReactNode;
}

export const FormInput = React.forwardRef<HTMLInputElement, FormInputProps>(
  ({ label, error, helperText, fullWidth = true, icon, className, ...props }, ref) => {
    return (
      <div className={cn(fullWidth ? "w-full" : "")}>
        <div className="relative">
          {icon && <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground z-[2]">{icon}</div>}
          <Input
            ref={ref}
            floatingLabel={label}
            error={Boolean(error)}
            className={cn(icon ? "pl-10" : "", className)}
            {...props}
          />
        </div>
        {error && <p className="text-destructive text-sm mt-1 animate-feedback-shake">{error}</p>}
        {helperText && !error && <p className="text-muted-foreground text-sm mt-1">{helperText}</p>}
      </div>
    );
  }
);

FormInput.displayName = 'FormInput';
