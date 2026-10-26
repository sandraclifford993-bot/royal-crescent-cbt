/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import {
  ArrowRight,
  BookOpen,
  CheckCircle2,
  Clock,
  GraduationCap,
  History,
  Moon,
  Settings,
  Sparkles,
  Volume2,
  VolumeX,
  WifiOff,
} from 'lucide-react';
import { voiceService } from '../services/voiceService';
import { PWAInstallButton } from './PWAInstallButton';

interface WelcomeScreenProps {
  onStartCBT: () => void;
  onOpenTeacherSettings: () => void;
  onOpenHistory: () => void;
}

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({
  onStartCBT,
  onOpenTeacherSettings,
  onOpenHistory,
}) => {
  const [isMuted, setIsMuted] = useState(voiceService.getIsMuted());
  const [hasSpokenWelcome, setHasSpokenWelcome] = useState(false);

  useEffect(() => {
    // Attempt to speak welcome message automatically on arrival
    const timer = setTimeout(() => {
      if (!isMuted && !hasSpokenWelcome) {
        voiceService.speakWelcome();
        setHasSpokenWelcome(true);
      }
    }, 600);

    return () => clearTimeout(timer);
  }, [isMuted, hasSpokenWelcome]);

  const handleToggleVoice = () => {
    const updated = voiceService.toggleMute();
    setIsMuted(updated);
  };

  const handleReplayVoice = () => {
    voiceService.speakWelcome();
  };

  const handleStart = () => {
    // Trigger audio chime for immediate sensory feedback
    voiceService.playChime('click');
    onStartCBT();
  };

  return (
    <div className="min-h-screen bg-[#FEF9C3] flex flex-col justify-between text-[#14532D] selection:bg-[#86EFAC]">
      {/* Top Banner Navigation */}
      <div className="w-full bg-[#FEF08A] border-b-2 border-[#86EFAC]/70 px-4 py-3">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-[#16A34A] animate-ping"></span>
            <span className="text-xs sm:text-sm font-bold text-[#14532D] uppercase tracking-wide">
              Royal Cresent CBT Offline System
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleToggleVoice}
              className={`p-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition border ${
                isMuted
                  ? 'bg-red-100 text-red-800 border-red-300'
                  : 'bg-[#DCFCE7] text-[#14532D] border-[#86EFAC]'
              }`}
              title={isMuted ? 'Voice is Muted' : 'Voice is Active'}
            >
              {isMuted ? <VolumeX className="w-4 h-4 text-red-600" /> : <Volume2 className="w-4 h-4 text-[#166534]" />}
              <span className="hidden sm:inline">{isMuted ? 'Voice OFF' : 'Voice ON'}</span>
            </button>

            <PWAInstallButton compact />
          </div>
        </div>
      </div>

      {/* Main Hero Card Container */}
      <div className="flex-1 flex items-center justify-center p-4 sm:p-6 md:p-8">
        <div className="w-full max-w-3xl bg-[#FFFDF5] rounded-3xl border-4 border-[#86EFAC] shadow-2xl p-6 sm:p-10 text-center relative overflow-hidden">
          {/* Decorative Corner Accents */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-[#FEF08A] rounded-bl-full -z-0 opacity-50 pointer-events-none"></div>
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-[#DCFCE7] rounded-tr-full -z-0 opacity-50 pointer-events-none"></div>

          {/* School Crest Emblem */}
          <div className="relative z-10 flex flex-col items-center">
            <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl bg-[#14532D] border-4 border-[#FDE047] shadow-xl flex items-center justify-center text-[#FEF08A] mb-5 transform hover:scale-105 transition-transform duration-300">
              <div className="relative">
                <Moon className="w-14 h-14 sm:w-16 sm:h-16 fill-[#FDE047] text-[#FDE047] -rotate-12" />
                <Sparkles className="w-7 h-7 text-[#86EFAC] absolute -top-2 -right-2 animate-bounce" />
                <GraduationCap className="w-6 h-6 text-white absolute -bottom-1 -left-2" />
              </div>
            </div>

            {/* Main Welcome Heading */}
            <div className="space-y-2 mb-6">
              <span className="inline-block px-4 py-1 rounded-full bg-[#DCFCE7] border border-[#86EFAC] text-xs sm:text-sm font-black text-[#166534] tracking-widest uppercase">
                Official Examination Portal
              </span>
              <h1 className="text-2xl sm:text-4xl md:text-5xl font-black text-[#14532D] tracking-tight uppercase leading-tight">
                WELCOME TO ROYAL CRESENT CBT CENTRE
              </h1>
              <p className="text-sm sm:text-base text-[#166534] font-semibold max-w-xl mx-auto">
                Modern, Offline Computer-Based Testing for Primary & Secondary School Students
              </p>
            </div>

            {/* Voice Greeting Button (Optional user replay) */}
            <button
              onClick={handleReplayVoice}
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#FEF08A] hover:bg-[#FDE047] border border-[#CA8A04]/40 text-[#14532D] text-xs font-bold shadow-xs transition mb-8 active:scale-95"
            >
              <Volume2 className="w-4 h-4 text-[#166534]" />
              <span>Listen: "Welcome to Royal Cresent CBT Centre!"</span>
            </button>

            {/* Big Primary Action: START CBT */}
            <div className="w-full max-w-md mx-auto mb-8">
              <button
                onClick={handleStart}
                className="w-full py-4 sm:py-5 px-8 rounded-2xl bg-[#166534] hover:bg-[#14532D] text-[#FEF9C3] font-black text-xl sm:text-2xl uppercase tracking-wider shadow-xl hover:shadow-2xl transition-all transform hover:-translate-y-1 active:translate-y-0 active:scale-98 border-4 border-[#86EFAC] flex items-center justify-center gap-3 cursor-pointer group"
              >
                <span>START CBT</span>
                <ArrowRight className="w-7 h-7 text-[#86EFAC] group-hover:translate-x-1.5 transition-transform" />
              </button>
              <p className="mt-2.5 text-xs font-bold text-[#166534]/80">
                ⚡ Instant access • No login, email, or password required
              </p>
            </div>

            {/* Key App Highlights Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 w-full text-left max-w-2xl mb-6">
              <div className="bg-[#FEF9C3] p-3.5 rounded-2xl border border-[#86EFAC] flex items-start gap-3">
                <div className="p-2 rounded-xl bg-[#86EFAC] text-[#14532D] shrink-0">
                  <WifiOff className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-black text-[#14532D] uppercase">100% Offline</h4>
                  <p className="text-[11px] text-[#166534] leading-snug">
                    Works completely in airplane mode with all subjects saved on device.
                  </p>
                </div>
              </div>

              <div className="bg-[#FEF9C3] p-3.5 rounded-2xl border border-[#86EFAC] flex items-start gap-3">
                <div className="p-2 rounded-xl bg-[#86EFAC] text-[#14532D] shrink-0">
                  <Volume2 className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-black text-[#14532D] uppercase">Voice Feedback</h4>
                  <p className="text-[11px] text-[#166534] leading-snug">
                    Automatic spoken encouragement for correct and incorrect answers in Practice Mode.
                  </p>
                </div>
              </div>

              <div className="bg-[#FEF9C3] p-3.5 rounded-2xl border border-[#86EFAC] flex items-start gap-3">
                <div className="p-2 rounded-xl bg-[#86EFAC] text-[#14532D] shrink-0">
                  <Clock className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-black text-[#14532D] uppercase">Two Exam Modes</h4>
                  <p className="text-[11px] text-[#166534] leading-snug">
                    Choose Practice Mode with explanations or Timed Exam Mode for assessments.
                  </p>
                </div>
              </div>
            </div>

            {/* Secondary Actions (History & Teacher Management) */}
            <div className="flex flex-wrap items-center justify-center gap-3 pt-4 border-t border-[#86EFAC]/40 w-full text-xs font-bold">
              <button
                onClick={onOpenHistory}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#DCFCE7] hover:bg-[#86EFAC] text-[#14532D] transition shadow-xs"
              >
                <History className="w-4 h-4 text-[#166534]" />
                <span>View Past Results</span>
              </button>

              <button
                onClick={onOpenTeacherSettings}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#FEF08A] hover:bg-[#FDE047] text-[#14532D] transition shadow-xs border border-[#CA8A04]/30"
              >
                <Settings className="w-4 h-4 text-[#166534]" />
                <span>Teacher Question Bank & Settings</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Branding */}
      <footer className="text-center py-4 px-4 text-xs font-bold text-[#166534]/90 bg-[#FEF08A] border-t border-[#86EFAC]/70">
        <p>ROYAL CRESENT CBT CENTRE • Designed for Primary & Secondary School Education</p>
        <p className="text-[10px] text-[#166534]/70 mt-0.5">
          Local Question Bank Ready • No Internet Required • Self-Contained Offline PWA
        </p>
      </footer>
    </div>
  );
};
