/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { CbtQuestionScreen } from './components/CbtQuestionScreen';
import { HistoryModal } from './components/HistoryModal';
import { OfflineIndicator } from './components/OfflineIndicator';
import { ResultsScreen } from './components/ResultsScreen';
import { SubjectSelectionScreen } from './components/SubjectSelectionScreen';
import { TeacherSettingsModal } from './components/TeacherSettingsModal';
import { TestSelectionScreen } from './components/TestSelectionScreen';
import { WelcomeScreen } from './components/WelcomeScreen';
import { storageService } from './services/storageService';
import { AnswerOption, ExamMode, ExamResult, Question, Subject, Test } from './types/cbt';

type ScreenState = 'welcome' | 'subjects' | 'test-select' | 'exam' | 'results';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<ScreenState>('welcome');
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);
  const [selectedTest, setSelectedTest] = useState<Test | null>(null);
  const [examMode, setExamMode] = useState<ExamMode>('practice');
  const [examQuestions, setExamQuestions] = useState<Question[]>([]);
  const [examDurationMinutes, setExamDurationMinutes] = useState<number>(15);
  const [currentResult, setCurrentResult] = useState<ExamResult | null>(null);

  // Modals
  const [isTeacherModalOpen, setIsTeacherModalOpen] = useState(false);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);

  // 1. Student taps START CBT
  const handleStartCBT = () => {
    setCurrentScreen('subjects');
  };

  // 2. Student selects a subject
  const handleSelectSubject = (subject: Subject) => {
    setSelectedSubject(subject);
    setCurrentScreen('test-select');
  };

  // 3. Student selects test & mode and begins
  const handleStartTest = (test: Test, mode: ExamMode, customMinutes?: number) => {
    setSelectedTest(test);
    setExamMode(mode);
    setExamDurationMinutes(customMinutes || test.durationMinutes || 15);

    const questions = storageService.getQuestionsByTest(test.id);
    setExamQuestions(questions);
    setCurrentScreen('exam');
  };

  // 4. Student finishes and submits
  const handleSubmitExam = (
    userAnswers: Record<string, AnswerOption>,
    timeTakenSeconds: number
  ) => {
    if (!selectedSubject || !selectedTest) return;

    let correctCount = 0;
    let incorrectCount = 0;
    let unansweredCount = 0;

    examQuestions.forEach((q) => {
      const studentAns = userAnswers[q.id];
      if (!studentAns) {
        unansweredCount++;
      } else if (studentAns === q.correctAnswer) {
        correctCount++;
      } else {
        incorrectCount++;
      }
    });

    const totalQuestions = examQuestions.length;
    // Formula required by user prompt: Percentage = (Correct Answers ÷ Total Questions) × 100
    const percentage = totalQuestions > 0 ? (correctCount / totalQuestions) * 100 : 0;

    let grade = 'E';
    let remark = 'Needs Improvement';

    if (percentage >= 75) {
      grade = 'A';
      remark = 'Distinction (Outstanding Work!)';
    } else if (percentage >= 60) {
      grade = 'B';
      remark = 'Very Good (Commendable Effort)';
    } else if (percentage >= 50) {
      grade = 'C';
      remark = 'Credit Pass (Good)';
    } else if (percentage >= 40) {
      grade = 'D';
      remark = 'Fair Pass';
    } else {
      grade = 'E';
      remark = 'Needs Improvement (Practice More)';
    }

    const newResult: Omit<ExamResult, 'id'> = {
      testId: selectedTest.id,
      testTitle: selectedTest.title,
      subjectId: selectedSubject.id,
      subjectName: selectedSubject.name,
      className: selectedTest.className,
      mode: examMode,
      totalQuestions,
      correctAnswers: correctCount,
      incorrectAnswers: incorrectCount,
      unansweredQuestions: unansweredCount,
      score: correctCount,
      percentage,
      grade,
      remark,
      timeTakenSeconds,
      completedAt: new Date().toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }),
      userAnswers,
      questions: examQuestions,
    };

    const savedResult = storageService.saveExamResult(newResult);
    setCurrentResult(savedResult);
    setCurrentScreen('results');
  };

  // 5. Result actions
  const handleRetakeTest = () => {
    if (selectedSubject && selectedTest) {
      const questions = storageService.getQuestionsByTest(selectedTest.id);
      setExamQuestions(questions);
      setCurrentScreen('exam');
    } else {
      setCurrentScreen('subjects');
    }
  };

  const handleSelectAnotherSubject = () => {
    setCurrentScreen('subjects');
  };

  const handleHome = () => {
    setCurrentScreen('welcome');
  };

  return (
    <div className="font-sans min-h-screen bg-[#FEF9C3] text-[#14532D]">
      {/* Offline Toast Notification when offline or network transitions */}
      <OfflineIndicator />

      {/* Screen 1: Welcome Screen */}
      {currentScreen === 'welcome' && (
        <WelcomeScreen
          onStartCBT={handleStartCBT}
          onOpenTeacherSettings={() => setIsTeacherModalOpen(true)}
          onOpenHistory={() => setIsHistoryModalOpen(true)}
        />
      )}

      {/* Screen 2: Subject Selection */}
      {currentScreen === 'subjects' && (
        <SubjectSelectionScreen
          onSelectSubject={handleSelectSubject}
          onBackToWelcome={() => setCurrentScreen('welcome')}
        />
      )}

      {/* Screen 3: Test Selection & Mode Selection */}
      {currentScreen === 'test-select' && selectedSubject && (
        <TestSelectionScreen
          subject={selectedSubject}
          onStartTest={handleStartTest}
          onBackToSubjects={() => setCurrentScreen('subjects')}
        />
      )}

      {/* Screen 4: CBT Question Screen */}
      {currentScreen === 'exam' && selectedSubject && selectedTest && (
        <CbtQuestionScreen
          subject={selectedSubject}
          test={selectedTest}
          mode={examMode}
          questions={examQuestions}
          durationMinutes={examDurationMinutes}
          onSubmitExam={handleSubmitExam}
          onExitExam={() => setCurrentScreen('test-select')}
        />
      )}

      {/* Screen 5: Automatic Results Screen */}
      {currentScreen === 'results' && currentResult && (
        <ResultsScreen
          result={currentResult}
          onRetakeTest={handleRetakeTest}
          onSelectAnotherSubject={handleSelectAnotherSubject}
          onHome={handleHome}
        />
      )}

      {/* Teacher Settings & Question Bank Modal */}
      <TeacherSettingsModal
        isOpen={isTeacherModalOpen}
        onClose={() => setIsTeacherModalOpen(false)}
        onQuestionsUpdated={() => {
          // If a test was selected, refresh questions
          if (selectedTest) {
            setExamQuestions(storageService.getQuestionsByTest(selectedTest.id));
          }
        }}
      />

      {/* History Modal */}
      <HistoryModal
        isOpen={isHistoryModalOpen}
        onClose={() => setIsHistoryModalOpen(false)}
        onSelectResult={(result) => {
          setCurrentResult(result);
          setCurrentScreen('results');
        }}
      />
    </div>
  );
}
