/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import confetti from 'canvas-confetti';
import {
  AlertCircle,
  ArrowLeft,
  Award,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Clock,
  GraduationCap,
  HelpCircle,
  Home,
  Printer,
  RefreshCw,
  Sparkles,
  Volume2,
  XCircle,
} from 'lucide-react';
import { voiceService } from '../services/voiceService';
import { AnswerOption, ExamResult } from '../types/cbt';
import { SchoolHeader } from './SchoolHeader';

interface ResultsScreenProps {
  result: ExamResult;
  onRetakeTest: () => void;
  onSelectAnotherSubject: () => void;
  onHome: () => void;
}

export const ResultsScreen: React.FC<ResultsScreenProps> = ({
  result,
  onRetakeTest,
  onSelectAnotherSubject,
  onHome,
}) => {
  const [showReview, setShowReview] = useState(false);
  const [isMuted, setIsMuted] = useState(voiceService.getIsMuted());

  useEffect(() => {
    // Confetti celebration if score >= 60%
    if (result.percentage >= 60) {
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#166534', '#86EFAC', '#FDE047', '#14532D'],
        });
      } catch {
        // Safe fallback
      }
    }
  }, [result.percentage]);

  const handleToggleVoice = () => {
    setIsMuted(voiceService.toggleMute());
  };

  const handlePrintSlip = () => {
    window.print();
  };

  const formatSeconds = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const rem = secs % 60;
    return `${mins}m ${rem}s`;
  };

  // Grade color theme
  const getGradeTheme = () => {
    if (result.percentage >= 75) {
      return {
        badge: 'bg-emerald-600 text-white',
        border: 'border-emerald-600',
        title: 'Outstanding Performance!',
      };
    }
    if (result.percentage >= 60) {
      return {
        badge: 'bg-green-600 text-white',
        border: 'border-green-600',
        title: 'Very Good Effort!',
      };
    }
    if (result.percentage >= 50) {
      return {
        badge: 'bg-amber-600 text-white',
        border: 'border-amber-600',
        title: 'Credit Pass!',
      };
    }
    return {
      badge: 'bg-rose-600 text-white',
      border: 'border-rose-600',
      title: 'Keep Practicing!',
    };
  };

  const gradeTheme = getGradeTheme();

  return (
    <div className="min-h-screen bg-[#FEF9C3] flex flex-col text-[#14532D] selection:bg-[#86EFAC]">
      {/* Permanent Header */}
      <SchoolHeader
        subtitle="Examination Results & Performance Report"
        isMuted={isMuted}
        onToggleVoice={handleToggleVoice}
        rightAction={
          <button
            onClick={handlePrintSlip}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white hover:bg-gray-100 text-[#14532D] font-bold text-xs sm:text-sm border border-[#86EFAC] transition shadow-xs print:hidden"
            title="Print Result Slip"
          >
            <Printer className="w-4 h-4 text-[#166534]" />
            <span className="hidden sm:inline">Print Slip</span>
          </button>
        }
      />

      <main className="flex-1 max-w-4xl w-full mx-auto p-4 sm:p-6 md:p-8 space-y-6">
        {/* Printable Result Slip Card */}
        <div className="bg-[#FFFDF5] rounded-3xl border-4 border-[#86EFAC] shadow-xl p-6 sm:p-8 space-y-6 print:border-none print:shadow-none">
          {/* Slip Header */}
          <div className="text-center pb-5 border-b-2 border-[#86EFAC]/60 space-y-2">
            <span className="inline-block px-3 py-0.5 rounded-full bg-[#DCFCE7] border border-[#86EFAC] text-xs font-black text-[#166534] tracking-widest uppercase">
              Official Examination Slip
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-[#14532D] uppercase tracking-tight">
              ROYAL CRESENT CBT CENTRE
            </h2>
            <p className="text-xs sm:text-sm text-[#166534] font-bold">
              {result.subjectName} • {result.testTitle}
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4 text-xs font-semibold text-[#166534]/80 mt-1">
              <span>Mode: <strong className="uppercase">{result.mode}</strong></span>
              <span>•</span>
              <span>Time Taken: <strong>{formatSeconds(result.timeTakenSeconds)}</strong></span>
              <span>•</span>
              <span>Date: <strong>{result.completedAt}</strong></span>
            </div>
          </div>

          {/* Big Score & Grade Display */}
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-center">
            {/* Score Circle Card */}
            <div className="sm:col-span-5 bg-[#FEF08A] rounded-3xl border-3 border-[#CA8A04]/40 p-6 text-center space-y-2 shadow-xs">
              <span className="text-xs font-black text-[#14532D] uppercase tracking-wider block">
                Final Examination Score
              </span>
              <div className="text-5xl sm:text-6xl font-black text-[#14532D] tracking-tighter">
                {result.score}
                <span className="text-2xl sm:text-3xl font-bold text-[#166534]">
                  /{result.totalQuestions}
                </span>
              </div>
              <div className="inline-block px-4 py-1.5 rounded-2xl bg-[#166534] text-[#FEF9C3] font-black text-xl sm:text-2xl shadow-xs">
                {result.percentage.toFixed(1)}%
              </div>
            </div>

            {/* Grade & Remark Card */}
            <div className="sm:col-span-7 bg-[#DCFCE7] rounded-3xl border-3 border-[#86EFAC] p-6 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-black text-[#166534] uppercase tracking-wide block">
                    Assigned Grade
                  </span>
                  <h3 className="text-2xl sm:text-3xl font-black text-[#14532D]">
                    Grade {result.grade}
                  </h3>
                </div>
                <div
                  className={`w-14 h-14 rounded-2xl font-black text-2xl flex items-center justify-center shadow-md ${gradeTheme.badge}`}
                >
                  {result.grade}
                </div>
              </div>

              <div className="pt-2 border-t border-[#86EFAC]/50">
                <span className="text-xs font-black text-[#166534] uppercase block">
                  Official Remark
                </span>
                <p className="text-base font-extrabold text-[#14532D] mt-0.5">
                  {result.remark}
                </p>
                <p className="text-xs text-[#166534] font-medium mt-1">
                  Formula: ({result.correctAnswers} Correct ÷ {result.totalQuestions} Questions) × 100 = {result.percentage.toFixed(1)}%
                </p>
              </div>
            </div>
          </div>

          {/* Detailed Statistics Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-[#FEF9C3] p-3.5 rounded-2xl border-2 border-[#86EFAC] text-center">
              <span className="text-xs font-bold text-[#166534] block">Total Questions</span>
              <span className="text-2xl font-black text-[#14532D]">{result.totalQuestions}</span>
            </div>

            <div className="bg-emerald-50 p-3.5 rounded-2xl border-2 border-emerald-300 text-center">
              <span className="text-xs font-bold text-emerald-800 flex items-center justify-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                Correct
              </span>
              <span className="text-2xl font-black text-emerald-700">{result.correctAnswers}</span>
            </div>

            <div className="bg-rose-50 p-3.5 rounded-2xl border-2 border-rose-300 text-center">
              <span className="text-xs font-bold text-rose-800 flex items-center justify-center gap-1">
                <XCircle className="w-3.5 h-3.5 text-rose-600" />
                Incorrect
              </span>
              <span className="text-2xl font-black text-rose-700">{result.incorrectAnswers}</span>
            </div>

            <div className="bg-amber-50 p-3.5 rounded-2xl border-2 border-amber-300 text-center">
              <span className="text-xs font-bold text-amber-800 flex items-center justify-center gap-1">
                <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
                Unanswered
              </span>
              <span className="text-2xl font-black text-amber-700">{result.unansweredQuestions}</span>
            </div>
          </div>

          {/* Primary Action Buttons (RETAKE TEST, SELECT ANOTHER SUBJECT, HOME) */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 border-t-2 border-[#86EFAC]/50 print:hidden">
            {/* RETAKE TEST */}
            <button
              onClick={onRetakeTest}
              className="py-3.5 px-4 rounded-2xl bg-[#166534] hover:bg-[#14532D] text-[#FEF9C3] font-black text-sm uppercase tracking-wide shadow-md transition border-2 border-[#86EFAC] flex items-center justify-center gap-2 cursor-pointer active:scale-95"
            >
              <RefreshCw className="w-4 h-4 text-[#86EFAC]" />
              <span>RETAKE TEST</span>
            </button>

            {/* SELECT ANOTHER SUBJECT */}
            <button
              onClick={onSelectAnotherSubject}
              className="py-3.5 px-4 rounded-2xl bg-[#DCFCE7] hover:bg-[#86EFAC] text-[#14532D] font-black text-sm uppercase tracking-wide shadow-sm transition border-2 border-[#86EFAC] flex items-center justify-center gap-2 cursor-pointer active:scale-95"
            >
              <GraduationCap className="w-4 h-4 text-[#166534]" />
              <span>SELECT ANOTHER SUBJECT</span>
            </button>

            {/* HOME */}
            <button
              onClick={onHome}
              className="py-3.5 px-4 rounded-2xl bg-[#FEF08A] hover:bg-[#FDE047] text-[#14532D] font-black text-sm uppercase tracking-wide shadow-sm transition border-2 border-[#CA8A04]/40 flex items-center justify-center gap-2 cursor-pointer active:scale-95"
            >
              <Home className="w-4 h-4 text-[#166534]" />
              <span>HOME</span>
            </button>
          </div>
        </div>

        {/* Toggle Question Review Breakdown */}
        <div className="print:hidden">
          <button
            onClick={() => setShowReview(!showReview)}
            className="w-full py-4 px-6 rounded-2xl bg-[#FFFDF5] hover:bg-white border-3 border-[#86EFAC] shadow-md flex items-center justify-between font-black text-sm sm:text-base text-[#14532D] transition"
          >
            <div className="flex items-center gap-2">
              <HelpCircle className="w-5 h-5 text-[#166534]" />
              <span>REVIEW ALL QUESTIONS & EXPLANATIONS ({result.questions.length})</span>
            </div>
            {showReview ? (
              <ChevronUp className="w-5 h-5 text-[#166534]" />
            ) : (
              <ChevronDown className="w-5 h-5 text-[#166534]" />
            )}
          </button>

          {/* Expandable Review Section */}
          {showReview && (
            <div className="mt-4 space-y-4 animate-in fade-in">
              {result.questions.map((q, idx) => {
                const userChoice = result.userAnswers[q.id];
                const isCorrect = userChoice === q.correctAnswer;
                const wasAnswered = !!userChoice;

                return (
                  <div
                    key={q.id}
                    className={`bg-[#FFFDF5] rounded-3xl border-3 p-5 sm:p-6 space-y-4 shadow-sm ${
                      !wasAnswered
                        ? 'border-amber-300'
                        : isCorrect
                        ? 'border-emerald-500'
                        : 'border-rose-400'
                    }`}
                  >
                    {/* Header */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-2">
                        <span className="px-3 py-1 rounded-xl bg-[#166534] text-[#FEF9C3] font-black text-xs">
                          Question {idx + 1}
                        </span>
                        {!wasAnswered ? (
                          <span className="px-2.5 py-0.5 rounded-lg bg-amber-100 text-amber-800 font-bold text-xs">
                            Unanswered
                          </span>
                        ) : isCorrect ? (
                          <span className="px-2.5 py-0.5 rounded-lg bg-emerald-100 text-emerald-800 font-bold text-xs flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                            Correct
                          </span>
                        ) : (
                          <span className="px-2.5 py-0.5 rounded-lg bg-rose-100 text-rose-800 font-bold text-xs flex items-center gap-1">
                            <XCircle className="w-3.5 h-3.5 text-rose-600" />
                            Incorrect
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Question Text */}
                    <h4 className="text-base sm:text-lg font-black text-[#14532D]">
                      {q.questionText}
                    </h4>

                    {/* 4 Options Preview */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs sm:text-sm font-semibold">
                      {[
                        { letter: 'A' as AnswerOption, text: q.optionA },
                        { letter: 'B' as AnswerOption, text: q.optionB },
                        { letter: 'C' as AnswerOption, text: q.optionC },
                        { letter: 'D' as AnswerOption, text: q.optionD },
                      ].map((opt) => {
                        const isStudentChoice = userChoice === opt.letter;
                        const isRightAnswer = q.correctAnswer === opt.letter;

                        let style = 'bg-white border-[#86EFAC]/60 text-[#14532D]';
                        if (isRightAnswer) {
                          style = 'bg-emerald-100 border-emerald-600 text-emerald-950 font-bold';
                        } else if (isStudentChoice && !isRightAnswer) {
                          style = 'bg-rose-100 border-rose-500 text-rose-950 font-bold';
                        }

                        return (
                          <div
                            key={opt.letter}
                            className={`p-3 rounded-xl border-2 flex items-center gap-2 ${style}`}
                          >
                            <span className="w-6 h-6 rounded-lg bg-black/10 flex items-center justify-center font-black text-xs shrink-0">
                              {opt.letter}
                            </span>
                            <span className="flex-1">{opt.text}</span>
                            {isRightAnswer && (
                              <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
                            )}
                            {isStudentChoice && !isRightAnswer && (
                              <XCircle className="w-4 h-4 text-rose-700 shrink-0" />
                            )}
                          </div>
                        );
                      })}
                    </div>

                    {/* Explanation */}
                    {q.explanation && (
                      <div className="bg-[#FEF9C3] p-3.5 rounded-xl border border-[#CA8A04]/30 text-xs text-[#14532D] font-medium leading-relaxed">
                        <strong className="text-[#166534]">Explanation:</strong> {q.explanation}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};
