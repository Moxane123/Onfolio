/**
 * Onfolio — Reusable Badge / Tag Component
 * Strict single-line label constraint, restrained semantic color styling.
 */

import React from 'react';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'brand' | 'neutral' | 'success' | 'warning' | 'error' | 'dark';
  size?: 'sm' | 'md';
  icon?: React.ReactNode;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'neutral',
  size = 'md',
  icon,
  className = '',
  ...props
}) => {
  const sizeClasses = {
    sm: 'py-0.5 px-2 text-[10px] gap-1',
    md: 'py-1 px-2.5 text-xs gap-1.5',
  };

  const variantClasses = {
    brand: 'bg-[#FAF0EB] text-[#D26E46] border border-[#F1D8CB]',
    neutral: 'bg-[#F4F0EB] text-[#4A5361] border border-[#E8E3DC]',
    success: 'bg-[#EEF7F2] text-[#2A7954] border border-[#C8E5D7]',
    warning: 'bg-[#FEF8E7] text-[#B87002] border border-[#FCE6B5]',
    error: 'bg-[#FDF2F1] text-[#C13B2E] border border-[#F7C8C4]',
    dark: 'bg-[#191F28] text-white border border-[#2A3542]',
  };

  return (
    <span
      className={`inline-flex items-center font-medium rounded-md whitespace-nowrap leading-none transition-colors ${
        sizeClasses[size]
      } ${variantClasses[variant]} ${className}`}
      {...props}
    >
      {icon && <span className="shrink-0">{icon}</span>}
      <span className="truncate">{children}</span>
    </span>
  );
};
