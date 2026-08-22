import React, { useEffect, useState, useRef } from 'react';
import { DateFormatType, AppTheme } from '../types';

interface AnalogClockProps {
  theme?: AppTheme;
  dateFormat?: DateFormatType;
}

export const AnalogClock: React.FC<AnalogClockProps> = ({ theme = 'dark', dateFormat = 'EU' }) => {
  const [time, setTime] = useState<{ hours: number; minutes: number; seconds: number; millis: number }>({
    hours: 0,
    minutes: 0,
    seconds: 0,
    millis: 0,
  });
  const [dateInfo, setDateInfo] = useState<{ dayName: string; dateStr: string }>({
    dayName: '',
    dateStr: '',
  });

  const animFrameRef = useRef<number | null>(null);

  useEffect(() => {
    const update = () => {
      const now = new Date();
      setTime({
        hours: now.getHours(),
        minutes: now.getMinutes(),
        seconds: now.getSeconds(),
        millis: now.getMilliseconds(),
      });

      // Format Day Name
      const dayName = now.toLocaleDateString('en-US', { weekday: 'long' }).toUpperCase();

      // Format Date based on setting
      let dateStr = '';
      if (dateFormat === 'ISO') {
        dateStr = now.toISOString().slice(0, 10);
      } else if (dateFormat === 'US') {
        const month = now.toLocaleDateString('en-US', { month: 'short' }).toUpperCase();
        dateStr = `${month} ${now.getDate()}, ${now.getFullYear()}`;
      } else {
        // EU default: 22 AUGUST 2026
        const month = now.toLocaleDateString('en-US', { month: 'long' }).toUpperCase();
        dateStr = `${now.getDate()} ${month} ${now.getFullYear()}`;
      }

      setDateInfo({ dayName, dateStr });

      animFrameRef.current = requestAnimationFrame(update);
    };

    animFrameRef.current = requestAnimationFrame(update);

    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [dateFormat]);

  // Precise angles with smooth fractions
  const totalSeconds = time.seconds + time.millis / 1000;
  const totalMinutes = time.minutes + totalSeconds / 60;
  const totalHours = (time.hours % 12) + totalMinutes / 60;

  const secondDeg = totalSeconds * 6; // 360 / 60
  const minuteDeg = totalMinutes * 6; // 360 / 60
  const hourDeg = totalHours * 30; // 360 / 12

  const isLight = theme === 'light';

  return (
    <div
      id="analog-clock-widget"
      className={`flex items-center gap-2.5 sm:gap-3.5 xl:gap-4 px-2.5 sm:px-3.5 xl:px-4 py-1.5 sm:py-2 xl:py-2.5 rounded-xl xl:rounded-2xl border transition-colors shrink-0 select-none ${
        isLight
          ? 'bg-white border-slate-300 text-slate-900 shadow-xs'
          : 'bg-slate-900/90 border-slate-800 text-slate-100 shadow-sm'
      }`}
    >
      {/* Date Information */}
      <div className="flex flex-col text-right pr-0.5 sm:pr-1 select-none">
        <span
          className={`text-[9px] sm:text-[10px] xl:text-xs font-bold tracking-widest ${
            isLight ? 'text-cyan-800' : 'text-cyan-400'
          }`}
        >
          {dateInfo.dayName || 'TODAY'}
        </span>
        <span
          className={`text-[11px] sm:text-xs xl:text-sm font-bold tracking-tight tabular-nums ${
            isLight ? 'text-slate-900' : 'text-slate-100'
          }`}
        >
          {dateInfo.dateStr}
        </span>
        <span
          className={`text-[9px] sm:text-[10px] xl:text-xs font-mono font-medium tabular-nums ${
            isLight ? 'text-slate-600' : 'text-slate-400'
          }`}
        >
          {String(time.hours).padStart(2, '0')}:{String(time.minutes).padStart(2, '0')}:{String(time.seconds).padStart(2, '0')}
        </span>
      </div>

      {/* Analog Clock Dial (SVG) with Clamp Sizing */}
      <div className="relative fluid-clock-dial-size shrink-0">
        <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-xs">
          {/* Bezel */}
          <circle
            cx="50"
            cy="50"
            r="47"
            fill={isLight ? '#FFFFFF' : '#0F172A'}
            stroke={isLight ? '#0891B2' : '#334155'}
            strokeWidth="3.5"
          />

          {/* Dial Markers */}
          {Array.from({ length: 12 }).map((_, i) => {
            const isQuarter = i % 3 === 0;
            return (
              <line
                key={i}
                x1="50"
                y1={isQuarter ? '9' : '11'}
                x2="50"
                y2={isQuarter ? '18' : '15'}
                stroke={
                  isQuarter
                    ? isLight
                      ? '#0F172A'
                      : '#F8FAFC'
                    : isLight
                    ? '#64748B'
                    : '#475569'
                }
                strokeWidth={isQuarter ? '2.5' : '1.2'}
                strokeLinecap="round"
                transform={`rotate(${i * 30} 50 50)`}
              />
            );
          })}

          {/* Hour Hand */}
          <line
            x1="50"
            y1="50"
            x2="50"
            y2="27"
            stroke={isLight ? '#0F172A' : '#F1F5F9'}
            strokeWidth="3.4"
            strokeLinecap="round"
            transform={`rotate(${hourDeg} 50 50)`}
          />

          {/* Minute Hand */}
          <line
            x1="50"
            y1="50"
            x2="50"
            y2="18"
            stroke={isLight ? '#0284C7' : '#38BDF8'}
            strokeWidth="2.4"
            strokeLinecap="round"
            transform={`rotate(${minuteDeg} 50 50)`}
          />

          {/* Smooth Second Hand */}
          <line
            x1="50"
            y1="56"
            x2="50"
            y2="14"
            stroke="#EF4444"
            strokeWidth="1.4"
            strokeLinecap="round"
            transform={`rotate(${secondDeg} 50 50)`}
          />

          {/* Center Pin & Cap */}
          <circle cx="50" cy="50" r="3.2" fill="#EF4444" />
          <circle cx="50" cy="50" r="1.4" fill="#FFFFFF" />
        </svg>
      </div>
    </div>
  );
};
