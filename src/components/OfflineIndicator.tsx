import React from 'react';
import { WifiOff } from 'lucide-react';
import { useOnlineStatus } from '../hooks/useOnlineStatus';

export const OfflineIndicator: React.FC = () => {
  const isOnline = useOnlineStatus();

  if (isOnline) return null;

  return (
    <div
      id="pwa-offline-banner"
      role="status"
      aria-live="polite"
      className="fixed bottom-11 left-4 z-40 flex items-center gap-2 rounded-xl bg-slate-900/95 text-emerald-400 px-3 py-2 text-xs font-semibold shadow-xl border border-emerald-500/40 backdrop-blur-md animate-fade-in"
    >
      <div className="relative flex items-center justify-center">
        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping absolute" />
        <span className="w-2 h-2 rounded-full bg-emerald-400" />
      </div>
      <WifiOff className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
      <span>100% Offline Mode — Working with local cache</span>
    </div>
  );
};
