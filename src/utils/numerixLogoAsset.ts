/**
 * Official NumeriX SVG String and Data URL for High-Resolution PDF, Canvas, and HTML Reports.
 */

export const NUMERIX_SVG_STRING = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 240" width="400" height="240" fill="none">
  <defs>
    <linearGradient id="n-navy-grad" x1="40" y1="20" x2="200" y2="180" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#003566" />
      <stop offset="50%" stop-color="#005B96" />
      <stop offset="100%" stop-color="#03213B" />
    </linearGradient>
    <linearGradient id="n-blue-curve" x1="50" y1="30" x2="180" y2="170" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#0077B6" />
      <stop offset="70%" stop-color="#004B7A" />
      <stop offset="100%" stop-color="#021C35" />
    </linearGradient>
    <linearGradient id="n-orange-grad" x1="100" y1="180" x2="300" y2="20" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#00A896" />
      <stop offset="25%" stop-color="#028090" />
      <stop offset="50%" stop-color="#F77F00" />
      <stop offset="85%" stop-color="#FCBF49" />
      <stop offset="100%" stop-color="#FF9E00" />
    </linearGradient>
    <linearGradient id="n-arrow-grad" x1="160" y1="100" x2="280" y2="10" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#F77F00" />
      <stop offset="50%" stop-color="#028090" />
      <stop offset="100%" stop-color="#00A896" />
    </linearGradient>
    <linearGradient id="n-x-grad" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#F77F00" />
      <stop offset="100%" stop-color="#00A896" />
    </linearGradient>
  </defs>

  <!-- Left Navy Loop / Arm -->
  <g transform="translate(100, 0)">
    <path d="M 62 28 C 45 32, 32 48, 30 68 C 28 88, 44 108, 62 125 L 75 137 C 88 150, 94 164, 85 172 C 76 180, 58 174, 45 158 C 35 145, 30 125, 34 106 C 31 128, 38 152, 54 166 C 70 179, 92 175, 102 158 C 112 140, 98 118, 82 100 L 68 85 C 54 70, 50 54, 58 42 C 67 30, 84 34, 98 48 L 105 55 C 92 38, 78 24, 62 28 Z" fill="url(#n-navy-grad)" />
    <path d="M 52 32 C 40 44, 38 62, 45 80 C 52 98, 68 114, 85 130 C 102 146, 118 160, 134 166 C 148 172, 160 164, 164 150 C 168 136, 158 122, 142 110 L 130 100 C 145 115, 155 130, 148 142 C 142 152, 128 152, 114 140 C 98 126, 82 108, 70 90 C 58 72, 52 54, 58 42 C 62 34, 68 30, 75 30 C 66 28, 58 28, 52 32 Z" fill="url(#n-blue-curve)" />

    <!-- Orange & Teal Dynamic Ascending Arrow Arm -->
    <path d="M 65 168 C 80 176, 100 168, 115 150 C 130 132, 140 108, 152 85 L 170 48 L 184 58 L 186 14 L 142 20 L 155 33 L 138 66 C 128 86, 118 106, 106 122 C 94 138, 80 152, 65 168 Z" fill="url(#n-orange-grad)" />
    <path d="M 186 14 L 142 20 L 155 33 L 172 30 L 148 75 L 162 68 L 186 14 Z" fill="url(#n-arrow-grad)" />

    <!-- Left Plus Symbol -->
    <rect x="25" y="75" width="18" height="6" rx="3" fill="#F77F00" />
    <rect x="31" y="69" width="6" height="18" rx="3" fill="#F77F00" />

    <!-- Right Divide Symbol -->
    <circle cx="168" cy="64" r="3.2" fill="#00A896" />
    <rect x="157" y="75" width="22" height="6" rx="3" fill="#00A896" />
    <circle cx="168" cy="92" r="3.2" fill="#00A896" />

    <!-- Top-Right Multiply Symbol -->
    <g transform="translate(170, 42) rotate(45)">
      <rect x="-8" y="-2" width="16" height="4" rx="2" fill="#F77F00" />
      <rect x="-2" y="-8" width="4" height="16" rx="2" fill="#F77F00" />
    </g>

    <!-- Center Diamond Vortex Numbers -->
    <polygon points="100,64 114,90 100,116 86,90" fill="#021C35" opacity="0.85" />
    <polygon points="100,68 110,90 100,112 90,90" fill="#003566" />
    <text x="94" y="80" font-size="7" fill="#64DFDF" font-family="sans-serif" font-weight="900">8</text>
    <text x="104" y="80" font-size="7" fill="#64DFDF" font-family="sans-serif" font-weight="900">3</text>
    <text x="98" y="93" font-size="8" fill="#F77F00" font-family="sans-serif" font-weight="900">3</text>
    <text x="98" y="105" font-size="7" fill="#64DFDF" font-family="sans-serif" font-weight="900">5</text>
    <text x="92" y="112" font-size="6" fill="#64DFDF" font-family="sans-serif" font-weight="900">7</text>
    <text x="104" y="112" font-size="6" fill="#64DFDF" font-family="sans-serif" font-weight="900">9</text>
  </g>

  <!-- Wordmark "NUMERIX" -->
  <text x="200" y="210" text-anchor="middle" font-family="system-ui, -apple-system, sans-serif" font-weight="900" font-size="34" letter-spacing="4">
    <tspan fill="#002855">NUMERI</tspan><tspan fill="url(#n-x-grad)">X</tspan>
  </text>

  <!-- Subtitle "ONLINE CALCULATOR" -->
  <text x="200" y="230" text-anchor="middle" font-family="system-ui, -apple-system, sans-serif" font-weight="700" font-size="11" letter-spacing="7" fill="#64748B">
    ONLINE CALCULATOR
  </text>
</svg>`;

export const NUMERIX_LOGO_DATA_URL = `data:image/svg+xml;utf8,${encodeURIComponent(NUMERIX_SVG_STRING)}`;

// A compact square version of the emblem for smaller icons and stamps
export const NUMERIX_EMBLEM_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="200" height="200" fill="none">
  <defs>
    <linearGradient id="e-navy" x1="20" y1="20" x2="110" y2="180" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#003566" />
      <stop offset="50%" stop-color="#005B96" />
      <stop offset="100%" stop-color="#03213B" />
    </linearGradient>
    <linearGradient id="e-orange" x1="60" y1="180" x2="180" y2="20" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#00A896" />
      <stop offset="35%" stop-color="#F77F00" />
      <stop offset="100%" stop-color="#FF9E00" />
    </linearGradient>
    <linearGradient id="e-arrow" x1="100" y1="100" x2="180" y2="20" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#F77F00" />
      <stop offset="100%" stop-color="#00A896" />
    </linearGradient>
  </defs>
  <path d="M 62 38 C 45 42, 32 58, 30 78 C 28 98, 44 118, 62 135 L 75 147 C 88 160, 94 174, 85 182 C 76 190, 58 184, 45 168 C 35 155, 30 135, 34 116 C 31 138, 38 162, 54 176 C 70 189, 92 185, 102 168 C 112 150, 98 128, 82 110 L 68 95 C 54 80, 50 64, 58 52 C 67 40, 84 44, 98 58 L 105 65 C 92 48, 78 34, 62 38 Z" fill="url(#e-navy)" />
  <path d="M 65 178 C 80 186, 100 178, 115 160 C 130 142, 140 118, 152 95 L 170 58 L 184 68 L 186 24 L 142 30 L 155 43 L 138 76 C 128 96, 118 116, 106 132 C 94 148, 80 162, 65 178 Z" fill="url(#e-orange)" />
  <path d="M 186 24 L 142 30 L 155 43 L 172 40 L 148 85 L 162 78 L 186 24 Z" fill="url(#e-arrow)" />
  <rect x="25" y="85" width="18" height="6" rx="3" fill="#F77F00" />
  <rect x="31" y="79" width="6" height="18" rx="3" fill="#F77F00" />
  <circle cx="168" cy="74" r="3.2" fill="#00A896" />
  <rect x="157" y="85" width="22" height="6" rx="3" fill="#00A896" />
  <circle cx="168" cy="102" r="3.2" fill="#00A896" />
</svg>`;

export const NUMERIX_EMBLEM_DATA_URL = `data:image/svg+xml;utf8,${encodeURIComponent(NUMERIX_EMBLEM_SVG)}`;
