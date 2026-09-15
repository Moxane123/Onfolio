/**
 * Onfolio — Reusable Card Component
 * Warm surface container with restrained borders and mathematical radius.
 */

import React from 'react';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'surface' | 'subtle' | 'elevated' | 'dark';
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

export const Card: React.FC<CardProps> = ({
  children,
  variant = 'surface',
  padding = 'md',
  className = '',
  ...props
}) => {
  const variantClasses = {
    surface: 'bg-white border border-[#E8E3DC] shadow-2xs',
    subtle: 'bg-[#F7F4EE] border border-[#E8E3DC]',
    elevated: 'bg-white border border-[#E8E3DC] shadow-sm',
    dark: 'bg-[#191F28] border border-[#2A3542] text-white shadow-md',
  };

  const paddingClasses = {
    none: 'p-0',
    sm: 'p-3 sm:p-4',
    md: 'p-5 sm:p-6',
    lg: 'p-6 sm:p-8',
  };

  return (
    <div
      className={`rounded-2xl transition-all ${variantClasses[variant]} ${paddingClasses[padding]} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};
