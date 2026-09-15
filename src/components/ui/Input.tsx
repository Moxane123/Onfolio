/**
 * Onfolio — Reusable Input Component
 * Clean financial typography, crisp warm borders, and clear validation feedback.
 */

import React from 'react';
import { AlertCircle } from 'lucide-react';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  helperText?: string;
  error?: string | null;
  leftIcon?: React.ReactNode;
  rightAction?: React.ReactNode;
}

export const Input: React.FC<InputProps> = ({
  label,
  helperText,
  error,
  leftIcon,
  rightAction,
  className = '',
  id,
  ...props
}) => {
  const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <div className="w-full">
      {label && (
        <label
          htmlFor={inputId}
          className="block text-xs font-semibold text-[#191F28] mb-1.5"
        >
          {label}
        </label>
      )}

      <div className="relative flex items-center">
        {leftIcon && (
          <div className="absolute left-3.5 flex items-center pointer-events-none text-[#798596]">
            {leftIcon}
          </div>
        )}

        <input
          id={inputId}
          className={`w-full py-2.5 ${leftIcon ? 'pl-10' : 'pl-3.5'} ${
            rightAction ? 'pr-11' : 'pr-3.5'
          } bg-white border rounded-xl text-xs sm:text-sm text-[#191F28] placeholder:text-[#A5AFBD] transition-all focus:outline-hidden focus:ring-2 focus:ring-[#D26E46] focus:border-[#D26E46] ${
            error
              ? 'border-[#C13B2E] bg-[#FDF2F1]'
              : 'border-[#E8E3DC] hover:border-[#D5CFC5]'
          } ${className}`}
          {...props}
        />

        {rightAction && (
          <div className="absolute right-3 flex items-center">
            {rightAction}
          </div>
        )}
      </div>

      {error ? (
        <div className="mt-1.5 flex items-center space-x-1.5 text-xs text-[#C13B2E]">
          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
          <span>{error}</span>
        </div>
      ) : helperText ? (
        <p className="mt-1.5 text-xs text-[#798596]">{helperText}</p>
      ) : null}
    </div>
  );
};
