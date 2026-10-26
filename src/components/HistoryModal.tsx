/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Award, Calendar, CheckCircle2, Clock, History, Trash2, X, XCircle } from 'lucide-react';
import { storageService } from '../services/storageService';
import { ExamResult } from '../types/cbt';

interface HistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectResult: (result: ExamResult) => void;
}

export const HistoryModal: React.FC<HistoryModalProps> = ({
  isOpen,
  onClose,
  onSelectResult,
}) => {
  const [results, setResults] = useState<ExamResult[]>(storageService.getExamResults());

  if (!isOpen) return null;

  const handleClearHistory = () => {
    if (confirm('Clear all saved test history on this device?')) {
      storageService.clearExamResults();
      setResults([]);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in">
      <div className="w-full max-w-2xl bg-[#FFFDF5] rounded-3xl border-4 border-[#166534] shadow-2xl flex flex-col max-h-[85vh] overflow-hidden text-[#14532D]">
        <div className="bg-[#FEF08A] px-6 py-4 border-b-2 border-[#86EFAC] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#166534] flex items-center justify-center text-[#FEF9C3]">
              <History className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-black text-lg uppercase text-[#14532D]">
                Past Examination Results
              </h3>
              <p className="text-xs font-semibold text-[#166534]">
                Locally stored test records for Royal Cresent CBT
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-black/10 text-[#14532D] transition"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="flex-1 p-6 overflow-y-auto space-y-4">
          {results.length > 0 ? (
            <>
              <div className="flex items-center justify-between text-xs font-bold text-[#166534] pb-2 border-b border-[#86EFAC]/40">
                <span>Total Recorded Tests: {results.length}</span>
                <button
                  onClick={handleClearHistory}
                  className="flex items-center gap-1 text-rose-700 hover:text-rose-900"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Clear History</span>
                </button>
              </div>

              <div className="space-y-3">
                {results.map((res) => (
                  <div
                    key={res.id}
                    onClick={() => {
                      onSelectResult(res);
                      onClose();
                    }}
                    className="p-4 rounded-2xl bg-white border-2 border-[#86EFAC] hover:border-[#166534] shadow-xs hover:shadow-md transition cursor-pointer flex items-center justify-between gap-4 group"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-black text-base text-[#14532D]">
                          {res.subjectName}
                        </span>
                        <span className="px-2 py-0.5 rounded-md bg-[#FEF08A] text-[#14532D] font-bold text-[10px] uppercase">
                          {res.mode}
                        </span>
                      </div>
                      <p className="text-xs text-[#166534] font-medium mt-0.5">
                        {res.testTitle}
                      </p>
                      <div className="flex items-center gap-3 text-[11px] text-[#166534]/80 mt-2 font-semibold">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {res.completedAt}
                        </span>
                        <span>•</span>
                        <span>
                          {res.correctAnswers} / {res.totalQuestions} Correct
                        </span>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <div className="text-2xl font-black text-[#14532D]">
                        {res.percentage.toFixed(0)}%
                      </div>
                      <span className="inline-block px-2.5 py-0.5 rounded-md bg-[#166534] text-white text-xs font-black">
                        Grade {res.grade}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="text-center py-12 space-y-3">
              <Award className="w-12 h-12 text-[#166534]/40 mx-auto" />
              <p className="text-sm font-bold text-[#14532D]">
                No completed test records found yet.
              </p>
              <p className="text-xs text-[#166534]">
                Take a test in Practice or Examination mode to see your results recorded here.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
