/**
 * Official NumeriX SVG String and High-Resolution PNG Data URLs for PDF, Canvas, and HTML Reports.
 */

// 1. Horizontal Header Logo (Emblem on Left + NUMERIX & WEB CALCULATOR on Right)
export const NUMERIX_HORIZONTAL_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 360 120" width="360" height="120" fill="none">
  <defs>
    <linearGradient id="nh-navy-grad" x1="10" y1="10" x2="60" y2="100" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#003566" />
      <stop offset="50%" stop-color="#005B96" />
      <stop offset="100%" stop-color="#03213B" />
    </linearGradient>
    <linearGradient id="nh-blue-curve" x1="20" y1="20" x2="60" y2="90" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#0077B6" />
      <stop offset="70%" stop-color="#004B7A" />
      <stop offset="100%" stop-color="#021C35" />
    </linearGradient>
    <linearGradient id="nh-orange-grad" x1="30" y1="100" x2="100" y2="10" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#00A896" />
      <stop offset="25%" stop-color="#028090" />
      <stop offset="50%" stop-color="#F77F00" />
      <stop offset="85%" stop-color="#FCBF49" />
      <stop offset="100%" stop-color="#FF9E00" />
    </linearGradient>
    <linearGradient id="nh-arrow-grad" x1="60" y1="60" x2="100" y2="10" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#F77F00" />
      <stop offset="50%" stop-color="#028090" />
      <stop offset="100%" stop-color="#00A896" />
    </linearGradient>
    <linearGradient id="nh-x-grad" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="#F77F00" />
      <stop offset="100%" stop-color="#00A896" />
    </linearGradient>
  </defs>

  <!-- Left Emblem Symbol -->
  <g transform="translate(10, 5) scale(0.55)">
    <!-- Navy Arm -->
    <path d="M 62 28 C 45 32, 32 48, 30 68 C 28 88, 44 108, 62 125 L 75 137 C 88 150, 94 164, 85 172 C 76 180, 58 174, 45 158 C 35 145, 30 125, 34 106 C 31 128, 38 152, 54 166 C 70 179, 92 175, 102 158 C 112 140, 98 118, 82 100 L 68 85 C 54 70, 50 54, 58 42 C 67 30, 84 34, 98 48 L 105 55 C 92 38, 78 24, 62 28 Z" fill="url(#nh-navy-grad)" />
    <path d="M 52 32 C 40 44, 38 62, 45 80 C 52 98, 68 114, 85 130 C 102 146, 118 160, 134 166 C 148 172, 160 164, 164 150 C 168 136, 158 122, 142 110 L 130 100 C 145 115, 155 130, 148 142 C 142 152, 128 152, 114 140 C 98 126, 82 108, 70 90 C 58 72, 52 54, 58 42 C 62 34, 68 30, 75 30 C 66 28, 58 28, 52 32 Z" fill="url(#nh-blue-curve)" />

    <!-- Orange & Teal Ascending Arrow -->
    <path d="M 65 168 C 80 176, 100 168, 115 150 C 130 132, 140 108, 152 85 L 170 48 L 184 58 L 186 14 L 142 20 L 155 33 L 138 66 C 128 86, 118 106, 106 122 C 94 138, 80 152, 65 168 Z" fill="url(#nh-orange-grad)" />
    <path d="M 186 14 L 142 20 L 155 33 L 172 30 L 148 75 L 162 68 L 186 14 Z" fill="url(#nh-arrow-grad)" />

    <!-- Math Symbols -->
    <rect x="25" y="75" width="18" height="6" rx="3" fill="#F77F00" />
    <rect x="31" y="69" width="6" height="18" rx="3" fill="#F77F00" />
    <circle cx="168" cy="64" r="3.2" fill="#00A896" />
    <rect x="157" y="75" width="22" height="6" rx="3" fill="#00A896" />
    <circle cx="168" cy="92" r="3.2" fill="#00A896" />
    <g transform="translate(170, 42) rotate(45)">
      <rect x="-8" y="-2" width="16" height="4" rx="2" fill="#F77F00" />
      <rect x="-2" y="-8" width="4" height="16" rx="2" fill="#F77F00" />
    </g>

    <!-- Center Vortex -->
    <polygon points="100,64 114,90 100,116 86,90" fill="#021C35" opacity="0.85" />
    <polygon points="100,68 110,90 100,112 90,90" fill="#003566" />
    <text x="94" y="80" font-size="7" fill="#64DFDF" font-family="sans-serif" font-weight="900">8</text>
    <text x="104" y="80" font-size="7" fill="#64DFDF" font-family="sans-serif" font-weight="900">3</text>
    <text x="98" y="93" font-size="8" fill="#F77F00" font-family="sans-serif" font-weight="900">3</text>
    <text x="98" y="105" font-size="7" fill="#64DFDF" font-family="sans-serif" font-weight="900">5</text>
    <text x="92" y="112" font-size="6" fill="#64DFDF" font-family="sans-serif" font-weight="900">7</text>
    <text x="104" y="112" font-size="6" fill="#64DFDF" font-family="sans-serif" font-weight="900">9</text>
  </g>

  <!-- Typography Right Side -->
  <g transform="translate(130, 0)">
    <text x="0" y="65" font-family="system-ui, -apple-system, sans-serif" font-weight="900" font-size="44" letter-spacing="3">
      <tspan fill="#002855">NUMERI</tspan><tspan fill="url(#nh-x-grad)">X</tspan>
    </text>
    <text x="2" y="92" font-family="system-ui, -apple-system, sans-serif" font-weight="700" font-size="14" letter-spacing="4" fill="#64748B">
      WEB CALCULATOR
    </text>
  </g>
</svg>`;

// 2. Stacked Logo
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

  <g transform="translate(100, 0)">
    <path d="M 62 28 C 45 32, 32 48, 30 68 C 28 88, 44 108, 62 125 L 75 137 C 88 150, 94 164, 85 172 C 76 180, 58 174, 45 158 C 35 145, 30 125, 34 106 C 31 128, 38 152, 54 166 C 70 179, 92 175, 102 158 C 112 140, 98 118, 82 100 L 68 85 C 54 70, 50 54, 58 42 C 67 30, 84 34, 98 48 L 105 55 C 92 38, 78 24, 62 28 Z" fill="url(#n-navy-grad)" />
    <path d="M 52 32 C 40 44, 38 62, 45 80 C 52 98, 68 114, 85 130 C 102 146, 118 160, 134 166 C 148 172, 160 164, 164 150 C 168 136, 158 122, 142 110 L 130 100 C 145 115, 155 130, 148 142 C 142 152, 128 152, 114 140 C 98 126, 82 108, 70 90 C 58 72, 52 54, 58 42 C 62 34, 68 30, 75 30 C 66 28, 58 28, 52 32 Z" fill="url(#n-blue-curve)" />

    <path d="M 65 168 C 80 176, 100 168, 115 150 C 130 132, 140 108, 152 85 L 170 48 L 184 58 L 186 14 L 142 20 L 155 33 L 138 66 C 128 86, 118 106, 106 122 C 94 138, 80 152, 65 168 Z" fill="url(#n-orange-grad)" />
    <path d="M 186 14 L 142 20 L 155 33 L 172 30 L 148 75 L 162 68 L 186 14 Z" fill="url(#n-arrow-grad)" />

    <rect x="25" y="75" width="18" height="6" rx="3" fill="#F77F00" />
    <rect x="31" y="69" width="6" height="18" rx="3" fill="#F77F00" />

    <circle cx="168" cy="64" r="3.2" fill="#00A896" />
    <rect x="157" y="75" width="22" height="6" rx="3" fill="#00A896" />
    <circle cx="168" cy="92" r="3.2" fill="#00A896" />

    <g transform="translate(170, 42) rotate(45)">
      <rect x="-8" y="-2" width="16" height="4" rx="2" fill="#F77F00" />
      <rect x="-2" y="-8" width="4" height="16" rx="2" fill="#F77F00" />
    </g>

    <polygon points="100,64 114,90 100,116 86,90" fill="#021C35" opacity="0.85" />
    <polygon points="100,68 110,90 100,112 90,90" fill="#003566" />
    <text x="94" y="80" font-size="7" fill="#64DFDF" font-family="sans-serif" font-weight="900">8</text>
    <text x="104" y="80" font-size="7" fill="#64DFDF" font-family="sans-serif" font-weight="900">3</text>
    <text x="98" y="93" font-size="8" fill="#F77F00" font-family="sans-serif" font-weight="900">3</text>
    <text x="98" y="105" font-size="7" fill="#64DFDF" font-family="sans-serif" font-weight="900">5</text>
    <text x="92" y="112" font-size="6" fill="#64DFDF" font-family="sans-serif" font-weight="900">7</text>
    <text x="104" y="112" font-size="6" fill="#64DFDF" font-family="sans-serif" font-weight="900">9</text>
  </g>

  <text x="200" y="210" text-anchor="middle" font-family="system-ui, -apple-system, sans-serif" font-weight="900" font-size="34" letter-spacing="4">
    <tspan fill="#002855">NUMERI</tspan><tspan fill="url(#n-x-grad)">X</tspan>
  </text>

  <text x="200" y="230" text-anchor="middle" font-family="system-ui, -apple-system, sans-serif" font-weight="700" font-size="11" letter-spacing="7" fill="#64748B">
    WEB CALCULATOR
  </text>
</svg>`;

export const NUMERIX_LOGO_DATA_URL = `data:image/svg+xml;utf8,${encodeURIComponent(NUMERIX_SVG_STRING)}`;
export const NUMERIX_HORIZONTAL_DATA_URL = `data:image/svg+xml;utf8,${encodeURIComponent(NUMERIX_HORIZONTAL_SVG)}`;

// 3. Compact Emblem
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

// Cached PNG Data URLs for instant synchronous PDF generation
let cachedHorizontalPng: string | null = null;
let cachedEmblemPng: string | null = null;

/**
 * Creates and caches a high-definition raster PNG Data URL for the horizontal NumeriX logo.
 * Guaranteed to be compatible with jsPDF's doc.addImage() without requiring SVG plugins.
 */
export function getNumerixHorizontalLogoPng(): string {
  if (cachedHorizontalPng) return cachedHorizontalPng;
  if (typeof document === 'undefined') return '';

  try {
    const canvas = document.createElement('canvas');
    const scale = 3; // 3x Retina resolution
    const width = 360;
    const height = 110;
    canvas.width = width * scale;
    canvas.height = height * scale;

    const ctx = canvas.getContext('2d');
    if (!ctx) return '';
    ctx.scale(scale, scale);

    // Render Crisp Vector Paths to Canvas
    // --- 1. Left Emblem ---
    ctx.save();
    ctx.translate(5, 5);
    ctx.scale(0.52, 0.52);

    // Left Navy loop
    const navyGrad = ctx.createLinearGradient(40, 20, 200, 180);
    navyGrad.addColorStop(0, '#003566');
    navyGrad.addColorStop(0.5, '#005B96');
    navyGrad.addColorStop(1, '#03213B');

    ctx.fillStyle = navyGrad;
    const navyPath = new Path2D(
      'M 62 28 C 45 32, 32 48, 30 68 C 28 88, 44 108, 62 125 L 75 137 C 88 150, 94 164, 85 172 C 76 180, 58 174, 45 158 C 35 145, 30 125, 34 106 C 31 128, 38 152, 54 166 C 70 179, 92 175, 102 158 C 112 140, 98 118, 82 100 L 68 85 C 54 70, 50 54, 58 42 C 67 30, 84 34, 98 48 L 105 55 C 92 38, 78 24, 62 28 Z'
    );
    ctx.fill(navyPath);

    // Blue curve
    const blueGrad = ctx.createLinearGradient(50, 30, 180, 170);
    blueGrad.addColorStop(0, '#0077B6');
    blueGrad.addColorStop(0.7, '#004B7A');
    blueGrad.addColorStop(1, '#021C35');
    ctx.fillStyle = blueGrad;
    const bluePath = new Path2D(
      'M 52 32 C 40 44, 38 62, 45 80 C 52 98, 68 114, 85 130 C 102 146, 118 160, 134 166 C 148 172, 160 164, 164 150 C 168 136, 158 122, 142 110 L 130 100 C 145 115, 155 130, 148 142 C 142 152, 128 152, 114 140 C 98 126, 82 108, 70 90 C 58 72, 52 54, 58 42 C 62 34, 68 30, 75 30 C 66 28, 58 28, 52 32 Z'
    );
    ctx.fill(bluePath);

    // Orange-Teal Arrow
    const orangeGrad = ctx.createLinearGradient(100, 180, 300, 20);
    orangeGrad.addColorStop(0, '#00A896');
    orangeGrad.addColorStop(0.25, '#028090');
    orangeGrad.addColorStop(0.5, '#F77F00');
    orangeGrad.addColorStop(0.85, '#FCBF49');
    orangeGrad.addColorStop(1, '#FF9E00');
    ctx.fillStyle = orangeGrad;
    const orangePath = new Path2D(
      'M 65 168 C 80 176, 100 168, 115 150 C 130 132, 140 108, 152 85 L 170 48 L 184 58 L 186 14 L 142 20 L 155 33 L 138 66 C 128 86, 118 106, 106 122 C 94 138, 80 152, 65 168 Z'
    );
    ctx.fill(orangePath);

    // Arrowhead highlight
    const arrowGrad = ctx.createLinearGradient(160, 100, 280, 10);
    arrowGrad.addColorStop(0, '#F77F00');
    arrowGrad.addColorStop(0.5, '#028090');
    arrowGrad.addColorStop(1, '#00A896');
    ctx.fillStyle = arrowGrad;
    const arrowPath = new Path2D('M 186 14 L 142 20 L 155 33 L 172 30 L 148 75 L 162 68 L 186 14 Z');
    ctx.fill(arrowPath);

    // Math symbols
    ctx.fillStyle = '#F77F00';
    ctx.fillRect(25, 75, 18, 6);
    ctx.fillRect(31, 69, 6, 18);

    ctx.fillStyle = '#00A896';
    ctx.beginPath();
    ctx.arc(168, 64, 3.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillRect(157, 75, 22, 6);
    ctx.beginPath();
    ctx.arc(168, 92, 3.5, 0, Math.PI * 2);
    ctx.fill();

    // Multiply Symbol
    ctx.save();
    ctx.translate(170, 42);
    ctx.rotate((45 * Math.PI) / 180);
    ctx.fillStyle = '#F77F00';
    ctx.fillRect(-8, -2, 16, 4);
    ctx.fillRect(-2, -8, 4, 16);
    ctx.restore();

    // Center Diamond Vortex
    ctx.fillStyle = '#003566';
    ctx.beginPath();
    ctx.moveTo(100, 68);
    ctx.lineTo(110, 90);
    ctx.lineTo(100, 112);
    ctx.lineTo(90, 90);
    ctx.closePath();
    ctx.fill();

    ctx.restore();

    // --- 2. Typography ---
    // "NUMERI"
    ctx.font = '900 42px system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = '#002855';
    ctx.fillText('NUMERI', 115, 46);

    // "X"
    const xOffset = 115 + ctx.measureText('NUMERI').width + 2;
    const xGrad = ctx.createLinearGradient(xOffset, 20, xOffset + 35, 70);
    xGrad.addColorStop(0, '#F77F00');
    xGrad.addColorStop(1, '#00A896');
    ctx.fillStyle = xGrad;
    ctx.fillText('X', xOffset, 46);

    // "WEB CALCULATOR"
    ctx.font = '700 13px system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    ctx.letterSpacing = '3px';
    ctx.fillStyle = '#64748B';
    ctx.fillText('WEB CALCULATOR', 118, 78);

    cachedHorizontalPng = canvas.toDataURL('image/png');
    return cachedHorizontalPng;
  } catch {
    return '';
  }
}

/**
 * Creates and caches a high-definition raster PNG Data URL for the square NumeriX emblem.
 */
export function getNumerixEmblemLogoPng(): string {
  if (cachedEmblemPng) return cachedEmblemPng;
  if (typeof document === 'undefined') return '';

  try {
    const canvas = document.createElement('canvas');
    const scale = 3;
    const size = 180;
    canvas.width = size * scale;
    canvas.height = size * scale;

    const ctx = canvas.getContext('2d');
    if (!ctx) return '';
    ctx.scale(scale, scale);

    ctx.save();
    ctx.translate(5, 5);
    ctx.scale(0.85, 0.85);

    const navyGrad = ctx.createLinearGradient(40, 20, 200, 180);
    navyGrad.addColorStop(0, '#003566');
    navyGrad.addColorStop(0.5, '#005B96');
    navyGrad.addColorStop(1, '#03213B');
    ctx.fillStyle = navyGrad;
    ctx.fill(
      new Path2D(
        'M 62 28 C 45 32, 32 48, 30 68 C 28 88, 44 108, 62 125 L 75 137 C 88 150, 94 164, 85 172 C 76 180, 58 174, 45 158 C 35 145, 30 125, 34 106 C 31 128, 38 152, 54 166 C 70 179, 92 175, 102 158 C 112 140, 98 118, 82 100 L 68 85 C 54 70, 50 54, 58 42 C 67 30, 84 34, 98 48 L 105 55 C 92 38, 78 24, 62 28 Z'
      )
    );

    const orangeGrad = ctx.createLinearGradient(100, 180, 300, 20);
    orangeGrad.addColorStop(0, '#00A896');
    orangeGrad.addColorStop(0.5, '#F77F00');
    orangeGrad.addColorStop(1, '#FF9E00');
    ctx.fillStyle = orangeGrad;
    ctx.fill(
      new Path2D(
        'M 65 168 C 80 176, 100 168, 115 150 C 130 132, 140 108, 152 85 L 170 48 L 184 58 L 186 14 L 142 20 L 155 33 L 138 66 C 128 86, 118 106, 106 122 C 94 138, 80 152, 65 168 Z'
      )
    );

    ctx.restore();

    cachedEmblemPng = canvas.toDataURL('image/png');
    return cachedEmblemPng;
  } catch {
    return '';
  }
}
