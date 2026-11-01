import React from 'react';
import Link from 'next/link';

interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  asLink?: boolean;
  inverted?: boolean;
}

/**
 * Emari Grill Logo Component
 * Single source of truth for the brand logo.
 * Replace the SVG or text here when the real brand logo asset is provided.
 */
export function Logo({
  className = '',
  size = 'md',
  asLink = true,
  inverted = false,
}: LogoProps) {
  const sizeClasses = {
    sm: 'text-lg gap-1.5',
    md: 'text-2xl gap-2',
    lg: 'text-3xl gap-2.5',
  };

  const iconSizes = {
    sm: 'w-5 h-5',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
  };

  const flameIcon = (
    <svg
      className={`${iconSizes[size]} shrink-0 text-brand-fire-600 group-hover:text-brand-fire-700 transition-colors duration-200`}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M12 23c-4.97 0-9-3.8-9-8.5C3 8.35 8.1 4.54 11.23 1.25a1 1 0 0 1 1.54 0C15.9 4.54 21 8.35 21 14.5c0 4.7-4.03 8.5-9 8.5zm0-2c3.87 0 7-2.92 7-6.5 0-3.86-3.8-7.06-7-10.37-3.2 3.31-7 6.51-7 10.37 0 3.58 3.13 6.5 7 6.5zm-1-4a3 3 0 0 1 3-3c.8 0 1.5.3 2 1-.5 2.5-2 3.5-3.5 3.5-.83 0-1.5-.67-1.5-1.5z" />
    </svg>
  );

  const content = (
    <span
      className={`inline-flex items-center font-black tracking-wider uppercase transition-colors ${
        sizeClasses[size]
      } ${
        inverted
          ? 'text-brand-offwhite'
          : 'text-brand-charcoal-900 group-hover:text-brand-fire-700'
      } ${className}`}
    >
      {flameIcon}
      <span className="font-extrabold tracking-tight">
        EMARI <span className="text-brand-fire-700">GRILL</span>
      </span>
    </span>
  );

  if (asLink) {
    return (
      <Link
        href="/"
        aria-label="Emari Grill Home"
        className="group inline-flex items-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-fire-700 focus-visible:ring-offset-2 rounded-md p-1"
      >
        {content}
      </Link>
    );
  }

  return content;
}

export default Logo;

