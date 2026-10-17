import React, { useState } from 'react';

export const DEFAULT_LOGO_URL = '/src/assets/images/mm_concept_logo_transparent.png';

interface BrandLogoProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
  variant?: 'light' | 'dark';
  className?: string;
  customLogoUrl?: string;
  orientation?: 'horizontal' | 'vertical';
}

/**
 * MM Concept Brand Logo
 * Features:
 * - Exclusive 3D golden metallic MM PNG mark situated on top ("somente o MM PNG acima")
 * - 100% transparent background (no circle frame, no pink box)
 * - Underneath: "Mariane Moreira" on top and "Concept" below (no duplicate "MM" text)
 */
export const BrandLogo: React.FC<BrandLogoProps> = ({
  size = 'md',
  showText = true,
  variant = 'light',
  className = '',
  customLogoUrl,
  orientation = 'vertical',
}) => {
  const [imageError, setImageError] = useState(false);
  const logoSrc = customLogoUrl || DEFAULT_LOGO_URL;
  const isDark = variant === 'dark';

  // Dimension mapping for the mark (proportioned to sit gracefully above the text)
  const dimensionMap = {
    xs: 'w-8 h-5 sm:w-9 sm:h-6',
    sm: 'w-11 h-7 sm:w-13 sm:h-8',
    md: 'w-16 h-10 sm:w-20 sm:h-12',
    lg: 'w-24 h-15 sm:w-28 sm:h-17',
    xl: 'w-36 h-22 sm:w-44 sm:h-27',
  };

  const gradId = isDark ? 'mmGoldDark' : 'mmGoldLight';

  return (
    <div
      className={`inline-flex flex-col items-center text-center justify-center transition-transform duration-300 group-hover:scale-[1.02] ${className}`}
    >
      {/* 1. MM PNG Mark (Sitting gracefully on top) */}
      <div
        className={`relative ${dimensionMap[size]} shrink-0 flex items-center justify-center`}
      >
        {!imageError ? (
          <img
            src={logoSrc}
            alt="MM - Mariane Moreira Concept"
            onError={() => setImageError(true)}
            className="w-full h-full object-contain filter drop-shadow-xs transition-opacity duration-300"
            loading="eager"
            decoding="async"
          />
        ) : (
          /* High-Fidelity Vector Fallback: Two Interlocking 'M' Letters */
          <svg
            viewBox="0 0 100 65"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="w-full h-full overflow-visible drop-shadow-xs"
            preserveAspectRatio="xMidYMid meet"
            aria-label="MM Monograma"
          >
            <defs>
              <linearGradient id={gradId} x1="0%" y1="0%" x2="100%" y2="100%">
                {isDark ? (
                  <>
                    <stop offset="0%" stopColor="#FFF4D9" />
                    <stop offset="35%" stopColor="#E6C47A" />
                    <stop offset="70%" stopColor="#C5A059" />
                    <stop offset="100%" stopColor="#99742F" />
                  </>
                ) : (
                  <>
                    <stop offset="0%" stopColor="#DFC386" />
                    <stop offset="30%" stopColor="#F7E4B2" />
                    <stop offset="65%" stopColor="#C5A059" />
                    <stop offset="100%" stopColor="#8A6728" />
                  </>
                )}
              </linearGradient>
            </defs>

            {/* Left M */}
            <path
              d="M4 14 Q8 6 18 6 L18 56"
              stroke={`url(#${gradId})`}
              strokeWidth="3.2"
              strokeLinecap="round"
              fill="none"
            />
            <line x1="12" y1="56" x2="24" y2="56" stroke={`url(#${gradId})`} strokeWidth="2.2" strokeLinecap="square" />
            <path d="M18 6 L36 50" stroke={`url(#${gradId})`} strokeWidth="4" strokeLinecap="round" />
            <path d="M36 50 L50 6" stroke={`url(#${gradId})`} strokeWidth="2.4" strokeLinecap="round" />
            <line x1="50" y1="6" x2="50" y2="56" stroke={`url(#${gradId})`} strokeWidth="3" strokeLinecap="round" />
            <line x1="44" y1="56" x2="56" y2="56" stroke={`url(#${gradId})`} strokeWidth="2.2" strokeLinecap="square" />

            {/* Right M (Intertwined) */}
            <line x1="47" y1="6" x2="47" y2="56" stroke={`url(#${gradId})`} strokeWidth="3" strokeLinecap="round" />
            <line x1="41" y1="56" x2="53" y2="56" stroke={`url(#${gradId})`} strokeWidth="2.2" strokeLinecap="square" />
            <path d="M47 6 L65 50" stroke={`url(#${gradId})`} strokeWidth="4" strokeLinecap="round" />
            <path d="M65 50 L82 6" stroke={`url(#${gradId})`} strokeWidth="2.4" strokeLinecap="round" />
            <path
              d="M96 14 Q92 6 82 6 L82 56"
              stroke={`url(#${gradId})`}
              strokeWidth="3.2"
              strokeLinecap="round"
              fill="none"
            />
            <line x1="76" y1="56" x2="88" y2="56" stroke={`url(#${gradId})`} strokeWidth="2.2" strokeLinecap="square" />

            {/* Center Weave Arch */}
            <path d="M38 6 Q48 2 54 8" stroke={`url(#${gradId})`} strokeWidth="3.2" strokeLinecap="round" fill="none" />
          </svg>
        )}
      </div>

      {/* 2. Text Underneath: "Mariane Moreira Concept" (No duplicate written MM) */}
      {showText && (
        <div className="flex flex-col items-center text-center leading-none mt-1">
          <span
            className={`font-serif tracking-[0.24em] sm:tracking-[0.28em] font-medium uppercase transition-colors whitespace-nowrap ${
              size === 'xs'
                ? 'text-[7.5px] sm:text-[8px]'
                : size === 'sm'
                ? 'text-[9px] sm:text-[10px]'
                : size === 'lg' || size === 'xl'
                ? 'text-xs sm:text-sm tracking-[0.34em]'
                : 'text-[10px] sm:text-[11px]'
            } ${isDark ? 'text-[#f5ebd7]' : 'text-[#1c1917]'}`}
          >
            Mariane Moreira
          </span>
          <span
            className={`tracking-[0.40em] uppercase font-light mt-0.5 transition-colors ${
              size === 'xs'
                ? 'text-[6px]'
                : size === 'sm'
                ? 'text-[7px]'
                : size === 'lg' || size === 'xl'
                ? 'text-[10px]'
                : 'text-[7.5px] sm:text-[8px]'
            } ${isDark ? 'text-[#e5c378]' : 'text-[#8e6e34]'}`}
          >
            Concept
          </span>
        </div>
      )}
    </div>
  );
};
