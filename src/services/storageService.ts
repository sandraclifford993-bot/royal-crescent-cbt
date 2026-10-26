/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { DEFAULT_QUESTIONS, DEFAULT_SUBJECTS, DEFAULT_TESTS } from '../data/defaultQuestions';
import { ExamResult, Question, Subject, Test } from '../types/cbt';

const STORAGE_KEYS = {
  SUBJECTS: 'rc_cbt_subjects_v1',
  TESTS: 'rc_cbt_tests_v1',
  QUESTIONS: 'rc_cbt_questions_v1',
  RESULTS: 'rc_cbt_results_v1',
  TEACHER_PIN: 'rc_cbt_teacher_pin_v1',
};

class StorageService {
  constructor() {
    this.ensureInitialized();
  }

  private ensureInitialized() {
    if (typeof window === 'undefined') return;

    try {
      if (!localStorage.getItem(STORAGE_KEYS.SUBJECTS)) {
        localStorage.setItem(STORAGE_KEYS.SUBJECTS, JSON.stringify(DEFAULT_SUBJECTS));
      }
      if (!localStorage.getItem(STORAGE_KEYS.TESTS)) {
        localStorage.setItem(STORAGE_KEYS.TESTS, JSON.stringify(DEFAULT_TESTS));
      }
      if (!localStorage.getItem(STORAGE_KEYS.QUESTIONS)) {
        localStorage.setItem(STORAGE_KEYS.QUESTIONS, JSON.stringify(DEFAULT_QUESTIONS));
      }
      if (!localStorage.getItem(STORAGE_KEYS.RESULTS)) {
        localStorage.setItem(STORAGE_KEYS.RESULTS, JSON.stringify([]));
      }
      if (!localStorage.getItem(STORAGE_KEYS.TEACHER_PIN)) {
        localStorage.setItem(STORAGE_KEYS.TEACHER_PIN, '1234'); // Default teacher PIN
      }
    } catch {
      // Local storage fallback
    }
  }

  // --- SUBJECTS ---
  public getSubjects(): Subject[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.SUBJECTS);
      if (data) {
        return JSON.parse(data);
      }
    } catch {
      // Return default
    }
    return DEFAULT_SUBJECTS;
  }

  public getSubjectById(subjectId: string): Subject | undefined {
    const subjects = this.getSubjects();
    return subjects.find((s) => s.id === subjectId);
  }

  // --- TESTS ---
  public getTests(): Test[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.TESTS);
      if (data) {
        return JSON.parse(data);
      }
    } catch {
      // Return default
    }
    return DEFAULT_TESTS;
  }

  public getTestsBySubject(subjectId: string): Test[] {
    const tests = this.getTests();
    return tests.filter((t) => t.subjectId === subjectId);
  }

  public getTestById(testId: string): Test | undefined {
    const tests = this.getTests();
    return tests.find((t) => t.id === testId);
  }

  // --- QUESTIONS ---
  public getQuestions(): Question[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.QUESTIONS);
      if (data) {
        return JSON.parse(data);
      }
    } catch {
      // Return default
    }
    return DEFAULT_QUESTIONS;
  }

  public getQuestionsByTest(testId: string): Question[] {
    const questions = this.getQuestions();
    const filtered = questions.filter((q) => q.testId === testId);
    if (filtered.length > 0) return filtered;

    // Fallback if testId is missing or dynamic, filter by test's subject
    const test = this.getTestById(testId);
    if (test) {
      return questions.filter((q) => q.subjectId === test.subjectId);
    }
    return [];
  }

  public addQuestion(question: Omit<Question, 'id'>): Question {
    const questions = this.getQuestions();
    const newQuestion: Question = {
      ...question,
      id: `custom-q-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      isSample: false,
    };
    questions.push(newQuestion);
    try {
      localStorage.setItem(STORAGE_KEYS.QUESTIONS, JSON.stringify(questions));
      this.updateTestQuestionCount(newQuestion.testId);
    } catch {
      // Ignore
    }
    return newQuestion;
  }

  public updateQuestion(updatedQuestion: Question): boolean {
    const questions = this.getQuestions();
    const index = questions.findIndex((q) => q.id === updatedQuestion.id);
    if (index === -1) return false;

    questions[index] = { ...updatedQuestion, isSample: false };
    try {
      localStorage.setItem(STORAGE_KEYS.QUESTIONS, JSON.stringify(questions));
      return true;
    } catch {
      return false;
    }
  }

  public deleteQuestion(questionId: string): boolean {
    const questions = this.getQuestions();
    const questionToDelete = questions.find((q) => q.id === questionId);
    const filtered = questions.filter((q) => q.id !== questionId);
    try {
      localStorage.setItem(STORAGE_KEYS.QUESTIONS, JSON.stringify(filtered));
      if (questionToDelete) {
        this.updateTestQuestionCount(questionToDelete.testId);
      }
      return true;
    } catch {
      return false;
    }
  }

  private updateTestQuestionCount(testId: string) {
    const tests = this.getTests();
    const test = tests.find((t) => t.id === testId);
    if (!test) return;

    const count = this.getQuestionsByTest(testId).length;
    test.questionCount = count;
    try {
      localStorage.setItem(STORAGE_KEYS.TESTS, JSON.stringify(tests));
    } catch {
      // Ignore
    }
  }

  // --- RESULTS ---
  public saveExamResult(result: Omit<ExamResult, 'id'>): ExamResult {
    const newResult: ExamResult = {
      ...result,
      id: `res-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    };

    try {
      const results = this.getExamResults();
      results.unshift(newResult);
      // Keep last 100 results locally
      const trimmed = results.slice(0, 100);
      localStorage.setItem(STORAGE_KEYS.RESULTS, JSON.stringify(trimmed));
    } catch {
      // Ignore
    }

    return newResult;
  }

  public getExamResults(): ExamResult[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.RESULTS);
      if (data) {
        return JSON.parse(data);
      }
    } catch {
      // Ignore
    }
    return [];
  }

  public clearExamResults() {
    try {
      localStorage.setItem(STORAGE_KEYS.RESULTS, JSON.stringify([]));
    } catch {
      // Ignore
    }
  }

  // --- IMPORT / EXPORT & RESET ---
  public exportQuestionBank(): string {
    const exportData = {
      schoolName: 'ROYAL CRESENT CBT CENTRE',
      version: '1.0',
      exportedAt: new Date().toISOString(),
      subjects: this.getSubjects(),
      tests: this.getTests(),
      questions: this.getQuestions(),
    };
    return JSON.stringify(exportData, null, 2);
  }

  public importQuestionBank(jsonContent: string): { success: boolean; count: number; error?: string } {
    try {
      const data = JSON.parse(jsonContent);

      if (!data || !Array.isArray(data.questions)) {
        return { success: false, count: 0, error: 'Invalid file format. File must contain a "questions" array.' };
      }

      const validQuestions: Question[] = [];
      for (const item of data.questions) {
        if (
          item.questionText &&
          item.optionA &&
          item.optionB &&
          item.optionC &&
          item.optionD &&
          ['A', 'B', 'C', 'D'].includes(item.correctAnswer)
        ) {
          validQuestions.push({
            id: item.id || `imported-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
            subjectId: item.subjectId || 'subj-math',
            testId: item.testId || 'test-math-primary',
            questionText: String(item.questionText).trim(),
            optionA: String(item.optionA).trim(),
            optionB: String(item.optionB).trim(),
            optionC: String(item.optionC).trim(),
            optionD: String(item.optionD).trim(),
            correctAnswer: item.correctAnswer as 'A' | 'B' | 'C' | 'D',
            explanation: item.explanation ? String(item.explanation).trim() : '',
            isSample: false,
          });
        }
      }

      if (validQuestions.length === 0) {
        return { success: false, count: 0, error: 'No valid questions found with options A, B, C, D and correct answer.' };
      }

      const existing = this.getQuestions();
      // Replace questions or merge
      const updated = [...existing, ...validQuestions];
      localStorage.setItem(STORAGE_KEYS.QUESTIONS, JSON.stringify(updated));

      if (Array.isArray(data.subjects) && data.subjects.length > 0) {
        const existingSubjects = this.getSubjects();
        const mergedSubjects = [...existingSubjects];
        for (const s of data.subjects) {
          if (!mergedSubjects.some((ms) => ms.id === s.id)) {
            mergedSubjects.push(s);
          }
        }
        localStorage.setItem(STORAGE_KEYS.SUBJECTS, JSON.stringify(mergedSubjects));
      }

      if (Array.isArray(data.tests) && data.tests.length > 0) {
        const existingTests = this.getTests();
        const mergedTests = [...existingTests];
        for (const t of data.tests) {
          if (!mergedTests.some((mt) => mt.id === t.id)) {
            mergedTests.push(t);
          }
        }
        localStorage.setItem(STORAGE_KEYS.TESTS, JSON.stringify(mergedTests));
      }

      return { success: true, count: validQuestions.length };
    } catch (err) {
      return { success: false, count: 0, error: (err as Error).message || 'Failed to parse JSON file.' };
    }
  }

  public parseCSVQuestions(csvContent: string, subjectId: string, testId: string): { success: boolean; count: number; error?: string } {
    try {
      const lines = csvContent.split(/\r?\n/).filter((l) => l.trim().length > 0);
      if (lines.length < 2) {
        return { success: false, count: 0, error: 'CSV file is empty or missing data rows.' };
      }

      // Expected columns: Question,OptionA,OptionB,OptionC,OptionD,CorrectAnswer,Explanation
      const newQuestions: Question[] = [];
      const dataRows = lines.slice(1);

      for (let i = 0; i < dataRows.length; i++) {
        const row = dataRows[i];
        // Parse CSV accounting for simple quotes
        const match = row.match(/(".*?"|[^",\s]+)(?=\s*,|\s*$)/g);
        const parts = row.split(',').map((p) => p.trim().replace(/^"|"$/g, ''));

        if (parts.length >= 6) {
          const [qText, optA, optB, optC, optD, correct, explanation] = parts;
          const cleanedCorrect = correct?.trim().toUpperCase();
          if (['A', 'B', 'C', 'D'].includes(cleanedCorrect)) {
            newQuestions.push({
              id: `csv-${Date.now()}-${i}`,
              subjectId,
              testId,
              questionText: qText,
              optionA: optA,
              optionB: optB,
              optionC: optC,
              optionD: optD,
              correctAnswer: cleanedCorrect as 'A' | 'B' | 'C' | 'D',
              explanation: explanation || '',
              isSample: false,
            });
          }
        }
      }

      if (newQuestions.length === 0) {
        return {
          success: false,
          count: 0,
          error: 'No valid rows found. Please ensure format: Question,OptionA,OptionB,OptionC,OptionD,CorrectAnswer,Explanation',
        };
      }

      const existing = this.getQuestions();
      localStorage.setItem(STORAGE_KEYS.QUESTIONS, JSON.stringify([...existing, ...newQuestions]));
      this.updateTestQuestionCount(testId);

      return { success: true, count: newQuestions.length };
    } catch (err) {
      return { success: false, count: 0, error: (err as Error).message || 'Failed to parse CSV file.' };
    }
  }

  public resetToDefaultQuestionBank() {
    try {
      localStorage.setItem(STORAGE_KEYS.SUBJECTS, JSON.stringify(DEFAULT_SUBJECTS));
      localStorage.setItem(STORAGE_KEYS.TESTS, JSON.stringify(DEFAULT_TESTS));
      localStorage.setItem(STORAGE_KEYS.QUESTIONS, JSON.stringify(DEFAULT_QUESTIONS));
    } catch {
      // Ignore
    }
  }

  // --- TEACHER PIN ---
  public verifyTeacherPin(pin: string): boolean {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.TEACHER_PIN) || '1234';
      return stored === pin;
    } catch {
      return pin === '1234';
    }
  }

  public changeTeacherPin(newPin: string): boolean {
    try {
      localStorage.setItem(STORAGE_KEYS.TEACHER_PIN, newPin);
      return true;
    } catch {
      return false;
    }
  }
}

export const storageService = new StorageService();
