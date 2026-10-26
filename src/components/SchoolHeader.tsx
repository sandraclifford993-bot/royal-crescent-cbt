/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Volume2, VolumeX, Moon, Sparkles } from 'lucide-react';

interface SchoolHeaderProps {
  subtitle?: string;
  showVoiceToggle?: boolean;
  isMuted?: boolean;
  onToggleVoice?: () => void;
  rightAction?: React.ReactNode;
  compact?: boolean;
}

export const SchoolHeader: React.FC<SchoolHeaderProps> = ({
  subtitle,
  showVoiceToggle = true,
  isMuted = false,
  onToggleVoice,
  rightAction,
  compact = false,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-[#FEF08A] border-b-4 border-[#86EFAC] shadow-md px-3 sm:px-6 py-2.5 sm:py-3 transition-all">
      <div className="max-w-6xl mx-auto flex items-center justify-between gap-3">
        {/* School Branding */}
        <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-[#14532D] border-2 border-[#86EFAC] flex items-center justify-center text-[#FEF08A] shadow-sm shrink-0">
            <div className="relative">
              <Moon className="w-6 h-6 sm:w-7 sm:h-7 fill-[#FDE047] text-[#FDE047] -rotate-12" />
              <Sparkles className="w-3.5 h-3.5 text-[#86EFAC] absolute -top-1 -right-1" />
            </div>
          </div>
          <div className="min-w-0">
            <h1 className="text-base sm:text-xl md:text-2xl font-black text-[#14532D] tracking-tight uppercase truncate leading-tight drop-shadow-xs">
              ROYAL CRESENT CBT CENTRE
            </h1>
            {subtitle ? (
              <p className="text-xs sm:text-sm font-semibold text-[#166534] truncate">
                {subtitle}
              </p>
            ) : (
              <p className="text-[11px] sm:text-xs font-medium text-[#166534]/80 hidden sm:block">
                Excellence • Integrity • Discipline • Offline Examination System
              </p>
            )}
          </div>
        </div>

        {/* Right Controls: Voice Toggle & Custom Action */}
        <div className="flex items-center gap-2 shrink-0">
          {showVoiceToggle && onToggleVoice && (
            <button
              onClick={onToggleVoice}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold text-xs sm:text-sm transition-all shadow-sm active:scale-95 border ${
                isMuted
                  ? 'bg-red-100 text-red-800 border-red-300 hover:bg-red-200'
                  : 'bg-[#DCFCE7] text-[#14532D] border-[#86EFAC] hover:bg-[#86EFAC]'
              }`}
              title={isMuted ? 'Voice feedback is OFF (Click to Enable)' : 'Voice feedback is ON (Click to Mute)'}
              aria-label={isMuted ? 'Turn on voice' : 'Mute voice'}
            >
              {isMuted ? (
                <>
                  <VolumeX className="w-4 h-4 text-red-600" />
                  <span className="hidden xs:inline">Voice OFF</span>
                </>
              ) : (
                <>
                  <Volume2 className="w-4 h-4 text-[#166534]" />
                  <span className="hidden xs:inline">Voice ON</span>
                </>
              )}
            </button>
          )}

          {rightAction}
        </div>
      </div>
    </header>
  );
};
