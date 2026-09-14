import React, { useState } from 'react';
import { usePWAInstall } from '../utils/usePWAInstall';
import { Smartphone, Download, X, Zap } from 'lucide-react';

interface AppHeaderBannerProps {
  onOpenInstallModal: () => void;
}

export const AppHeaderBanner: React.FC<AppHeaderBannerProps> = ({ onOpenInstallModal }) => {
  const { isInstalled, isInstallable, install } = usePWAInstall();
  const [isDismissed, setIsDismissed] = useState(false);

  // If already running as an installed standalone app or user dismissed the bar, hide it
  if (isInstalled || isDismissed) {
    return null;
  }

  const handleQuickInstall = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isInstallable) {
      const res = await install();
      if (res === 'accepted') return;
    }
    onOpenInstallModal();
  };

  return (
    <div 
      id="app-mode-banner"
      className="bg-gradient-to-r from-amber-600 via-amber-500 to-amber-600 text-white px-3 sm:px-4 py-2 text-xs flex items-center justify-between shadow-xs z-30 transition-all border-b border-amber-700/20"
    >
      <div className="flex items-center gap-2 overflow-hidden mr-2">
        <div className="p-1 rounded-md bg-white/20 shrink-0">
          <Smartphone className="w-3.5 h-3.5 text-white" />
        </div>
        <div className="truncate">
          <span className="font-bold mr-1.5">Open as App:</span>
          <span className="text-amber-100 hidden sm:inline">
            Launch directly without website tabs or address bars.
          </span>
          <span className="text-amber-100 sm:hidden">
            Install for full app mode.
          </span>
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        <button
          id="btn-banner-install-app"
          onClick={handleQuickInstall}
          className="flex items-center gap-1.5 bg-white text-amber-900 hover:bg-amber-50 font-bold px-3 py-1 rounded-lg text-xs shadow-xs transition-colors cursor-pointer"
        >
          <Download className="w-3 h-3 text-amber-600" />
          <span>{isInstallable ? 'Install App' : 'Open as App'}</span>
        </button>
        <button
          id="btn-dismiss-app-banner"
          onClick={() => setIsDismissed(true)}
          title="Dismiss banner"
          className="p-1 text-white/80 hover:text-white rounded-md hover:bg-white/10 transition cursor-pointer"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
