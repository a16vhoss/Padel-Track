'use client';

import { HTMLAttributes, forwardRef } from 'react';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  hover?: boolean;
}

export const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ hover = false, className = '', ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={`
          bg-card border border-border rounded-lg p-4 shadow-sm shadow-black/5
          ${hover ? 'hover:bg-card-hover cursor-pointer transition-all duration-200 hover:shadow-md hover:shadow-black/10 hover:-translate-y-0.5' : ''}
          ${className}
        `}
        {...props}
      />
    );
  }
);

Card.displayName = 'Card';
