import React, { useEffect, useState } from 'react';
import { DateFormatType, AppTheme } from '../types';
import { Clock } from 'lucide-react';

interface AnalogClockProps {
  theme?: AppTheme;
  dateFormat?: DateFormatType;
}

export const AnalogClock: React.FC<AnalogClockProps> = ({ theme = 'dark', dateFormat = 'ISO' }) => {
  const [timeStr, setTimeStr] = useState<string>('');
  const [dateStr, setDateStr] = useState<string>('');

  useEffect(() => {
    const update = () => {
      const now = new Date();
      const hours = String(now.getHours()).padStart(2, '0');
      const minutes = String(now.getMinutes()).padStart(2, '0');
      const seconds = String(now.getSeconds()).padStart(2, '0');
      setTimeStr(`${hours}:${minutes}:${seconds}`);

      // Format date based on setting
      if (dateFormat === 'ISO') {
        setDateStr(now.toISOString().slice(0, 10));
      } else if (dateFormat === 'US') {
        const month = now.toLocaleDateString('en-US', { month: 'short' }).toUpperCase();
        setDateStr(`${month} ${now.getDate()}, ${now.getFullYear()}`);
      } else {
        // EU default: 9 SEP 2026
        const month = now.toLocaleDateString('en-US', { month: 'short' }).toUpperCase();
        setDateStr(`${now.getDate()} ${month} ${now.getFullYear()}`);
      }
    };

    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, [dateFormat]);

  const isLight = theme === 'light';

  return (
    <div
      id="digital-clock-chip"
      title={`Live System Clock (${dateStr} ${timeStr})`}
      className={`flex items-center gap-2 px-2.5 py-1.5 rounded-lg border text-xs font-mono transition-colors shrink-0 select-none ${
        isLight
          ? 'bg-white border-slate-200/90 text-slate-700 shadow-2xs'
          : 'bg-slate-800/80 border-slate-700/80 text-slate-300'
      }`}
    >
      <Clock className={`w-3.5 h-3.5 shrink-0 ${isLight ? 'text-cyan-700' : 'text-cyan-400'}`} />
      <span className="font-bold tabular-nums tracking-tight">{timeStr || '--:--:--'}</span>
      <span className={`text-[10px] ${isLight ? 'text-slate-300' : 'text-slate-600'}`}>|</span>
      <span className={`text-[11px] font-medium font-sans tracking-tight hidden sm:inline ${
        isLight ? 'text-slate-600' : 'text-slate-400'
      }`}>
        {dateStr}
      </span>
    </div>
  );
};

