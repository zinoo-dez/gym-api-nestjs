'use client';

import React from 'react';

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
      <div className={fullWidth ? 'w-full' : ''}>
        {label && (
          <label className="block text-sm font-medium text-foreground mb-2">
            {label}
            {props.required && <span className="text-destructive ml-1">*</span>}
          </label>
        )}
        <div className="relative">
          {icon && <div className="absolute left-3 top-3 text-muted-foreground">{icon}</div>}
          <input
            ref={ref}
            className={`w-full px-4 py-2.5 ${icon ? 'pl-10' : ''} bg-card border border-border rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors ${
              error ? 'border-destructive focus:ring-destructive/50' : ''
            } ${className || ''}`}
            {...props}
          />
        </div>
        {error && <p className="text-destructive text-sm mt-1">{error}</p>}
        {helperText && !error && <p className="text-muted-foreground text-sm mt-1">{helperText}</p>}
      </div>
    );
  }
);

FormInput.displayName = 'FormInput';
