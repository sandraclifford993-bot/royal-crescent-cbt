/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  ArrowLeft,
  BookOpen,
  CheckCircle2,
  Clock,
  HelpCircle,
  Play,
  ShieldAlert,
  Sparkles,
  Volume2,
} from 'lucide-react';
import { storageService } from '../services/storageService';
import { voiceService } from '../services/voiceService';
import { ExamMode, Subject, Test } from '../types/cbt';
import { SchoolHeader } from './SchoolHeader';

interface TestSelectionScreenProps {
  subject: Subject;
  onStartTest: (test: Test, mode: ExamMode, customMinutes?: number) => void;
  onBackToSubjects: () => void;
}

export const TestSelectionScreen: React.FC<TestSelectionScreenProps> = ({
  subject,
  onStartTest,
  onBackToSubjects,
}) => {
  const availableTests = storageService.getTestsBySubject(subject.id);
  const [selectedTest, setSelectedTest] = useState<Test>(
    availableTests[0] || {
      id: `default-${subject.id}`,
      subjectId: subject.id,
      title: `${subject.name} Standard Assessment`,
      description: `Comprehensive evaluation test for ${subject.name}.`,
      classLevel: subject.classLevel,
      className: 'Standard Class',
      durationMinutes: 15,
      questionCount: 10,
      instructions: 'Answer all questions to the best of your ability.',
    }
  );

  const [mode, setMode] = useState<ExamMode>('practice');
  const [customDuration, setCustomDuration] = useState<number>(selectedTest.durationMinutes || 15);
  const [isMuted, setIsMuted] = useState(voiceService.getIsMuted());

  // Count available questions for selected test
  const questionCount = storageService.getQuestionsByTest(selectedTest.id).length || selectedTest.questionCount;

  const handleToggleVoice = () => {
    setIsMuted(voiceService.toggleMute());
  };

  const handleBegin = () => {
    voiceService.playChime('click');
    onStartTest(selectedTest, mode, mode === 'exam' ? customDuration : undefined);
  };

  return (
    <div className="min-h-screen bg-[#FEF9C3] flex flex-col text-[#14532D] selection:bg-[#86EFAC]">
      {/* Permanent Top School Header */}
      <SchoolHeader
        subtitle={`${subject.name} • Select Test Paper & CBT Mode`}
        isMuted={isMuted}
        onToggleVoice={handleToggleVoice}
        rightAction={
          <button
            onClick={onBackToSubjects}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/80 hover:bg-white text-[#14532D] font-bold text-xs sm:text-sm border border-[#86EFAC] transition shadow-xs"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Subjects</span>
          </button>
        }
      />

      <main className="flex-1 max-w-5xl w-full mx-auto p-4 sm:p-6 md:p-8 space-y-6">
        {/* Subject Header Banner */}
        <div className="bg-[#FFFDF5] p-5 sm:p-6 rounded-3xl border-3 border-[#86EFAC] shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-3 py-0.5 rounded-full bg-[#FEF08A] font-black text-xs text-[#14532D] border border-[#CA8A04]/40">
                {subject.code}
              </span>
              <span className="text-xs font-bold text-[#166534]">
                Step 2 of 3: Test & Mode
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-[#14532D]">
              {subject.name}
            </h2>
            <p className="text-xs sm:text-sm text-[#166534] font-medium mt-1">
              {subject.description}
            </p>
          </div>

          <div className="bg-[#DCFCE7] p-3 rounded-2xl border border-[#86EFAC] self-start sm:self-center text-center">
            <span className="text-[11px] font-bold text-[#166534] uppercase block">Question Bank</span>
            <span className="text-xl font-black text-[#14532D]">{questionCount}</span>
            <span className="text-[11px] font-bold text-[#166534] block">Available</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Test Papers (if multiple) */}
          <div className="lg:col-span-5 space-y-4">
            <h3 className="text-sm font-black text-[#14532D] uppercase tracking-wider flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-[#166534]" />
              Choose Test Paper
            </h3>

            <div className="space-y-3">
              {availableTests.map((test) => {
                const isSelected = selectedTest.id === test.id;
                const testQCount = storageService.getQuestionsByTest(test.id).length;

                return (
                  <div
                    key={test.id}
                    onClick={() => {
                      setSelectedTest(test);
                      setCustomDuration(test.durationMinutes);
                    }}
                    className={`p-4 rounded-2xl border-3 transition-all cursor-pointer text-left shadow-xs ${
                      isSelected
                        ? 'bg-[#FFFDF5] border-[#166534] shadow-md'
                        : 'bg-[#FFFDF5]/70 border-[#86EFAC] hover:border-[#166534]/50'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <h4 className="font-black text-base text-[#14532D]">
                        {test.title}
                      </h4>
                      {isSelected && (
                        <span className="w-2.5 h-2.5 rounded-full bg-[#16A34A] shrink-0 mt-1.5"></span>
                      )}
                    </div>
                    <p className="text-xs text-[#166534] mt-1 line-clamp-2">
                      {test.description}
                    </p>
                    <div className="mt-3 flex items-center gap-3 text-xs font-bold text-[#166534]">
                      <span className="bg-[#FEF08A] px-2.5 py-0.5 rounded-md border border-[#CA8A04]/30">
                        {test.className}
                      </span>
                      <span>{testQCount} Questions</span>
                      <span>•</span>
                      <span>{test.durationMinutes} Mins</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Column: Mode Selection & Confirmation */}
          <div className="lg:col-span-7 space-y-5">
            <h3 className="text-sm font-black text-[#14532D] uppercase tracking-wider flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#166534]" />
              Select CBT Mode
            </h3>

            {/* Mode Choice Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Practice Mode Card */}
              <div
                onClick={() => setMode('practice')}
                className={`p-5 rounded-2xl border-3 cursor-pointer transition-all flex flex-col justify-between ${
                  mode === 'practice'
                    ? 'bg-[#FFFDF5] border-[#166534] shadow-lg ring-2 ring-[#86EFAC]'
                    : 'bg-[#FFFDF5]/60 border-[#86EFAC] hover:border-[#166534]/40'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="px-2.5 py-0.5 rounded-md bg-[#DCFCE7] text-[#14532D] text-xs font-black border border-[#86EFAC]">
                      PRACTICE MODE
                    </span>
                    <Volume2 className="w-5 h-5 text-[#166534]" />
                  </div>
                  <h4 className="font-black text-base text-[#14532D] mt-2">
                    Learning & Voice Drill
                  </h4>
                  <ul className="mt-3 space-y-1.5 text-xs text-[#166534] font-semibold">
                    <li className="flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#16A34A] shrink-0" />
                      <span>Instant spoken voice feedback</span>
                    </li>
                    <li className="flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#16A34A] shrink-0" />
                      <span>Shows correct/wrong right away</span>
                    </li>
                    <li className="flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#16A34A] shrink-0" />
                      <span>Full educational explanations</span>
                    </li>
                    <li className="flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#16A34A] shrink-0" />
                      <span>No strict time pressure</span>
                    </li>
                  </ul>
                </div>

                <div className="mt-4 pt-3 border-t border-[#86EFAC]/40 text-center">
                  <span
                    className={`inline-block w-full py-1.5 rounded-xl text-xs font-bold ${
                      mode === 'practice'
                        ? 'bg-[#166534] text-[#FEF9C3]'
                        : 'bg-[#DCFCE7] text-[#14532D]'
                    }`}
                  >
                    {mode === 'practice' ? '✓ Selected' : 'Choose Practice'}
                  </span>
                </div>
              </div>

              {/* Examination Mode Card */}
              <div
                onClick={() => setMode('exam')}
                className={`p-5 rounded-2xl border-3 cursor-pointer transition-all flex flex-col justify-between ${
                  mode === 'exam'
                    ? 'bg-[#FFFDF5] border-[#166534] shadow-lg ring-2 ring-[#86EFAC]'
                    : 'bg-[#FFFDF5]/60 border-[#86EFAC] hover:border-[#166534]/40'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="px-2.5 py-0.5 rounded-md bg-[#FEF08A] text-[#14532D] text-xs font-black border border-[#CA8A04]/40">
                      EXAMINATION MODE
                    </span>
                    <Clock className="w-5 h-5 text-[#CA8A04]" />
                  </div>
                  <h4 className="font-black text-base text-[#14532D] mt-2">
                    Timed Examination
                  </h4>
                  <ul className="mt-3 space-y-1.5 text-xs text-[#166534] font-semibold">
                    <li className="flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#16A34A] shrink-0" />
                      <span>Strict countdown timer</span>
                    </li>
                    <li className="flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#16A34A] shrink-0" />
                      <span>No answers revealed during test</span>
                    </li>
                    <li className="flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#16A34A] shrink-0" />
                      <span>Auto-submits when time expires</span>
                    </li>
                    <li className="flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#16A34A] shrink-0" />
                      <span>Final score & report upon submit</span>
                    </li>
                  </ul>
                </div>

                <div className="mt-4 pt-3 border-t border-[#86EFAC]/40 text-center">
                  <span
                    className={`inline-block w-full py-1.5 rounded-xl text-xs font-bold ${
                      mode === 'exam'
                        ? 'bg-[#166534] text-[#FEF9C3]'
                        : 'bg-[#DCFCE7] text-[#14532D]'
                    }`}
                  >
                    {mode === 'exam' ? '✓ Selected' : 'Choose Exam'}
                  </span>
                </div>
              </div>
            </div>

            {/* Examination Timer Duration Setting (Visible in Exam Mode) */}
            {mode === 'exam' && (
              <div className="bg-[#FFFDF5] p-4 rounded-2xl border-2 border-[#86EFAC] flex items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-[#166534]" />
                  <div>
                    <h5 className="text-xs font-black text-[#14532D] uppercase">
                      Examination Timer Limit
                    </h5>
                    <p className="text-[11px] text-[#166534]">
                      Exam will auto-submit when the clock reaches 00:00.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  {[10, 15, 20, 30].map((mins) => (
                    <button
                      key={mins}
                      onClick={() => setCustomDuration(mins)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-bold transition ${
                        customDuration === mins
                          ? 'bg-[#166534] text-white'
                          : 'bg-[#DCFCE7] text-[#14532D] hover:bg-[#86EFAC]'
                      }`}
                    >
                      {mins}m
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Test Summary & Big START Action */}
            <div className="bg-[#FFFDF5] p-6 rounded-3xl border-3 border-[#86EFAC] shadow-md space-y-4">
              <div className="flex items-center justify-between text-xs font-bold text-[#166534] pb-3 border-b border-[#86EFAC]/40">
                <span>Selected: <strong>{selectedTest.title}</strong></span>
                <span>Mode: <strong className="uppercase">{mode}</strong></span>
              </div>

              <button
                onClick={handleBegin}
                className="w-full py-4 px-6 rounded-2xl bg-[#166534] hover:bg-[#14532D] text-[#FEF9C3] font-black text-lg sm:text-xl uppercase tracking-wider shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-0.5 active:translate-y-0 border-3 border-[#86EFAC] flex items-center justify-center gap-3 cursor-pointer"
              >
                <Play className="w-6 h-6 text-[#86EFAC] fill-[#86EFAC]" />
                <span>START ANSWERING QUESTIONS</span>
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};
