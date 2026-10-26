/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type ClassLevel = 'primary' | 'junior' | 'senior' | 'all';

export type AnswerOption = 'A' | 'B' | 'C' | 'D';

export type ExamMode = 'practice' | 'exam';

export interface Question {
  id: string;
  subjectId: string;
  testId: string;
  questionNumber?: number;
  questionText: string;
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
  correctAnswer: AnswerOption;
  explanation?: string;
  isSample?: boolean;
}

export interface Test {
  id: string;
  subjectId: string;
  title: string;
  description: string;
  classLevel: ClassLevel;
  className: string;
  durationMinutes: number;
  questionCount: number;
  instructions: string;
}

export interface Subject {
  id: string;
  name: string;
  code: string;
  iconName: string;
  classLevel: ClassLevel;
  description: string;
}

export interface ExamResult {
  id: string;
  testId: string;
  testTitle: string;
  subjectId: string;
  subjectName: string;
  className: string;
  mode: ExamMode;
  totalQuestions: number;
  correctAnswers: number;
  incorrectAnswers: number;
  unansweredQuestions: number;
  score: number;
  percentage: number;
  grade: string;
  remark: string;
  timeTakenSeconds: number;
  completedAt: string;
  userAnswers: Record<string, AnswerOption>;
  questions: Question[];
}

export interface QuestionBankImport {
  version: string;
  subjects?: Subject[];
  tests?: Test[];
  questions: Question[];
}
