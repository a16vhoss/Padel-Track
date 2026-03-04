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
          bg-card border border-border rounded-lg p-4
          ${hover ? 'hover:bg-card-hover cursor-pointer transition-colors' : ''}
          ${className}
        `}
        {...props}
      />
    );
  }
);

Card.displayName = 'Card';
