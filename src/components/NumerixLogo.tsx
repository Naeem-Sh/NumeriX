import React from 'react';

interface NumerixLogoProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'full' | 'icon' | 'horizontal';
  isLight?: boolean;
  className?: string;
}

export const NumerixLogo: React.FC<NumerixLogoProps> = ({
  size = 'md',
  variant = 'full',
  isLight = false,
  className = '',
}) => {
  const sizeMap = {
    xs: { icon: 36, text: 'text-sm', subtext: 'text-[9px]', height: 38 },
    sm: { icon: 51, text: 'text-lg', subtext: 'text-[11px]', height: 52 },
    md: { icon: 66, text: 'text-2xl', subtext: 'text-xs', height: 68 },
    lg: { icon: 96, text: 'text-3xl', subtext: 'text-sm', height: 100 },
    xl: { icon: 144, text: 'text-5xl', subtext: 'text-base', height: 150 },
  };

  const currentSize = sizeMap[size];

  // The NumeriX SVG Emblem Symbol
  const EmblemSvg = (
    <svg
      viewBox="0 0 200 200"
      width={currentSize.icon}
      height={currentSize.icon}
      className="shrink-0 drop-shadow-sm"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        {/* Navy Blue Gradient */}
        <linearGradient id="numerix-navy-grad" x1="20" y1="20" x2="110" y2="180" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#003566" />
          <stop offset="40%" stopColor="#005B96" />
          <stop offset="100%" stopColor="#03213B" />
        </linearGradient>

        {/* Navy Blue Light Curve */}
        <linearGradient id="numerix-blue-curve" x1="40" y1="40" x2="100" y2="160" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#0077B6" />
          <stop offset="70%" stopColor="#004B7A" />
          <stop offset="100%" stopColor="#021C35" />
        </linearGradient>

        {/* Orange to Teal Arrow Gradient */}
        <linearGradient id="numerix-orange-grad" x1="60" y1="180" x2="180" y2="20" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#00A896" />
          <stop offset="25%" stopColor="#028090" />
          <stop offset="45%" stopColor="#F77F00" />
          <stop offset="85%" stopColor="#FCBF49" />
          <stop offset="100%" stopColor="#FF9E00" />
        </linearGradient>

        <linearGradient id="numerix-arrow-grad" x1="100" y1="100" x2="180" y2="20" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#F77F00" />
          <stop offset="50%" stopColor="#028090" />
          <stop offset="100%" stopColor="#00A896" />
        </linearGradient>

        <filter id="numerix-glow" x="-10%" y="-10%" width="120%" height="120%" filterUnits="userSpaceOnUse">
          <feDropShadow dx="0" dy="2" stdDeviation="2" floodOpacity="0.25" />
        </filter>
      </defs>

      {/* Main Stylized "X" Graphic */}
      {/* 1. Left Navy Loop / Arm */}
      <path
        d="M 62 38 C 45 42, 32 58, 30 78 C 28 98, 44 118, 62 135 L 75 147 C 88 160, 94 174, 85 182 C 76 190, 58 184, 45 168 C 35 155, 30 135, 34 116 C 31 138, 38 162, 54 176 C 70 189, 92 185, 102 168 C 112 150, 98 128, 82 110 L 68 95 C 54 80, 50 64, 58 52 C 67 40, 84 44, 98 58 L 105 65 C 92 48, 78 34, 62 38 Z"
        fill="url(#numerix-navy-grad)"
        filter="url(#numerix-glow)"
      />

      {/* 2. Top-Left to Bottom-Right Blue Stroke */}
      <path
        d="M 52 42 C 40 54, 38 72, 45 90 C 52 108, 68 124, 85 140 C 102 156, 118 170, 134 176 C 148 182, 160 174, 164 160 C 168 146, 158 132, 142 120 L 130 110 C 145 125, 155 140, 148 152 C 142 162, 128 162, 114 150 C 98 136, 82 118, 70 100 C 58 82, 52 64, 58 52 C 62 44, 68 40, 75 40 C 66 38, 58 38, 52 42 Z"
        fill="url(#numerix-blue-curve)"
      />

      {/* 3. Orange & Teal Dynamic Ascending Arrow Arm */}
      <path
        d="M 65 178 C 80 186, 100 178, 115 160 C 130 142, 140 118, 152 95 L 170 58 L 184 68 L 186 24 L 142 30 L 155 43 L 138 76 C 128 96, 118 116, 106 132 C 94 148, 80 162, 65 178 Z"
        fill="url(#numerix-orange-grad)"
        filter="url(#numerix-glow)"
      />

      {/* Arrowhead Highlight */}
      <path
        d="M 186 24 L 142 30 L 155 43 L 172 40 L 148 85 L 162 78 L 186 24 Z"
        fill="url(#numerix-arrow-grad)"
      />

      {/* 4. Left Orange Math Symbol (+ Plus) */}
      <g filter="url(#numerix-glow)">
        <rect x="25" y="85" width="18" height="6" rx="3" fill="#F77F00" />
        <rect x="31" y="79" width="6" height="18" rx="3" fill="#F77F00" />
      </g>

      {/* 5. Right Orange/Teal Math Symbol (÷ Divide) */}
      <g filter="url(#numerix-glow)">
        <circle cx="168" cy="74" r="3.2" fill="#00A896" />
        <rect x="157" y="85" width="22" height="6" rx="3" fill="#00A896" />
        <circle cx="168" cy="102" r="3.2" fill="#00A896" />
      </g>

      {/* 6. Top-Right Math Symbol (× Multiply) */}
      <g transform="translate(170, 52) rotate(45)">
        <rect x="-8" y="-2" width="16" height="4" rx="2" fill="#F77F00" />
        <rect x="-2" y="-8" width="4" height="16" rx="2" fill="#F77F00" />
      </g>

      {/* 7. Center Diamond Vortex & Numeric Digits (8, 3, 5, 7, 9) */}
      <polygon points="100,74 114,100 100,126 86,100" fill="#021C35" opacity="0.85" />
      <polygon points="100,78 110,100 100,122 90,100" fill="#003566" />
      <text x="94" y="90" fontSize="7" fill="#64DFDF" fontFamily="sans-serif" fontWeight="900">8</text>
      <text x="104" y="90" fontSize="7" fill="#64DFDF" fontFamily="sans-serif" fontWeight="900">3</text>
      <text x="98" y="103" fontSize="8" fill="#F77F00" fontFamily="sans-serif" fontWeight="900">3</text>
      <text x="98" y="115" fontSize="7" fill="#64DFDF" fontFamily="sans-serif" fontWeight="900">5</text>
      <text x="92" y="122" fontSize="6" fill="#64DFDF" fontFamily="sans-serif" fontWeight="900">7</text>
      <text x="104" y="122" fontSize="6" fill="#64DFDF" fontFamily="sans-serif" fontWeight="900">9</text>
    </svg>
  );

  if (variant === 'icon') {
    return (
      <div className={`inline-flex items-center justify-center ${className}`}>
        {EmblemSvg}
      </div>
    );
  }

  if (variant === 'horizontal') {
    return (
      <div className={`inline-flex items-center gap-2.5 select-none ${className}`}>
        {EmblemSvg}
        <div className="flex flex-col justify-center leading-tight">
          <div className="flex items-baseline tracking-tight font-black font-sans">
            <span
              className={`tracking-wider ${
                isLight ? 'text-[#002855]' : 'text-cyan-400'
              } ${currentSize.text}`}
            >
              NUMERI
            </span>
            <span
              className={`tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-[#F77F00] to-[#00A896] ${currentSize.text}`}
            >
              X
            </span>
          </div>
          <span
            className={`font-sans tracking-[0.22em] uppercase font-bold ${
              isLight ? 'text-slate-500' : 'text-slate-400'
            } ${currentSize.subtext}`}
          >
            ONLINE CALCULATOR
          </span>
        </div>
      </div>
    );
  }

  // Default 'full' stacked layout
  return (
    <div className={`inline-flex flex-col items-center select-none text-center ${className}`}>
      {EmblemSvg}
      <div className="mt-1.5 flex flex-col items-center leading-none">
        <div className="flex items-baseline tracking-tight font-black font-sans">
          <span
            className={`tracking-wider ${
              isLight ? 'text-[#002855]' : 'text-cyan-400'
            } ${currentSize.text}`}
          >
            NUMERI
          </span>
          <span
            className={`tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-[#F77F00] to-[#00A896] ${currentSize.text}`}
          >
            X
          </span>
        </div>
        <span
          className={`font-sans tracking-[0.24em] uppercase font-bold mt-0.5 ${
            isLight ? 'text-slate-500' : 'text-slate-400'
          } ${currentSize.subtext}`}
        >
          ONLINE CALCULATOR
        </span>
      </div>
    </div>
  );
};
