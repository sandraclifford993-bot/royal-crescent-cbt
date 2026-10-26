/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Download, Smartphone, X } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

export const PWAInstallButton: React.FC<{ compact?: boolean }> = ({ compact = false }) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  // If already running as an installed PWA, do not display
  if (isInstalled) {
    return (
      <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-semibold border border-emerald-300">
        <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse"></span>
        Installed Offline App
      </div>
    );
  }

  // Android / Desktop Chromium Flow
  if (isInstallable) {
    return (
      <button
        onClick={install}
        className={`flex items-center gap-2 rounded-xl bg-[#166534] hover:bg-[#14532D] text-[#FEF9C3] font-bold shadow-md hover:shadow-lg transition-all active:scale-95 border-2 border-[#86EFAC] ${
          compact ? 'px-3 py-1.5 text-xs' : 'px-4 py-2.5 text-sm'
        }`}
        title="Install Royal Cresent CBT Centre as an offline app"
      >
        <Download className="w-4 h-4 text-[#86EFAC]" />
        <span>Install Offline App</span>
      </button>
    );
  }

  // iOS Safari Flow
  if (isIOS) {
    return (
      <>
        <button
          onClick={() => setShowIOSGuide(true)}
          className={`flex items-center gap-2 rounded-xl bg-[#166534] hover:bg-[#14532D] text-[#FEF9C3] font-bold shadow-md transition-all active:scale-95 border border-[#86EFAC]/40 ${
            compact ? 'px-3 py-1.5 text-xs' : 'px-4 py-2.5 text-sm'
          }`}
        >
          <Smartphone className="w-4 h-4 text-[#86EFAC]" />
          <span>Install on iPhone/iPad</span>
        </button>

        {showIOSGuide && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in">
            <div className="w-full max-w-sm rounded-2xl bg-[#FFFDF5] border-2 border-[#166534] p-6 shadow-2xl text-[#14532D]">
              <div className="flex items-center justify-between pb-3 border-b border-[#86EFAC]/40">
                <div className="flex items-center gap-2 font-bold text-lg text-[#14532D]">
                  <Smartphone className="w-5 h-5 text-[#166534]" />
                  Install on iOS Safari
                </div>
                <button
                  onClick={() => setShowIOSGuide(false)}
                  className="p-1 rounded-full hover:bg-black/5 text-[#166534]"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="mt-4 space-y-3 text-sm text-[#14532D]/90">
                <div className="flex items-start gap-3 bg-white p-3 rounded-xl border border-[#86EFAC]/40">
                  <span className="flex items-center justify-center w-6 h-6 rounded-full bg-[#166534] text-white font-bold text-xs shrink-0">1</span>
                  <span>Tap the <strong>Share</strong> button <span className="inline-block px-1.5 py-0.5 bg-gray-100 rounded text-xs">⎋</span> at the bottom of Safari.</span>
                </div>
                <div className="flex items-start gap-3 bg-white p-3 rounded-xl border border-[#86EFAC]/40">
                  <span className="flex items-center justify-center w-6 h-6 rounded-full bg-[#166534] text-white font-bold text-xs shrink-0">2</span>
                  <span>Scroll down and tap <strong>Add to Home Screen</strong>.</span>
                </div>
                <div className="flex items-start gap-3 bg-white p-3 rounded-xl border border-[#86EFAC]/40">
                  <span className="flex items-center justify-center w-6 h-6 rounded-full bg-[#166534] text-white font-bold text-xs shrink-0">3</span>
                  <span>Open from your Home Screen for full offline test taking!</span>
                </div>
              </div>

              <button
                onClick={() => setShowIOSGuide(false)}
                className="mt-5 w-full py-2.5 rounded-xl bg-[#166534] hover:bg-[#14532D] text-white font-bold text-sm shadow-md transition"
              >
                Got It
              </button>
            </div>
          </div>
        )}
      </>
    );
  }

  // Fallback indicator when running in non-standalone browser
  return (
    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#DCFCE7] text-[#166534] text-xs font-semibold border border-[#86EFAC]">
      <span className="w-2 h-2 rounded-full bg-[#16A34A]"></span>
      100% Offline Ready
    </div>
  );
};
