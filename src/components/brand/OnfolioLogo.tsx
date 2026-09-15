/**
 * Onfolio — Official Brand Logo Component
 * Pixel-accurate vector representation of the Onfolio brand identity
 * (terracotta portal emblem + dark slate wordmark).
 */

import React from 'react';

export interface OnfolioLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl' | number;
  layout?: 'horizontal' | 'vertical' | 'mark-only';
  className?: string;
  wordmarkColor?: string;
  markColor?: string;
}

export const OnfolioLogoMark: React.FC<{
  size?: number;
  className?: string;
  color?: string;
}> = ({ size = 40, className = '', color = '#D26E46' }) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`shrink-0 ${className}`}
      aria-label="Onfolio Emblem"
    >
      {/*
        The Onfolio Mark:
        - A bold terracotta ring representing the onchain boundary/ledger
        - An open folio/portal flap in perspective opening inward from the left
      */}
      {/* Left Outer Arc */}
      <path
        d="M44.5 77.5 C34.5 76.5 26.5 68 25 57 C23 44 31 31.5 44.5 28.5 L44.5 22.5 C27.5 25.5 17 41.5 19.5 59 C21.5 73.5 32 84 46.5 85.5 L46.5 77.5 Z"
        fill={color}
      />

      {/* The Open Folio Door / Portal (Solid perspective leaf) */}
      <path
        d="M48 21.5 L64 16 L64 71.5 L48 78 Z"
        fill={color}
      />

      {/* Right Circular Arc (Upper & Lower perimeter completing the ring) */}
      <path
        d="M67 24 C77 30 83 41.5 83 54 C83 67 76 78 65 83.5 C55 88.5 42 87 33 80 L37.5 73 C44.5 78 54 79.5 61.5 75.5 C70 71 74.5 62 74.5 54 C74.5 44 69.5 35 61.5 30.5 L67 24 Z"
        fill={color}
      />
    </svg>
  );
};

export const OnfolioLogo: React.FC<OnfolioLogoProps> = ({
  size = 'md',
  layout = 'horizontal',
  className = '',
  wordmarkColor = '#191F28',
  markColor = '#D26E46',
}) => {
  let markSize = 36;
  let textClass = 'text-xl';
  let gapClass = 'space-x-3';

  if (typeof size === 'number') {
    markSize = size;
    textClass = size > 60 ? 'text-3xl' : size > 40 ? 'text-2xl' : 'text-base';
  } else {
    switch (size) {
      case 'sm':
        markSize = 26;
        textClass = 'text-base';
        gapClass = 'space-x-2';
        break;
      case 'md':
        markSize = 38;
        textClass = 'text-xl tracking-tight';
        gapClass = 'space-x-3';
        break;
      case 'lg':
        markSize = 56;
        textClass = 'text-3xl tracking-tight';
        gapClass = 'space-y-3';
        break;
      case 'xl':
        markSize = 88;
        textClass = 'text-4xl tracking-tight font-bold';
        gapClass = 'space-y-4';
        break;
    }
  }

  if (layout === 'mark-only') {
    return <OnfolioLogoMark size={markSize} className={className} color={markColor} />;
  }

  if (layout === 'vertical') {
    return (
      <div className={`flex flex-col items-center text-center ${gapClass} ${className}`}>
        <OnfolioLogoMark size={markSize} color={markColor} />
        <span
          className={`font-extrabold ${textClass}`}
          style={{ color: wordmarkColor, fontFamily: "'Plus Jakarta Sans', sans-serif" }}
        >
          Onfolio
        </span>
      </div>
    );
  }

  return (
    <div className={`flex items-center ${gapClass} ${className}`}>
      <OnfolioLogoMark size={markSize} color={markColor} />
      <span
        className={`font-extrabold ${textClass}`}
        style={{ color: wordmarkColor, fontFamily: "'Plus Jakarta Sans', sans-serif" }}
      >
        Onfolio
      </span>
    </div>
  );
};
