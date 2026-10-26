/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  Bookmark,
  CheckCircle2,
  Clock,
  Eye,
  Flag,
  HelpCircle,
  LayoutGrid,
  Send,
  Sparkles,
  Volume2,
  VolumeX,
  XCircle,
} from 'lucide-react';
import { voiceService } from '../services/voiceService';
import { AnswerOption, ExamMode, Question, Subject, Test } from '../types/cbt';
import { SchoolHeader } from './SchoolHeader';

interface CbtQuestionScreenProps {
  subject: Subject;
  test: Test;
  mode: ExamMode;
  questions: Question[];
  durationMinutes: number;
  onSubmitExam: (userAnswers: Record<string, AnswerOption>, timeTakenSeconds: number) => void;
  onExitExam: () => void;
}

export const CbtQuestionScreen: React.FC<CbtQuestionScreenProps> = ({
  subject,
  test,
  mode,
  questions,
  durationMinutes,
  onSubmitExam,
  onExitExam,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<Record<string, AnswerOption>>({});
  const [flaggedQuestions, setFlaggedQuestions] = useState<Record<string, boolean>>({});
  const [isMuted, setIsMuted] = useState(voiceService.getIsMuted());
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [showGridDrawer, setShowGridDrawer] = useState(false);
  const [showExitModal, setShowExitModal] = useState(false);

  // Examination countdown timer
  const totalSeconds = durationMinutes * 60;
  const [secondsRemaining, setSecondsRemaining] = useState(totalSeconds);
  const [startTime] = useState<number>(Date.now());

  const currentQuestion = questions[currentIndex] || questions[0];
  const isPractice = mode === 'practice';
  const totalQuestions = questions.length;

  // Handle countdown timer for Exam Mode
  useEffect(() => {
    if (!isPractice) {
      const interval = setInterval(() => {
        setSecondsRemaining((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            // Automatic submission when timer expires
            handleSubmitConfirmed();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [isPractice]);

  const handleToggleVoice = () => {
    setIsMuted(voiceService.toggleMute());
  };

  const formatTimer = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remainder = secs % 60;
    return `${mins.toString().padStart(2, '0')}:${remainder.toString().padStart(2, '0')}`;
  };

  const isLowTime = !isPractice && secondsRemaining <= 120; // Last 2 minutes

  // Handle Option Click
  const handleSelectOption = (option: AnswerOption) => {
    if (!currentQuestion) return;

    const previousAnswer = userAnswers[currentQuestion.id];
    const isNewOrChanged = previousAnswer !== option;

    setUserAnswers((prev) => ({
      ...prev,
      [currentQuestion.id]: option,
    }));

    // Voice Feedback (Only in Practice Mode)
    if (isPractice && isNewOrChanged) {
      const isCorrect = option === currentQuestion.correctAnswer;
      if (isCorrect) {
        voiceService.speakCorrectFeedback(currentQuestion.id, option);
      } else {
        voiceService.speakWrongFeedback(currentQuestion.id, option);
      }
    } else if (!isPractice) {
      voiceService.playChime('click');
    }
  };

  // Listen to Question Text (Accessibility feature)
  const handleListenQuestion = () => {
    if (!currentQuestion) return;
    const textToSpeak = `Question ${currentIndex + 1}. ${currentQuestion.questionText}. Option A: ${currentQuestion.optionA}. Option B: ${currentQuestion.optionB}. Option C: ${currentQuestion.optionC}. Option D: ${currentQuestion.optionD}.`;
    voiceService.speakText(textToSpeak, true);
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      voiceService.resetSpokenKey();
      setCurrentIndex((prev) => prev - 1);
    }
  };

  const handleNext = () => {
    if (currentIndex < totalQuestions - 1) {
      voiceService.resetSpokenKey();
      setCurrentIndex((prev) => prev + 1);
    }
  };

  const handleToggleFlag = () => {
    if (!currentQuestion) return;
    setFlaggedQuestions((prev) => ({
      ...prev,
      [currentQuestion.id]: !prev[currentQuestion.id],
    }));
  };

  const handleJumpToQuestion = (idx: number) => {
    voiceService.resetSpokenKey();
    setCurrentIndex(idx);
    setShowGridDrawer(false);
  };

  const answeredCount = Object.keys(userAnswers).length;
  const unansweredCount = totalQuestions - answeredCount;

  const handleSubmitConfirmed = () => {
    voiceService.playChime('submit');
    const elapsedSeconds = Math.round((Date.now() - startTime) / 1000);
    onSubmitExam(userAnswers, elapsedSeconds);
  };

  const selectedAnswer = currentQuestion ? userAnswers[currentQuestion.id] : undefined;
  const isAnswered = selectedAnswer !== undefined;

  // Option Styling Helper
  const getOptionClasses = (optionLetter: AnswerOption, optionText: string) => {
    const isSelected = selectedAnswer === optionLetter;

    if (isPractice && isAnswered) {
      const isCorrectOption = optionLetter === currentQuestion.correctAnswer;
      const isUserChoice = isSelected;

      if (isCorrectOption) {
        return 'bg-emerald-100 border-emerald-600 text-emerald-950 ring-2 ring-emerald-500 shadow-md font-bold';
      }
      if (isUserChoice && !isCorrectOption) {
        return 'bg-rose-100 border-rose-600 text-rose-950 ring-2 ring-rose-400 shadow-md font-bold';
      }
      return 'bg-white/90 border-[#86EFAC]/70 text-[#14532D]/70 opacity-80';
    }

    // In Exam Mode or Unanswered
    if (isSelected) {
      return 'bg-[#DCFCE7] border-[#166534] text-[#14532D] ring-3 ring-[#166534] shadow-lg font-bold scale-[1.01]';
    }

    return 'bg-white hover:bg-[#FEF08A]/50 border-2 border-[#86EFAC] text-[#14532D] hover:border-[#166534]/60 shadow-xs hover:shadow-md';
  };

  const getOptionBadgeClasses = (optionLetter: AnswerOption) => {
    const isSelected = selectedAnswer === optionLetter;

    if (isPractice && isAnswered) {
      if (optionLetter === currentQuestion.correctAnswer) {
        return 'bg-emerald-600 text-white';
      }
      if (isSelected && optionLetter !== currentQuestion.correctAnswer) {
        return 'bg-rose-600 text-white';
      }
      return 'bg-gray-200 text-gray-700';
    }

    if (isSelected) {
      return 'bg-[#166534] text-[#FEF9C3]';
    }

    return 'bg-[#FEF9C3] text-[#14532D] group-hover:bg-[#86EFAC]';
  };

  return (
    <div className="min-h-screen bg-[#FEF9C3] flex flex-col text-[#14532D] selection:bg-[#86EFAC] select-none">
      {/* 
        CRITICAL REQUIREMENT: 
        Display "ROYAL CRESENT CBT CENTRE" at the top of every question screen.
        Keep the school name visible throughout the examination.
      */}
      <SchoolHeader
        subtitle={`${subject.name} • ${test.title}`}
        isMuted={isMuted}
        onToggleVoice={handleToggleVoice}
        rightAction={
          <div className="flex items-center gap-2">
            {/* Countdown Timer for Exam Mode */}
            {!isPractice ? (
              <div
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-black text-xs sm:text-sm border-2 transition-all ${
                  isLowTime
                    ? 'bg-rose-100 text-rose-700 border-rose-500 animate-pulse'
                    : 'bg-[#FFFDF5] text-[#14532D] border-[#166534]'
                }`}
                title="Time Remaining"
              >
                <Clock className="w-4 h-4 text-[#166534]" />
                <span className="font-mono">{formatTimer(secondsRemaining)}</span>
              </div>
            ) : (
              <div className="hidden xs:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#DCFCE7] text-[#166534] font-bold text-xs border border-[#86EFAC]">
                <Sparkles className="w-4 h-4" />
                <span>Practice Mode</span>
              </div>
            )}

            {/* Quick Grid Palette Button */}
            <button
              onClick={() => setShowGridDrawer(!showGridDrawer)}
              className="p-2 sm:px-3 sm:py-1.5 rounded-xl bg-white hover:bg-[#86EFAC]/30 text-[#14532D] font-bold text-xs sm:text-sm border border-[#86EFAC] flex items-center gap-1.5 transition shadow-xs"
              title="Question Palette"
            >
              <LayoutGrid className="w-4 h-4 text-[#166534]" />
              <span className="hidden sm:inline">Palette</span>
            </button>

            {/* Exit Confirmation Button */}
            <button
              onClick={() => setShowExitModal(true)}
              className="px-2.5 py-1.5 rounded-xl bg-red-100 hover:bg-red-200 text-red-800 text-xs font-bold transition border border-red-300"
              title="Exit Test"
            >
              Exit
            </button>
          </div>
        }
      />

      {/* Main Question Workspace */}
      <main className="flex-1 max-w-5xl w-full mx-auto p-3 sm:p-6 flex flex-col justify-between">
        <div className="space-y-4">
          {/* Subheader: Question Counter & Progress Bar */}
          <div className="bg-[#FFFDF5] px-4 py-3 sm:px-6 sm:py-4 rounded-2xl border-2 border-[#86EFAC] shadow-xs flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-xl bg-[#166534] text-[#FEF9C3] font-black text-xs sm:text-sm shadow-xs">
                Question {currentIndex + 1} of {totalQuestions}
              </span>
              <span className="text-xs font-bold text-[#166534]">
                ({answeredCount} Answered • {unansweredCount} Left)
              </span>
            </div>

            <div className="flex items-center gap-2">
              {/* Flag / Review Button */}
              <button
                onClick={handleToggleFlag}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold border transition ${
                  flaggedQuestions[currentQuestion.id]
                    ? 'bg-amber-100 text-amber-800 border-amber-400 font-black'
                    : 'bg-white text-[#166534] border-[#86EFAC] hover:bg-[#DCFCE7]'
                }`}
                title="Flag this question to review later"
              >
                <Bookmark className={`w-3.5 h-3.5 ${flaggedQuestions[currentQuestion.id] ? 'fill-amber-500 text-amber-500' : ''}`} />
                <span>{flaggedQuestions[currentQuestion.id] ? 'Flagged' : 'Flag for Review'}</span>
              </button>

              {/* Read Aloud Button */}
              <button
                onClick={handleListenQuestion}
                className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-[#FEF08A] hover:bg-[#FDE047] text-[#14532D] text-xs font-bold border border-[#CA8A04]/30 transition shadow-xs"
                title="Listen to Question Text"
              >
                <Volume2 className="w-3.5 h-3.5 text-[#166534]" />
                <span className="hidden sm:inline">Read Aloud</span>
              </button>
            </div>
          </div>

          {/* Linear Progress Bar */}
          <div className="w-full bg-[#86EFAC]/40 h-2.5 rounded-full overflow-hidden p-0.5 border border-[#86EFAC]">
            <div
              className="bg-[#166534] h-full rounded-full transition-all duration-300"
              style={{ width: `${((currentIndex + 1) / totalQuestions) * 100}%` }}
            ></div>
          </div>

          {/* Question Card (White / Cream) */}
          <div className="bg-[#FFFDF5] rounded-3xl border-3 border-[#86EFAC] shadow-md p-5 sm:p-8 space-y-6">
            {/* Question Text */}
            <div className="space-y-2">
              <span className="text-xs font-black text-[#166534] uppercase tracking-wider block">
                {subject.name} • Objective Question
              </span>
              <h3 className="text-lg sm:text-2xl font-black text-[#14532D] leading-relaxed">
                {currentQuestion.questionText}
              </h3>
            </div>

            {/* Exactly 4 Large Clickable Options: (A), (B), (C), (D) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 sm:gap-4 pt-2">
              {[
                { letter: 'A' as AnswerOption, text: currentQuestion.optionA },
                { letter: 'B' as AnswerOption, text: currentQuestion.optionB },
                { letter: 'C' as AnswerOption, text: currentQuestion.optionC },
                { letter: 'D' as AnswerOption, text: currentQuestion.optionD },
              ].map(({ letter, text }) => {
                const isSelected = selectedAnswer === letter;

                return (
                  <button
                    key={letter}
                    onClick={() => handleSelectOption(letter)}
                    className={`w-full p-4 sm:p-5 rounded-2xl text-left border-3 transition-all duration-150 flex items-center gap-3.5 group cursor-pointer active:scale-98 ${getOptionClasses(
                      letter,
                      text
                    )}`}
                  >
                    {/* Option Badge (A, B, C, D) */}
                    <span
                      className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl font-black text-sm sm:text-base flex items-center justify-center shrink-0 border border-black/10 transition-colors shadow-xs ${getOptionBadgeClasses(
                        letter
                      )}`}
                    >
                      {letter}
                    </span>

                    {/* Option Text */}
                    <span className="text-sm sm:text-base font-bold leading-snug flex-1">
                      {text}
                    </span>

                    {/* Practice Mode Result Badges */}
                    {isPractice && isAnswered && (
                      <span className="shrink-0">
                        {letter === currentQuestion.correctAnswer && (
                          <CheckCircle2 className="w-6 h-6 text-emerald-600 animate-in zoom-in" />
                        )}
                        {isSelected && letter !== currentQuestion.correctAnswer && (
                          <XCircle className="w-6 h-6 text-rose-600 animate-in zoom-in" />
                        )}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Practice Mode Explanation Box */}
            {isPractice && isAnswered && (
              <div
                className={`p-4 sm:p-5 rounded-2xl border-2 animate-in fade-in slide-in-from-top-2 ${
                  selectedAnswer === currentQuestion.correctAnswer
                    ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
                    : 'bg-amber-50 border-amber-300 text-amber-950'
                }`}
              >
                <div className="flex items-start gap-3">
                  {selectedAnswer === currentQuestion.correctAnswer ? (
                    <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0 mt-0.5" />
                  ) : (
                    <HelpCircle className="w-6 h-6 text-amber-600 shrink-0 mt-0.5" />
                  )}
                  <div>
                    <h4 className="font-black text-sm uppercase tracking-wide">
                      {selectedAnswer === currentQuestion.correctAnswer
                        ? 'Correct! Well Done.'
                        : `Incorrect — Correct Answer is Option (${currentQuestion.correctAnswer})`}
                    </h4>
                    {currentQuestion.explanation && (
                      <p className="text-xs sm:text-sm mt-1 leading-relaxed">
                        <strong>Explanation:</strong> {currentQuestion.explanation}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Bottom Navigation Toolbar: PREVIOUS, NEXT, SUBMIT EXAM */}
        <div className="mt-6 bg-[#FFFDF5] p-4 sm:p-5 rounded-3xl border-3 border-[#86EFAC] shadow-md flex flex-wrap items-center justify-between gap-3">
          {/* PREVIOUS BUTTON */}
          <button
            onClick={handlePrev}
            disabled={currentIndex === 0}
            className={`flex items-center gap-2 px-5 py-3 rounded-2xl font-black text-sm sm:text-base uppercase tracking-wide transition border-2 ${
              currentIndex === 0
                ? 'opacity-40 cursor-not-allowed bg-gray-100 text-gray-500 border-gray-300'
                : 'bg-[#DCFCE7] hover:bg-[#86EFAC] text-[#14532D] border-[#86EFAC] shadow-xs active:scale-95'
            }`}
          >
            <ArrowLeft className="w-5 h-5 text-[#166534]" />
            <span>PREVIOUS</span>
          </button>

          {/* Quick Info Center */}
          <div className="text-center hidden sm:block">
            <span className="text-xs font-black text-[#14532D]">
              Question {currentIndex + 1} of {totalQuestions}
            </span>
            <span className="block text-[11px] text-[#166534] font-medium">
              ROYAL CRESENT CBT
            </span>
          </div>

          <div className="flex items-center gap-2.5">
            {/* NEXT BUTTON */}
            {currentIndex < totalQuestions - 1 ? (
              <button
                onClick={handleNext}
                className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-[#DCFCE7] hover:bg-[#86EFAC] text-[#14532D] font-black text-sm sm:text-base uppercase tracking-wide transition border-2 border-[#86EFAC] shadow-xs active:scale-95"
              >
                <span>NEXT</span>
                <ArrowRight className="w-5 h-5 text-[#166534]" />
              </button>
            ) : null}

            {/* SUBMIT EXAM BUTTON */}
            <button
              onClick={() => setShowSubmitModal(true)}
              className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-[#166534] hover:bg-[#14532D] text-[#FEF9C3] font-black text-sm sm:text-base uppercase tracking-wide transition shadow-md hover:shadow-lg active:scale-95 border-2 border-[#86EFAC]"
            >
              <Send className="w-4 h-4 text-[#86EFAC]" />
              <span>SUBMIT EXAM</span>
            </button>
          </div>
        </div>
      </main>

      {/* Question Palette Drawer / Modal */}
      {showGridDrawer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="w-full max-w-lg bg-[#FFFDF5] rounded-3xl border-3 border-[#166534] p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-[#86EFAC]/60 pb-3">
              <div>
                <h3 className="font-black text-lg text-[#14532D]">
                  QUESTION PALETTE
                </h3>
                <p className="text-xs text-[#166534]">
                  Tap any number to jump directly to that question.
                </p>
              </div>
              <button
                onClick={() => setShowGridDrawer(false)}
                className="px-3 py-1 rounded-xl bg-gray-100 hover:bg-gray-200 text-xs font-bold text-gray-700"
              >
                Close
              </button>
            </div>

            {/* Legend */}
            <div className="flex flex-wrap items-center gap-3 text-xs font-bold pt-1">
              <span className="flex items-center gap-1.5">
                <span className="w-3.5 h-3.5 rounded-md bg-[#166534] inline-block"></span>
                <span>Answered ({answeredCount})</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-3.5 h-3.5 rounded-md bg-white border border-[#86EFAC] inline-block"></span>
                <span>Unanswered ({unansweredCount})</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-3.5 h-3.5 rounded-md bg-amber-300 inline-block"></span>
                <span>Flagged</span>
              </span>
            </div>

            {/* Grid */}
            <div className="grid grid-cols-5 sm:grid-cols-6 gap-2.5 max-h-64 overflow-y-auto p-1">
              {questions.map((q, idx) => {
                const ans = userAnswers[q.id];
                const isCurrent = idx === currentIndex;
                const isFlagged = flaggedQuestions[q.id];

                let bgClass = 'bg-white text-[#14532D] border-2 border-[#86EFAC]';
                if (ans) {
                  bgClass = 'bg-[#166534] text-[#FEF9C3] border-2 border-[#166534] font-black';
                }
                if (isFlagged) {
                  bgClass = 'bg-amber-300 text-amber-950 border-2 border-amber-500 font-black';
                }
                if (isCurrent) {
                  bgClass += ' ring-3 ring-[#FDE047]';
                }

                return (
                  <button
                    key={q.id}
                    onClick={() => handleJumpToQuestion(idx)}
                    className={`h-11 rounded-xl font-bold text-sm flex items-center justify-center transition-all shadow-xs cursor-pointer hover:scale-105 ${bgClass}`}
                  >
                    {idx + 1}
                  </button>
                );
              })}
            </div>

            <button
              onClick={() => setShowGridDrawer(false)}
              className="w-full py-2.5 rounded-xl bg-[#DCFCE7] hover:bg-[#86EFAC] text-[#14532D] font-bold text-sm transition"
            >
              Return to Question {currentIndex + 1}
            </button>
          </div>
        </div>
      )}

      {/* Submit Confirmation Modal */}
      {showSubmitModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="w-full max-w-md bg-[#FFFDF5] rounded-3xl border-4 border-[#166534] p-6 sm:p-7 shadow-2xl text-[#14532D] space-y-5">
            <div className="text-center space-y-2">
              <div className="w-14 h-14 rounded-2xl bg-[#DCFCE7] border-2 border-[#86EFAC] flex items-center justify-center mx-auto text-[#166534]">
                <Send className="w-7 h-7" />
              </div>
              <h3 className="text-xl sm:text-2xl font-black uppercase text-[#14532D]">
                SUBMIT EXAMINATION?
              </h3>
              <p className="text-xs sm:text-sm text-[#166534]">
                Please verify your answers before final submission.
              </p>
            </div>

            {/* Breakdown Card */}
            <div className="bg-[#FEF9C3] p-4 rounded-2xl border-2 border-[#86EFAC] space-y-2 text-xs sm:text-sm font-bold">
              <div className="flex justify-between text-[#14532D]">
                <span>Total Questions:</span>
                <span>{totalQuestions}</span>
              </div>
              <div className="flex justify-between text-[#166534]">
                <span>Questions Answered:</span>
                <span className="font-black">{answeredCount}</span>
              </div>
              <div className="flex justify-between text-rose-700">
                <span>Unanswered Questions:</span>
                <span className="font-black">{unansweredCount}</span>
              </div>
              {unansweredCount > 0 && (
                <p className="text-xs text-rose-600 bg-rose-50 p-2 rounded-lg border border-rose-200 mt-2">
                  ⚠️ You have <strong>{unansweredCount}</strong> unanswered question(s). You can return to answer them.
                </p>
              )}
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={() => setShowSubmitModal(false)}
                className="flex-1 py-3 rounded-2xl bg-white hover:bg-gray-100 text-[#14532D] font-bold text-sm border-2 border-[#86EFAC] transition"
              >
                Keep Answering
              </button>
              <button
                onClick={handleSubmitConfirmed}
                className="flex-1 py-3 rounded-2xl bg-[#166534] hover:bg-[#14532D] text-[#FEF9C3] font-black text-sm uppercase shadow-md transition border-2 border-[#86EFAC]"
              >
                Yes, Submit Now
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Exit Test Warning Modal */}
      {showExitModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="w-full max-w-sm bg-[#FFFDF5] rounded-3xl border-3 border-red-500 p-6 shadow-2xl text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mx-auto text-red-600">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-black text-red-900">
              Leave Examination?
            </h3>
            <p className="text-xs text-red-700">
              Your test progress will not be saved if you leave before submitting.
            </p>
            <div className="flex items-center gap-2 pt-2">
              <button
                onClick={() => setShowExitModal(false)}
                className="flex-1 py-2.5 rounded-xl bg-gray-100 text-gray-800 font-bold text-xs"
              >
                Continue Test
              </button>
              <button
                onClick={onExitExam}
                className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs"
              >
                Exit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
