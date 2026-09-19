import React, { useState } from 'react';
import { Download, Share, PlusSquare, X, CheckCircle2 } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

interface PWAInstallButtonProps {
  isLight?: boolean;
  variant?: 'button' | 'banner' | 'menu-item';
  className?: string;
}

export const PWAInstallButton: React.FC<PWAInstallButtonProps> = ({
  isLight = false,
  variant = 'button',
  className = '',
}) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);
  const [justInstalled, setJustInstalled] = useState(false);

  // If already installed and launched as standalone app
  if (isInstalled) {
    if (variant === 'menu-item') {
      return (
        <div className={`flex items-center justify-between p-3 rounded-xl border ${
          isLight ? 'bg-emerald-50 border-emerald-200 text-emerald-900' : 'bg-emerald-950/40 border-emerald-800/60 text-emerald-300'
        }`}>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            <span className="text-xs font-semibold">NumeriX is installed as a Desktop App</span>
          </div>
          <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-600">Active</span>
        </div>
      );
    }
    return null;
  }

  const handleInstallClick = async () => {
    if (isIOS) {
      setShowIOSGuide(true);
      return;
    }
    if (isInstallable) {
      const accepted = await install();
      if (accepted) {
        setJustInstalled(true);
        setTimeout(() => setJustInstalled(false), 3000);
      }
    } else {
      // In some desktop browsers where beforeinstallprompt hasn't fired yet or in preview iframe:
      setShowIOSGuide(true);
    }
  };

  if (variant === 'menu-item') {
    return (
      <>
        <div className={`p-4 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
          isLight ? 'bg-white border-stone-300 shadow-2xs' : 'bg-slate-900 border-slate-800'
        } ${className}`}>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Download className="w-4 h-4 text-cyan-500" />
              <h4 className={`text-xs font-bold ${isLight ? 'text-stone-900' : 'text-slate-100'}`}>
                Install NumeriX Desktop Application
              </h4>
            </div>
            <p className={`text-[11px] ${isLight ? 'text-stone-600' : 'text-slate-400'}`}>
              Runs in an independent borderless window, caches all assets locally, and launches 100% offline.
            </p>
          </div>
          <button
            id="settings-install-pwa-btn"
            onClick={handleInstallClick}
            className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs shadow-sm transition-all cursor-pointer shrink-0"
          >
            <Download className="w-3.5 h-3.5" />
            Install App
          </button>
        </div>

        {showIOSGuide && (
          <InstallInstructionsModal
            isLight={isLight}
            isIOS={isIOS}
            onClose={() => setShowIOSGuide(false)}
          />
        )}
      </>
    );
  }

  // Header compact button
  return (
    <>
      <button
        id="header-pwa-install-btn"
        onClick={handleInstallClick}
        title="Install NumeriX as a Native Desktop App (Works 100% Offline)"
        className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs font-bold transition-all cursor-pointer select-none ${
          justInstalled
            ? 'bg-emerald-600 text-white border-emerald-500'
            : isLight
            ? 'bg-white hover:bg-stone-100 border-stone-300 text-cyan-950 shadow-2xs hover:border-cyan-500'
            : 'bg-slate-800/90 hover:bg-slate-700 border-slate-700 text-cyan-300 hover:border-cyan-500'
        } ${className}`}
      >
        <Download className="w-3.5 h-3.5 text-cyan-500 shrink-0" />
        <span className="hidden sm:inline">Install App</span>
      </button>

      {showIOSGuide && (
        <InstallInstructionsModal
          isLight={isLight}
          isIOS={isIOS}
          onClose={() => setShowIOSGuide(false)}
        />
      )}
    </>
  );
};

interface InstallInstructionsModalProps {
  isLight: boolean;
  isIOS: boolean;
  onClose: () => void;
}

const InstallInstructionsModal: React.FC<InstallInstructionsModalProps> = ({
  isLight,
  isIOS,
  onClose,
}) => {
  return (
    <div
      id="pwa-install-guide-modal"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-fade-in"
      onClick={onClose}
    >
      <div
        className={`w-full max-w-md rounded-2xl border p-6 shadow-2xl transition-all ${
          isLight ? 'bg-white border-stone-300 text-stone-800' : 'bg-slate-900 border-slate-700 text-slate-100'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between pb-3 border-b border-slate-700/40 mb-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-500">
              <Download className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold tracking-tight">Install NumeriX</h3>
              <p className={`text-[11px] ${isLight ? 'text-stone-500' : 'text-slate-400'}`}>
                100% Offline Desktop & Mobile Support
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
              isLight
                ? 'hover:bg-stone-100 border-stone-200 text-stone-600'
                : 'hover:bg-slate-800 border-slate-700 text-slate-400'
            }`}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {isIOS ? (
          <div className="space-y-3 text-xs">
            <p className={isLight ? 'text-stone-700' : 'text-slate-300'}>
              To install NumeriX on your <strong>iPhone or iPad</strong>:
            </p>
            <ol className={`space-y-2.5 pl-1 ${isLight ? 'text-stone-600' : 'text-slate-300'}`}>
              <li className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-cyan-500/20 text-cyan-600 font-bold flex items-center justify-center text-[10px]">
                  1
                </span>
                <span>
                  Tap the <Share className="w-3.5 h-3.5 inline mx-1 text-cyan-500" /> <strong>Share</strong> button in Safari's bottom toolbar.
                </span>
              </li>
              <li className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-cyan-500/20 text-cyan-600 font-bold flex items-center justify-center text-[10px]">
                  2
                </span>
                <span>
                  Scroll down and tap <PlusSquare className="w-3.5 h-3.5 inline mx-1 text-cyan-500" /> <strong>Add to Home Screen</strong>.
                </span>
              </li>
              <li className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-cyan-500/20 text-cyan-600 font-bold flex items-center justify-center text-[10px]">
                  3
                </span>
                <span>Tap <strong>Add</strong> in the top-right corner to finish.</span>
              </li>
            </ol>
          </div>
        ) : (
          <div className="space-y-3 text-xs">
            <p className={isLight ? 'text-stone-700' : 'text-slate-300'}>
              To install on <strong>Windows, macOS, or Linux</strong>:
            </p>
            <ol className={`space-y-2.5 pl-1 ${isLight ? 'text-stone-600' : 'text-slate-300'}`}>
              <li className="flex items-start gap-2">
                <span className="w-5 h-5 rounded-full bg-cyan-500/20 text-cyan-600 font-bold flex items-center justify-center text-[10px] shrink-0 mt-0.5">
                  1
                </span>
                <span>
                  Look for the <Download className="w-3.5 h-3.5 inline mx-1 text-cyan-500" /> <strong>Install App</strong> icon in your browser's address bar (Chrome, Edge, Brave, or Safari).
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-5 h-5 rounded-full bg-cyan-500/20 text-cyan-600 font-bold flex items-center justify-center text-[10px] shrink-0 mt-0.5">
                  2
                </span>
                <span>
                  Click <strong>Install</strong> to add NumeriX to your desktop or applications folder.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-5 h-5 rounded-full bg-cyan-500/20 text-cyan-600 font-bold flex items-center justify-center text-[10px] shrink-0 mt-0.5">
                  3
                </span>
                <span>
                  Once installed, NumeriX launches instantly with full offline persistence even in airplane mode.
                </span>
              </li>
            </ol>
          </div>
        )}

        <button
          onClick={onClose}
          className={`mt-5 w-full py-2.5 rounded-xl font-bold text-xs transition-colors cursor-pointer ${
            isLight
              ? 'bg-stone-200 hover:bg-stone-300 text-stone-800'
              : 'bg-slate-800 hover:bg-slate-700 text-slate-200'
          }`}
        >
          Got it
        </button>
      </div>
    </div>
  );
};
