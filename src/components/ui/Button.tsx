/**
 * Onfolio — Reusable Button Component
 * Standardized touch targets, optical spacing (horizontal padding = 2x vertical padding),
 * confident typography, and brand-aligned states.
 */

import React from 'react';
import { Loader2 } from 'lucide-react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'dark' | 'subtle' | 'ghost' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  leftIcon,
  rightIcon,
  fullWidth = false,
  className = '',
  disabled,
  ...props
}) => {
  // Size variants with strict 2:1 horizontal to vertical padding ratio
  const sizeClasses = {
    sm: 'py-1.5 px-3 text-xs rounded-lg gap-1.5 min-h-[34px]',
    md: 'py-2 px-4 text-xs sm:text-sm rounded-lg gap-2 min-h-[40px]',
    lg: 'py-2.5 px-5 text-sm sm:text-base rounded-xl gap-2.5 min-h-[46px]',
  };

  // Color variants
  const variantClasses = {
    primary:
      'bg-[#D26E46] hover:bg-[#BF5D35] active:bg-[#A94E27] text-white shadow-xs focus-visible:ring-[#D26E46]',
    secondary:
      'bg-white hover:bg-[#F7F4EE] active:bg-[#EFEAE2] text-[#191F28] border border-[#E8E3DC] shadow-2xs focus-visible:ring-[#191F28]',
    dark:
      'bg-[#191F28] hover:bg-[#2A3542] active:bg-[#11161E] text-white shadow-xs focus-visible:ring-[#191F28]',
    subtle:
      'bg-[#FAF0EB] hover:bg-[#F4E3DA] active:bg-[#EDD4C6] text-[#D26E46] border border-[#F1D8CB] focus-visible:ring-[#D26E46]',
    ghost:
      'bg-transparent hover:bg-[#F4F0EB] text-[#4A5361] hover:text-[#191F28] focus-visible:ring-[#D26E46]',
    outline:
      'bg-transparent hover:bg-[#FAF0EB] text-[#D26E46] border border-[#D26E46] focus-visible:ring-[#D26E46]',
  };

  return (
    <button
      disabled={disabled || isLoading}
      className={`inline-flex items-center justify-center font-medium transition-all select-none cursor-pointer focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-offset-1 disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none ${
        sizeClasses[size]
      } ${variantClasses[variant]} ${fullWidth ? 'w-full' : ''} ${className}`}
      {...props}
    >
      {isLoading && <Loader2 className="w-4 h-4 animate-spin shrink-0" />}
      {!isLoading && leftIcon && <span className="shrink-0">{leftIcon}</span>}
      <span className="whitespace-nowrap">{children}</span>
      {!isLoading && rightIcon && <span className="shrink-0">{rightIcon}</span>}
    </button>
  );
};
