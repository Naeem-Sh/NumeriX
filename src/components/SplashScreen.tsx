import React, { useEffect, useState } from 'react';
import { AppTheme } from '../types';

interface SplashScreenProps {
  onFinish?: () => void;
  durationMs?: number; // Default 1500ms (1.5 seconds)
  theme?: AppTheme;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({
  onFinish,
  durationMs = 1500,
  theme = 'dark',
}) => {
  const [phase, setPhase] = useState<'entering' | 'active' | 'exiting'>('entering');
  const [progress, setProgress] = useState(0);

  const isLight = theme === 'light';

  useEffect(() => {
    // 1. Enter immediately
    const enterTimer = setTimeout(() => {
      setPhase('active');
    }, 40);

    // 2. Animate progress smoothly over the duration
    const startTime = performance.now();
    let frameId: number;

    const updateProgress = (now: number) => {
      const elapsed = now - startTime;
      const p = Math.min(100, Math.round((elapsed / durationMs) * 100));
      setProgress(p);

      if (elapsed < durationMs) {
        frameId = requestAnimationFrame(updateProgress);
      }
    };
    frameId = requestAnimationFrame(updateProgress);

    // 3. Start exit fade at (durationMs - 220ms)
    const exitTimer = setTimeout(() => {
      setPhase('exiting');
    }, Math.max(0, durationMs - 220));

    // 4. Complete and unmount at durationMs
    const finishTimer = setTimeout(() => {
      if (onFinish) {
        onFinish();
      }
    }, durationMs);

    return () => {
      clearTimeout(enterTimer);
      clearTimeout(exitTimer);
      clearTimeout(finishTimer);
      cancelAnimationFrame(frameId);
    };
  }, [durationMs, onFinish]);

  const handleSkip = () => {
    setPhase('exiting');
    setTimeout(() => {
      if (onFinish) onFinish();
    }, 120);
  };

  return (
    <div
      onClick={handleSkip}
      role="banner"
      aria-label="NumeriX Splash Screen"
      className={`fixed inset-0 z-[99999] flex flex-col items-center justify-center select-none overflow-hidden cursor-pointer transition-all duration-300 ease-out ${
        isLight ? 'bg-[#e6e4df] text-stone-900' : 'bg-slate-950 text-slate-100'
      } ${
        phase === 'exiting' ? 'opacity-0 scale-[1.01] pointer-events-none' : 'opacity-100 scale-100'
      }`}
    >
      {/* Background Animated Gradient Aura - Calibrated to match App Theme */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {/* Ambient Top-Left Cyan Glow */}
        <div
          className={`absolute -top-32 -left-32 w-96 h-96 rounded-full blur-3xl transition-transform duration-1000 ${
            isLight ? 'bg-cyan-500/10' : 'bg-cyan-500/15'
          } ${phase === 'active' ? 'scale-125 opacity-100' : 'scale-90 opacity-40'}`}
        />
        {/* Ambient Bottom-Right Amber/Orange Glow */}
        <div
          className={`absolute -bottom-32 -right-32 w-96 h-96 rounded-full blur-3xl transition-transform duration-1000 ${
            isLight ? 'bg-amber-500/10' : 'bg-amber-500/15'
          } ${phase === 'active' ? 'scale-125 opacity-100' : 'scale-90 opacity-40'}`}
        />
        {/* Center Radial Core Glow */}
        <div
          className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full blur-2xl ${
            isLight
              ? 'bg-gradient-to-tr from-cyan-600/5 via-transparent to-amber-500/5'
              : 'bg-gradient-to-tr from-cyan-600/10 via-transparent to-amber-500/10'
          }`}
        />

        {/* Ambient subtle mathematical dot pattern */}
        <div
          className="absolute inset-0 opacity-[0.035]"
          style={{
            backgroundImage: isLight
              ? 'radial-gradient(circle at 1px 1px, #0f172a 1px, transparent 0)'
              : 'radial-gradient(circle at 1px 1px, #38bdf8 1px, transparent 0)',
            backgroundSize: '28px 28px',
          }}
        />
      </div>

      {/* Main Logo & Animated Elements */}
      <div className="relative z-10 flex flex-col items-center text-center px-4 max-w-sm">
        {/* Expanding Glowing Ring Behind Emblem */}
        <div className="relative flex items-center justify-center mb-6">
          <div
            className={`absolute w-32 h-32 rounded-full border transition-all duration-1000 ease-out ${
              isLight ? 'border-cyan-600/25' : 'border-cyan-500/30'
            } ${phase === 'active' ? 'scale-150 opacity-0' : 'scale-75 opacity-80'}`}
          />
          <div
            className={`absolute w-24 h-24 rounded-full blur-xl transition-all duration-700 ${
              isLight ? 'bg-cyan-500/10' : 'bg-cyan-400/10'
            } ${phase === 'active' ? 'scale-125 opacity-100' : 'scale-50 opacity-20'}`}
          />

          {/* Floating Orbiting Math Symbols */}
          <span
            className={`absolute -top-3 -right-3 font-mono text-sm font-black transition-all duration-700 ease-out ${
              isLight ? 'text-cyan-700' : 'text-cyan-400'
            } ${phase === 'active' ? 'translate-x-2 -translate-y-2 opacity-90' : 'translate-x-0 translate-y-0 opacity-0'}`}
          >
            +
          </span>
          <span
            className={`absolute -bottom-2 -left-4 font-mono text-base font-black transition-all duration-700 delay-75 ease-out ${
              isLight ? 'text-amber-700' : 'text-amber-400'
            } ${phase === 'active' ? '-translate-x-2 translate-y-2 opacity-90' : 'translate-x-0 translate-y-0 opacity-0'}`}
          >
            %
          </span>
          <span
            className={`absolute -top-2 -left-3 font-mono text-sm font-black transition-all duration-700 delay-100 ease-out ${
              isLight ? 'text-teal-700' : 'text-emerald-400'
            } ${phase === 'active' ? '-translate-x-2 -translate-y-2 opacity-90' : 'translate-x-0 translate-y-0 opacity-0'}`}
          >
            ×
          </span>
          <span
            className={`absolute -bottom-3 -right-4 font-mono text-sm font-black transition-all duration-700 delay-150 ease-out ${
              isLight ? 'text-cyan-800' : 'text-cyan-300'
            } ${phase === 'active' ? 'translate-x-3 translate-y-2 opacity-90' : 'translate-x-0 translate-y-0 opacity-0'}`}
          >
            ÷
          </span>

          {/* High-Resolution Vector NumeriX Emblem */}
          <div
            className={`relative transition-all duration-700 ease-out transform ${
              phase === 'active'
                ? isLight
                  ? 'scale-100 opacity-100 translate-y-0 drop-shadow-[0_4px_12px_rgba(0,0,0,0.12)]'
                  : 'scale-100 opacity-100 translate-y-0 drop-shadow-[0_0_25px_rgba(6,182,212,0.4)]'
                : 'scale-75 opacity-0 translate-y-4'
            }`}
          >
            <svg
              viewBox="0 0 200 200"
              width={100}
              height={100}
              className="shrink-0"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <defs>
                <linearGradient id="splash-navy-grad" x1="20" y1="20" x2="110" y2="180" gradientUnits="userSpaceOnUse">
                  <stop offset="0%" stopColor="#003566" />
                  <stop offset="40%" stopColor="#005B96" />
                  <stop offset="100%" stopColor="#03213B" />
                </linearGradient>

                <linearGradient id="splash-blue-curve" x1="40" y1="40" x2="100" y2="160" gradientUnits="userSpaceOnUse">
                  <stop offset="0%" stopColor="#0077B6" />
                  <stop offset="70%" stopColor="#004B7A" />
                  <stop offset="100%" stopColor="#021C35" />
                </linearGradient>

                <linearGradient id="splash-orange-grad" x1="60" y1="180" x2="180" y2="20" gradientUnits="userSpaceOnUse">
                  <stop offset="0%" stopColor="#00A896" />
                  <stop offset="25%" stopColor="#028090" />
                  <stop offset="45%" stopColor="#F77F00" />
                  <stop offset="85%" stopColor="#FCBF49" />
                  <stop offset="100%" stopColor="#FF9E00" />
                </linearGradient>

                <linearGradient id="splash-arrow-grad" x1="100" y1="100" x2="180" y2="20" gradientUnits="userSpaceOnUse">
                  <stop offset="0%" stopColor="#F77F00" />
                  <stop offset="50%" stopColor="#028090" />
                  <stop offset="100%" stopColor="#00A896" />
                </linearGradient>
              </defs>

              {/* 1. Left Navy Loop */}
              <path
                d="M 62 38 C 45 42, 32 58, 30 78 C 28 98, 44 118, 62 135 L 75 147 C 88 160, 94 174, 85 182 C 76 190, 58 184, 45 168 C 35 155, 30 135, 34 116 C 31 138, 38 162, 54 176 C 70 189, 92 185, 102 168 C 112 150, 98 128, 82 110 L 68 95 C 54 80, 50 64, 58 52 C 67 40, 84 44, 98 58 L 105 65 C 92 48, 78 34, 62 38 Z"
                fill="url(#splash-navy-grad)"
              />

              {/* 2. Blue Cross Stroke */}
              <path
                d="M 52 42 C 40 54, 38 72, 45 90 C 52 108, 68 124, 85 140 C 102 156, 118 170, 134 176 C 148 182, 160 174, 164 160 C 168 146, 158 132, 142 120 L 130 110 C 145 125, 155 140, 148 152 C 142 162, 128 162, 114 150 C 98 136, 82 118, 70 100 C 58 82, 52 64, 58 52 C 62 44, 68 40, 75 40 C 66 38, 58 38, 52 42 Z"
                fill="url(#splash-blue-curve)"
              />

              {/* 3. Orange & Teal Ascending Arrow */}
              <path
                d="M 65 178 C 80 186, 100 178, 115 160 C 130 142, 140 118, 152 95 L 170 58 L 184 68 L 186 24 L 142 30 L 155 43 L 138 76 C 128 96, 118 116, 106 132 C 94 148, 80 162, 65 178 Z"
                fill="url(#splash-orange-grad)"
              />

              {/* Arrowhead */}
              <path
                d="M 186 24 L 142 30 L 155 43 L 172 40 L 148 85 L 162 78 L 186 24 Z"
                fill="url(#splash-arrow-grad)"
              />

              {/* Math symbols */}
              <g>
                <rect x="25" y="85" width="18" height="6" rx="3" fill="#F77F00" />
                <rect x="31" y="79" width="6" height="18" rx="3" fill="#F77F00" />
              </g>
              <g>
                <circle cx="168" cy="74" r="3.2" fill="#00A896" />
                <rect x="157" y="85" width="22" height="6" rx="3" fill="#00A896" />
                <circle cx="168" cy="102" r="3.2" fill="#00A896" />
              </g>

              {/* Center Diamond Vortex */}
              <polygon points="100,74 114,100 100,126 86,100" fill="#021C35" opacity="0.85" />
              <polygon points="100,78 110,100 100,122 90,100" fill="#003566" />
              <text x="98" y="103" fontSize="8" fill="#F77F00" fontFamily="sans-serif" fontWeight="900">3</text>
            </svg>
          </div>
        </div>

        {/* Brand Name Typography */}
        <div
          className={`flex items-baseline tracking-widest font-black transition-all duration-700 delay-150 transform ${
            phase === 'active' ? 'translate-y-0 opacity-100' : 'translate-y-3 opacity-0'
          }`}
        >
          <span
            className={`text-3xl sm:text-4xl font-extrabold tracking-wider ${
              isLight ? 'text-[#002855]' : 'text-cyan-400'
            }`}
          >
            NUMERI
          </span>
          <span className="text-3xl sm:text-4xl text-transparent bg-clip-text bg-gradient-to-r from-[#F77F00] via-[#FCBF49] to-[#00A896] font-black tracking-wider ml-0.5">
            X
          </span>
        </div>

        {/* Subtitle / Category */}
        <p
          className={`text-[11px] sm:text-xs font-mono uppercase tracking-[0.3em] font-bold mt-2 transition-all duration-700 delay-200 transform ${
            isLight ? 'text-stone-600' : 'text-slate-400'
          } ${phase === 'active' ? 'translate-y-0 opacity-100' : 'translate-y-2 opacity-0'}`}
        >
          Web Calculator
        </p>

        {/* Precision Progress Bar (1.5-Second Indicator) */}
        <div
          className={`w-44 sm:w-52 h-1 rounded-full overflow-hidden mt-6 relative transition-all duration-500 delay-200 ${
            isLight ? 'bg-stone-300/80 shadow-inner' : 'bg-slate-800/90 shadow-inner'
          } ${phase === 'active' ? 'opacity-100' : 'opacity-0'}`}
        >
          <div
            className={`h-full rounded-full transition-all duration-100 ease-linear relative ${
              isLight
                ? 'bg-gradient-to-r from-cyan-600 via-teal-500 to-amber-500 shadow-[0_0_8px_rgba(8,145,178,0.4)]'
                : 'bg-gradient-to-r from-cyan-500 via-teal-400 to-amber-400 shadow-[0_0_10px_rgba(6,182,212,0.8)]'
            }`}
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Skip hint */}
        <span
          className={`text-[10px] font-mono mt-3 transition-opacity duration-500 delay-300 ${
            isLight ? 'text-stone-500' : 'text-slate-600'
          } ${phase === 'active' ? 'opacity-70' : 'opacity-0'}`}
        >
          Click to skip
        </span>
      </div>
    </div>
  );
};
