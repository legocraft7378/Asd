import React from 'react';
import { usePWAInstall } from '../utils/usePWAInstall';
import { 
  X, 
  Download, 
  Share, 
  PlusSquare, 
  Maximize2, 
  Minimize2, 
  Smartphone, 
  Monitor, 
  CheckCircle2, 
  ExternalLink,
  Sparkles,
  Zap
} from 'lucide-react';

interface AppInstallModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AppInstallModal: React.FC<AppInstallModalProps> = ({ isOpen, onClose }) => {
  const { 
    isInstallable, 
    isInstalled, 
    platform, 
    install, 
    isFullscreen, 
    toggleFullscreen 
  } = usePWAInstall();

  if (!isOpen) return null;

  const handleInstallClick = async () => {
    const result = await install();
    if (result === 'accepted') {
      onClose();
    }
  };

  return (
    <div 
      id="app-install-modal"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 sm:p-6"
    >
      <div 
        className="w-full max-w-lg rounded-2xl bg-white shadow-2xl border border-stone-200 overflow-hidden text-stone-900 flex flex-col max-h-[90vh]"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-amber-600 via-amber-500 to-amber-600 px-6 py-5 text-white flex items-start justify-between">
          <div className="flex items-center gap-3.5">
            <img 
              src="/pwa-192x192.png" 
              alt="App Icon" 
              className="w-12 h-12 rounded-xl shadow-md border-2 border-white/40 bg-white"
            />
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold">100 Recipes App</h3>
                <span className="text-[10px] uppercase tracking-wider bg-white/20 text-white font-bold px-2 py-0.5 rounded-full">
                  PWA
                </span>
              </div>
              <p className="text-xs text-amber-100 mt-0.5">
                Launch as an independent app — no browser website bars
              </p>
            </div>
          </div>
          <button
            id="btn-close-install-modal"
            onClick={onClose}
            className="text-white/80 hover:text-white p-1 rounded-lg hover:bg-white/10 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-5">
          {/* Status Message */}
          {isInstalled ? (
            <div className="flex items-center gap-3 bg-emerald-50 border border-emerald-200 text-emerald-800 p-4 rounded-xl">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              <div className="text-xs">
                <strong className="block font-semibold text-emerald-900">App Mode is already active!</strong>
                You are currently running the installed standalone application.
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Direct 1-Click Install Button (When browser supports native prompt) */}
              {isInstallable && (
                <div className="bg-amber-50 border border-amber-200 p-4 rounded-xl text-center space-y-3">
                  <div className="flex items-center justify-center gap-2 text-amber-900 font-bold text-sm">
                    <Zap className="w-4 h-4 text-amber-600" />
                    <span>Instant 1-Click App Installation</span>
                  </div>
                  <p className="text-xs text-amber-800">
                    Your device supports immediate app installation to your home screen or application launcher.
                  </p>
                  <button
                    id="btn-trigger-direct-install"
                    onClick={handleInstallClick}
                    className="w-full flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-sm shadow-md transition-all cursor-pointer"
                  >
                    <Download className="w-4 h-4" />
                    <span>Install & Launch App</span>
                  </button>
                </div>
              )}

              {/* Platform Specific Instructions */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-stone-500 flex items-center gap-1.5">
                  {platform === 'ios' && <Smartphone className="w-3.5 h-3.5 text-amber-600" />}
                  {platform === 'android' && <Smartphone className="w-3.5 h-3.5 text-amber-600" />}
                  {platform === 'desktop' && <Monitor className="w-3.5 h-3.5 text-amber-600" />}
                  <span>Installation Guide for {platform === 'ios' ? 'iOS (iPhone / iPad)' : platform === 'android' ? 'Android Device' : 'Desktop (Chrome / Edge / Mac)'}</span>
                </h4>

                {platform === 'ios' ? (
                  <div className="space-y-2.5 text-xs text-stone-600">
                    <div className="flex items-start gap-3 bg-stone-50 border border-stone-200 p-3 rounded-xl">
                      <span className="w-6 h-6 rounded-full bg-amber-100 text-amber-900 font-bold flex items-center justify-center shrink-0 text-xs">
                        1
                      </span>
                      <div>
                        In <strong>Safari</strong>, tap the <strong className="text-stone-900 inline-flex items-center gap-1"><Share className="w-3 h-3 text-blue-600 inline" /> Share</strong> button in the browser toolbar.
                      </div>
                    </div>
                    <div className="flex items-start gap-3 bg-stone-50 border border-stone-200 p-3 rounded-xl">
                      <span className="w-6 h-6 rounded-full bg-amber-100 text-amber-900 font-bold flex items-center justify-center shrink-0 text-xs">
                        2
                      </span>
                      <div>
                        Scroll down and tap <strong className="text-stone-900 inline-flex items-center gap-1"><PlusSquare className="w-3 h-3 text-stone-700 inline" /> Add to Home Screen</strong>.
                      </div>
                    </div>
                    <div className="flex items-start gap-3 bg-stone-50 border border-stone-200 p-3 rounded-xl">
                      <span className="w-6 h-6 rounded-full bg-amber-100 text-amber-900 font-bold flex items-center justify-center shrink-0 text-xs">
                        3
                      </span>
                      <div>
                        Tap the newly added <strong>100 Recipes</strong> icon on your home screen. It will open full-screen without any Safari URL bar or website tabs!
                      </div>
                    </div>
                  </div>
                ) : platform === 'android' ? (
                  <div className="space-y-2.5 text-xs text-stone-600">
                    <div className="flex items-start gap-3 bg-stone-50 border border-stone-200 p-3 rounded-xl">
                      <span className="w-6 h-6 rounded-full bg-amber-100 text-amber-900 font-bold flex items-center justify-center shrink-0 text-xs">
                        1
                      </span>
                      <div>
                        Tap the browser menu (<strong>⋮</strong> three dots in top right).
                      </div>
                    </div>
                    <div className="flex items-start gap-3 bg-stone-50 border border-stone-200 p-3 rounded-xl">
                      <span className="w-6 h-6 rounded-full bg-amber-100 text-amber-900 font-bold flex items-center justify-center shrink-0 text-xs">
                        2
                      </span>
                      <div>
                        Select <strong className="text-stone-900">Install app</strong> or <strong className="text-stone-900">Add to Home screen</strong>.
                      </div>
                    </div>
                    <div className="flex items-start gap-3 bg-stone-50 border border-stone-200 p-3 rounded-xl">
                      <span className="w-6 h-6 rounded-full bg-amber-100 text-amber-900 font-bold flex items-center justify-center shrink-0 text-xs">
                        3
                      </span>
                      <div>
                        Launch directly from your Android App Drawer as a native standalone app!
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2.5 text-xs text-stone-600">
                    <div className="flex items-start gap-3 bg-stone-50 border border-stone-200 p-3 rounded-xl">
                      <span className="w-6 h-6 rounded-full bg-amber-100 text-amber-900 font-bold flex items-center justify-center shrink-0 text-xs">
                        1
                      </span>
                      <div>
                        Look at the right side of your browser address bar for the <strong className="text-stone-900">Install icon</strong> (computer monitor with download arrow).
                      </div>
                    </div>
                    <div className="flex items-start gap-3 bg-stone-50 border border-stone-200 p-3 rounded-xl">
                      <span className="w-6 h-6 rounded-full bg-amber-100 text-amber-900 font-bold flex items-center justify-center shrink-0 text-xs">
                        2
                      </span>
                      <div>
                        Click <strong>Install</strong> to add 100 Recipes to your desktop or taskbar/dock.
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Instant Fullscreen Native App Mode Toggle */}
              <div className="pt-2 border-t border-stone-200">
                <div className="bg-stone-50 border border-stone-200 rounded-xl p-3.5 flex items-center justify-between gap-3">
                  <div className="text-xs">
                    <span className="font-semibold text-stone-900 block">Instant Fullscreen App View</span>
                    <span className="text-stone-500">Hide browser chrome immediately in current window</span>
                  </div>
                  <button
                    id="btn-toggle-fullscreen-app"
                    onClick={toggleFullscreen}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-stone-200 hover:bg-stone-300 text-stone-800 text-xs font-semibold transition cursor-pointer"
                  >
                    {isFullscreen ? (
                      <>
                        <Minimize2 className="w-3.5 h-3.5" />
                        <span>Exit Fullscreen</span>
                      </>
                    ) : (
                      <>
                        <Maximize2 className="w-3.5 h-3.5 text-amber-600" />
                        <span>Enter Fullscreen</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Features Highlights */}
          <div className="grid grid-cols-2 gap-2 text-xs text-stone-600 pt-2 border-t border-stone-100">
            <div className="flex items-center gap-2 p-2 rounded-lg bg-stone-50 border border-stone-100">
              <Sparkles className="w-3.5 h-3.5 text-amber-600 shrink-0" />
              <span>Full Offline Access</span>
            </div>
            <div className="flex items-center gap-2 p-2 rounded-lg bg-stone-50 border border-stone-100">
              <Zap className="w-3.5 h-3.5 text-amber-600 shrink-0" />
              <span>Instant Launch Speed</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-stone-50 border-t border-stone-200 flex justify-end">
          <button
            id="btn-dismiss-app-modal"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-stone-200 hover:bg-stone-300 text-stone-800 text-xs font-bold transition cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
