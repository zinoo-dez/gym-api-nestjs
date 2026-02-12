'use client';

import React from 'react';

interface FormCheckboxProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const FormCheckbox = React.forwardRef<HTMLInputElement, FormCheckboxProps>(
  ({ label, error, className, ...props }, ref) => {
    return (
      <div className="flex flex-col">
        <div className="flex items-center gap-2">
          <input
            ref={ref}
            type="checkbox"
            className={`w-5 h-5 rounded border-2 border-border bg-card cursor-pointer accent-primary focus:outline-none focus:ring-2 focus:ring-primary/50 ${
              error ? 'border-destructive' : ''
            } ${className || ''}`}
            {...props}
          />
          {label && (
            <label className="text-sm font-medium text-foreground cursor-pointer">{label}</label>
          )}
        </div>
        {error && <p className="text-destructive text-sm mt-1">{error}</p>}
      </div>
    );
  }
);

FormCheckbox.displayName = 'FormCheckbox';
