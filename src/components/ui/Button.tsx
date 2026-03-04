'use client';

import { ButtonHTMLAttributes, forwardRef } from 'react';

type Variant = 'primary' | 'secondary' | 'danger' | 'ghost' | 'outline';
type Size = 'sm' | 'md' | 'lg';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  active?: boolean;
}

const variantClasses: Record<Variant, string> = {
  primary: 'bg-primary text-black hover:bg-primary-hover',
  secondary: 'bg-secondary text-white hover:bg-blue-600',
  danger: 'bg-danger text-white hover:bg-red-600',
  ghost: 'bg-transparent text-foreground hover:bg-card-hover',
  outline: 'bg-transparent border border-border text-foreground hover:bg-card-hover',
};

const sizeClasses: Record<Size, string> = {
  sm: 'px-2 py-1 text-xs',
  md: 'px-3 py-1.5 text-sm',
  lg: 'px-4 py-2 text-base',
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', size = 'md', active, className = '', disabled, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={`
          inline-flex items-center justify-center rounded-md font-medium
          transition-colors focus-visible:outline-none focus-visible:ring-2
          focus-visible:ring-primary disabled:opacity-50 disabled:cursor-not-allowed
          ${variantClasses[variant]}
          ${sizeClasses[size]}
          ${active ? 'ring-2 ring-primary' : ''}
          ${className}
        `}
        disabled={disabled}
        {...props}
      />
    );
  }
);

Button.displayName = 'Button';
