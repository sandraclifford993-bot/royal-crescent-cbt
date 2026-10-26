/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { WifiOff, CheckCircle } from 'lucide-react';

export const OfflineIndicator: React.FC = () => {
  const [isOnline, setIsOnline] = useState(
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );
  const [showToast, setShowToast] = useState(false);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setShowToast(true);
      const timer = setTimeout(() => setShowToast(false), 3000);
      return () => clearTimeout(timer);
    };

    const handleOffline = () => {
      setIsOnline(false);
      setShowToast(true);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (isOnline && !showToast) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 flex items-center gap-2 rounded-xl bg-[#14532D] text-[#FEF9C3] px-3.5 py-2 text-xs font-semibold shadow-xl border border-[#86EFAC]/50 animate-in fade-in slide-in-from-bottom-2">
      {!isOnline ? (
        <>
          <WifiOff className="w-4 h-4 text-[#FDE047]" />
          <span>Airplane / Offline Mode Active — All tests run locally</span>
        </>
      ) : (
        <>
          <CheckCircle className="w-4 h-4 text-[#86EFAC]" />
          <span>Device Connected — Offline tests ready</span>
        </>
      )}
    </div>
  );
};
