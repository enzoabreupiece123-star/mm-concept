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
 * - Two intertwining serif 'M' letters crossing each other ("os dois M se cruzando")
 * - 100% transparent background (no background circle, no pink plate, fills container completely)
 * - True 3D golden metallic mark extracted directly from the official brand artwork
 * - Typography lockup: "MM CONCEPT" on top, "Mariane Moreira" underneath
 */
export const BrandLogo: React.FC<BrandLogoProps> = ({
  size = 'md',
  showText = true,
  variant = 'light',
  className = '',
  customLogoUrl,
  orientation = 'horizontal',
}) => {
  const [imageError, setImageError] = useState(false);
  const logoSrc = customLogoUrl || DEFAULT_LOGO_URL;
  const isDark = variant === 'dark';

  // Dimension mapping for the mark
  const dimensionMap = {
    xs: 'w-7 h-5 sm:w-8 sm:h-6',
    sm: 'w-10 h-7 sm:w-12 sm:h-8',
    md: 'w-14 h-9 sm:w-16 sm:h-11',
    lg: 'w-20 h-13 sm:w-24 sm:h-16',
    xl: 'w-32 h-21 sm:w-40 sm:h-26',
  };

  const gradId = isDark ? 'mmGoldDark' : 'mmGoldLight';

  return (
    <div
      className={`inline-flex items-center ${
        orientation === 'vertical' ? 'flex-col text-center gap-2' : 'gap-3 text-left'
      } ${className}`}
    >
      {/* Intertwining MM Monogram - No background, fills container completely */}
      <div
        className={`relative ${dimensionMap[size]} shrink-0 flex items-center justify-center transition-transform duration-300 group-hover:scale-105`}
      >
        {!imageError ? (
          <img
            src={logoSrc}
            alt="MM Concept - Mariane Moreira"
            onError={() => setImageError(true)}
            className="w-full h-full object-contain filter drop-shadow-xs transition-opacity duration-300"
            loading="eager"
            decoding="async"
          />
        ) : (
          /* High-Fidelity Vector Fallback: Clearly TWO 'M' Letters Interlocking */
          <svg
            viewBox="0 0 100 65"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="w-full h-full overflow-visible drop-shadow-xs"
            preserveAspectRatio="xMidYMid meet"
            aria-label="MM Concept"
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

            {/* FIRST 'M' (Left) */}
            {/* Left curved flared horn at top */}
            <path
              d="M4 14 Q8 6 18 6 L18 56"
              stroke={`url(#${gradId})`}
              strokeWidth="3.2"
              strokeLinecap="round"
              fill="none"
            />
            {/* Left base serif */}
            <line x1="12" y1="56" x2="24" y2="56" stroke={`url(#${gradId})`} strokeWidth="2.2" strokeLinecap="square" />

            {/* Left M diagonal down to apex */}
            <path
              d="M18 6 L36 50"
              stroke={`url(#${gradId})`}
              strokeWidth="4"
              strokeLinecap="round"
            />

            {/* Left M diagonal up to center top arch */}
            <path
              d="M36 50 L50 6"
              stroke={`url(#${gradId})`}
              strokeWidth="2.4"
              strokeLinecap="round"
            />

            {/* Left M right stem down to base */}
            <line x1="50" y1="6" x2="50" y2="56" stroke={`url(#${gradId})`} strokeWidth="3" strokeLinecap="round" />
            <line x1="44" y1="56" x2="56" y2="56" stroke={`url(#${gradId})`} strokeWidth="2.2" strokeLinecap="square" />

            {/* SECOND 'M' (Right - Interlocked & Crossing in Center) */}
            {/* Right M left stem down to base (intertwined with Left M) */}
            <line x1="47" y1="6" x2="47" y2="56" stroke={`url(#${gradId})`} strokeWidth="3" strokeLinecap="round" />
            <line x1="41" y1="56" x2="53" y2="56" stroke={`url(#${gradId})`} strokeWidth="2.2" strokeLinecap="square" />

            {/* Right M diagonal down to right apex */}
            <path
              d="M47 6 L65 50"
              stroke={`url(#${gradId})`}
              strokeWidth="4"
              strokeLinecap="round"
            />

            {/* Right M diagonal up to right top arch */}
            <path
              d="M65 50 L82 6"
              stroke={`url(#${gradId})`}
              strokeWidth="2.4"
              strokeLinecap="round"
            />

            {/* Right M right stem down to base with flared top horn */}
            <path
              d="M96 14 Q92 6 82 6 L82 56"
              stroke={`url(#${gradId})`}
              strokeWidth="3.2"
              strokeLinecap="round"
              fill="none"
            />
            {/* Right base serif */}
            <line x1="76" y1="56" x2="88" y2="56" stroke={`url(#${gradId})`} strokeWidth="2.2" strokeLinecap="square" />

            {/* Crossing center arch overlay to weave the two M's */}
            <path
              d="M38 6 Q48 2 54 8"
              stroke={`url(#${gradId})`}
              strokeWidth="3.2"
              strokeLinecap="round"
              fill="none"
            />
          </svg>
        )}
      </div>

      {/* Typography Lockup: MM CONCEPT on top, Mariane Moreira underneath */}
      {showText && (
        <div
          className={`flex flex-col justify-center leading-none ${
            orientation === 'vertical' ? 'items-center mt-1 text-center' : ''
          }`}
        >
          {/* Main Name: MM CONCEPT */}
          <div className="flex items-center gap-1">
            <span
              className={`font-serif tracking-[0.24em] font-semibold uppercase transition-colors ${
                size === 'xs' || size === 'sm'
                  ? 'text-sm sm:text-base'
                  : size === 'lg' || size === 'xl'
                  ? 'text-xl sm:text-2xl'
                  : 'text-base sm:text-lg'
              } ${isDark ? 'text-white' : 'text-[#1c1917]'}`}
            >
              MM CONCEPT
            </span>
          </div>

          {/* Underneath: Mariane Moreira */}
          <span
            className={`text-[9px] sm:text-[10px] tracking-[0.38em] uppercase font-light mt-1 transition-colors ${
              isDark ? 'text-[#e5c378]' : 'text-[#8e6e34]'
            }`}
          >
            Mariane Moreira
          </span>
        </div>
      )}
    </div>
  );
};
