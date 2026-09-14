import React, { useState } from 'react';
import { usePWAInstall } from '../utils/usePWAInstall';
import { Download, Smartphone, CheckCircle, Sparkles } from 'lucide-react';
import { AppInstallModal } from './AppInstallModal';

export const PWAInstallButton: React.FC = () => {
  const { isInstallable, isInstalled, install } = usePWAInstall();
  const [showModal, setShowModal] = useState(false);

  // If already running as an installed standalone app:
  if (isInstalled) {
    return (
      <div 
        id="badge-standalone-active"
        title="Running as a standalone native app"
        className="hidden md:flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200 rounded-xl"
      >
        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
        <span>App Mode Active</span>
      </div>
    );
  }

  const handleClick = async () => {
    if (isInstallable) {
      const outcome = await install();
      if (outcome === 'accepted') return;
    }
    setShowModal(true);
  };

  return (
    <>
      <button
        id="btn-pwa-install"
        onClick={handleClick}
        title="Open or Install as Standalone App"
        className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-amber-950 bg-amber-100 hover:bg-amber-200 border border-amber-300 rounded-xl shadow-xs transition-all cursor-pointer"
      >
        <Download className="w-3.5 h-3.5 text-amber-700" />
        <span className="hidden sm:inline">Open as App</span>
        <span className="sm:hidden">App</span>
      </button>

      <AppInstallModal 
        isOpen={showModal} 
        onClose={() => setShowModal(false)} 
      />
    </>
  );
};
