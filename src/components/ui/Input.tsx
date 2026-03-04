'use client';

import { InputHTMLAttributes, forwardRef } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className = '', ...props }, ref) => {
    return (
      <div className="flex flex-col gap-1">
        {label && (
          <label className="text-sm text-muted">{label}</label>
        )}
        <input
          ref={ref}
          className={`
            bg-card border border-border rounded-md px-3 py-1.5 text-sm
            text-foreground placeholder:text-muted/50
            focus:outline-none focus:ring-2 focus:ring-primary
            ${error ? 'border-danger' : ''}
            ${className}
          `}
          {...props}
        />
        {error && <span className="text-xs text-danger">{error}</span>}
      </div>
    );
  }
);

Input.displayName = 'Input';
