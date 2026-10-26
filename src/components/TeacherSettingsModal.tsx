/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useRef, useState } from 'react';
import {
  AlertCircle,
  Check,
  CheckCircle2,
  Download,
  FileSpreadsheet,
  FileText,
  KeyRound,
  Lock,
  Plus,
  RefreshCw,
  Search,
  Trash2,
  Upload,
  X,
} from 'lucide-react';
import { storageService } from '../services/storageService';
import { AnswerOption, Question, Subject, Test } from '../types/cbt';

interface TeacherSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onQuestionsUpdated: () => void;
}

export const TeacherSettingsModal: React.FC<TeacherSettingsModalProps> = ({
  isOpen,
  onClose,
  onQuestionsUpdated,
}) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState('');

  const [activeTab, setActiveTab] = useState<'questions' | 'import-export' | 'security'>('questions');
  const [subjects] = useState<Subject[]>(storageService.getSubjects());
  const [tests] = useState<Test[]>(storageService.getTests());
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>(subjects[0]?.id || 'subj-math');
  const [searchQuery, setSearchQuery] = useState('');

  // Add/Edit Question Form State
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
  const [formData, setFormData] = useState({
    testId: tests.find((t) => t.subjectId === selectedSubjectId)?.id || tests[0]?.id || '',
    questionText: '',
    optionA: '',
    optionB: '',
    optionC: '',
    optionD: '',
    correctAnswer: 'A' as AnswerOption,
    explanation: '',
  });

  // Import / Export Feedback
  const [importStatus, setImportStatus] = useState<{ message: string; isError: boolean } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const csvInputRef = useRef<HTMLInputElement>(null);

  // PIN change state
  const [newPin, setNewPin] = useState('');
  const [pinSuccess, setPinSuccess] = useState(false);

  if (!isOpen) return null;

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (storageService.verifyTeacherPin(pinInput)) {
      setIsAuthenticated(true);
      setPinError('');
    } else {
      setPinError('Incorrect PIN. The default teacher PIN is 1234.');
    }
  };

  const currentQuestions = storageService
    .getQuestions()
    .filter((q) => q.subjectId === selectedSubjectId)
    .filter(
      (q) =>
        q.questionText.toLowerCase().includes(searchQuery.toLowerCase()) ||
        q.optionA.toLowerCase().includes(searchQuery.toLowerCase()) ||
        q.optionB.toLowerCase().includes(searchQuery.toLowerCase())
    );

  const handleOpenAddForm = (qToEdit?: Question) => {
    const defaultTestId =
      tests.find((t) => t.subjectId === selectedSubjectId)?.id || tests[0]?.id || '';

    if (qToEdit) {
      setEditingQuestion(qToEdit);
      setFormData({
        testId: qToEdit.testId,
        questionText: qToEdit.questionText,
        optionA: qToEdit.optionA,
        optionB: qToEdit.optionB,
        optionC: qToEdit.optionC,
        optionD: qToEdit.optionD,
        correctAnswer: qToEdit.correctAnswer,
        explanation: qToEdit.explanation || '',
      });
    } else {
      setEditingQuestion(null);
      setFormData({
        testId: defaultTestId,
        questionText: '',
        optionA: '',
        optionB: '',
        optionC: '',
        optionD: '',
        correctAnswer: 'A',
        explanation: '',
      });
    }
    setShowAddForm(true);
  };

  const handleSaveQuestion = (e: React.FormEvent) => {
    e.preventDefault();
    if (
      !formData.questionText.trim() ||
      !formData.optionA.trim() ||
      !formData.optionB.trim() ||
      !formData.optionC.trim() ||
      !formData.optionD.trim()
    ) {
      alert('Please fill in question text and all four options.');
      return;
    }

    if (editingQuestion) {
      storageService.updateQuestion({
        ...editingQuestion,
        ...formData,
        subjectId: selectedSubjectId,
      });
    } else {
      storageService.addQuestion({
        ...formData,
        subjectId: selectedSubjectId,
      });
    }

    setShowAddForm(false);
    onQuestionsUpdated();
  };

  const handleDeleteQuestion = (id: string) => {
    if (confirm('Are you sure you want to delete this question?')) {
      storageService.deleteQuestion(id);
      onQuestionsUpdated();
    }
  };

  // Export JSON
  const handleExportJSON = () => {
    const dataStr = storageService.exportQuestionBank();
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `RoyalCresent_CBT_QuestionBank_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Download Sample CSV
  const handleDownloadSampleCSV = () => {
    const sampleCSV = `Question,OptionA,OptionB,OptionC,OptionD,CorrectAnswer,Explanation
"What is 15 multiplied by 4?","50","60","65","70","B","15 x 4 equals 60."
"Which gas do human beings breathe in for respiration?","Carbon Dioxide","Oxygen","Nitrogen","Hydrogen","B","Oxygen is absorbed in the lungs."`;
    const blob = new Blob([sampleCSV], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'RoyalCresent_Question_Template.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  // Import JSON File
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const res = storageService.importQuestionBank(content);
      if (res.success) {
        setImportStatus({
          message: `Successfully imported ${res.count} questions into the local question bank!`,
          isError: false,
        });
        onQuestionsUpdated();
      } else {
        setImportStatus({
          message: res.error || 'Failed to import questions.',
          isError: true,
        });
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  // Import CSV File
  const handleCSVUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const testId =
      tests.find((t) => t.subjectId === selectedSubjectId)?.id || tests[0]?.id || '';

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const res = storageService.parseCSVQuestions(content, selectedSubjectId, testId);
      if (res.success) {
        setImportStatus({
          message: `Successfully imported ${res.count} questions from CSV!`,
          isError: false,
        });
        onQuestionsUpdated();
      } else {
        setImportStatus({
          message: res.error || 'Failed to import CSV.',
          isError: true,
        });
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleResetDefaults = () => {
    if (confirm('Reset question bank back to Royal Cresent standard default questions? Any newly added questions will be replaced.')) {
      storageService.resetToDefaultQuestionBank();
      setImportStatus({
        message: 'Question bank has been reset to default standard questions.',
        isError: false,
      });
      onQuestionsUpdated();
    }
  };

  const handleChangePin = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPin.trim().length >= 4) {
      storageService.changeTeacherPin(newPin.trim());
      setPinSuccess(true);
      setTimeout(() => setPinSuccess(false), 3000);
      setNewPin('');
    } else {
      alert('PIN must be at least 4 digits.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-3 sm:p-4 animate-in fade-in">
      <div className="w-full max-w-4xl bg-[#FFFDF5] rounded-3xl border-4 border-[#166534] shadow-2xl flex flex-col max-h-[90vh] overflow-hidden text-[#14532D]">
        {/* Modal Top Header */}
        <div className="bg-[#FEF08A] px-6 py-4 border-b-2 border-[#86EFAC] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#166534] flex items-center justify-center text-[#FEF9C3]">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-black text-lg uppercase text-[#14532D]">
                Teacher & Staff Portal
              </h3>
              <p className="text-xs font-semibold text-[#166534]">
                Local Question Bank & Offline Curriculum Management
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

        {/* Auth Gate if not logged in */}
        {!isAuthenticated ? (
          <div className="p-8 sm:p-12 text-center max-w-md mx-auto space-y-6">
            <div className="w-16 h-16 rounded-2xl bg-[#DCFCE7] border-2 border-[#86EFAC] flex items-center justify-center mx-auto text-[#166534]">
              <KeyRound className="w-8 h-8" />
            </div>

            <div>
              <h4 className="text-xl font-black text-[#14532D]">
                Enter Teacher Authorization PIN
              </h4>
              <p className="text-xs sm:text-sm text-[#166534] mt-1 font-medium">
                To prevent student interference, teachers enter PIN to manage questions.
              </p>
              <div className="mt-2 text-xs font-bold bg-[#FEF08A] p-2 rounded-lg border border-[#CA8A04]/30 text-[#14532D]">
                🔑 Default PIN: <strong>1234</strong>
              </div>
            </div>

            <form onSubmit={handleLogin} className="space-y-4">
              <input
                type="password"
                maxLength={8}
                value={pinInput}
                onChange={(e) => setPinInput(e.target.value)}
                placeholder="Enter 4-digit PIN..."
                className="w-full text-center text-2xl tracking-widest font-mono py-3 rounded-2xl bg-[#FEF9C3] border-3 border-[#86EFAC] text-[#14532D] font-black focus:outline-none focus:border-[#166534]"
                autoFocus
              />

              {pinError && (
                <p className="text-xs font-bold text-rose-600 bg-rose-50 p-2 rounded-lg">
                  {pinError}
                </p>
              )}

              <button
                type="submit"
                className="w-full py-3.5 rounded-2xl bg-[#166534] hover:bg-[#14532D] text-[#FEF9C3] font-black uppercase text-sm shadow-md transition"
              >
                Access Question Bank
              </button>
            </form>
          </div>
        ) : (
          /* Authenticated Teacher Panel */
          <div className="flex-1 flex flex-col min-h-0">
            {/* Tabs Bar */}
            <div className="flex border-b border-[#86EFAC]/60 px-6 bg-[#FEF9C3] text-xs font-bold">
              <button
                onClick={() => setActiveTab('questions')}
                className={`py-3 px-4 border-b-3 transition ${
                  activeTab === 'questions'
                    ? 'border-[#166534] text-[#166534] font-black'
                    : 'border-transparent text-[#14532D]/70 hover:text-[#14532D]'
                }`}
              >
                Question Bank
              </button>
              <button
                onClick={() => setActiveTab('import-export')}
                className={`py-3 px-4 border-b-3 transition ${
                  activeTab === 'import-export'
                    ? 'border-[#166534] text-[#166534] font-black'
                    : 'border-transparent text-[#14532D]/70 hover:text-[#14532D]'
                }`}
              >
                Import & Export (Offline)
              </button>
              <button
                onClick={() => setActiveTab('security')}
                className={`py-3 px-4 border-b-3 transition ${
                  activeTab === 'security'
                    ? 'border-[#166534] text-[#166534] font-black'
                    : 'border-transparent text-[#14532D]/70 hover:text-[#14532D]'
                }`}
              >
                Security & PIN
              </button>
            </div>

            {/* Tab 1: Questions Management */}
            {activeTab === 'questions' && (
              <div className="flex-1 p-6 overflow-y-auto space-y-4">
                {/* Subject Selector & Search & Add Button */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-[#166534]">Subject:</span>
                    <select
                      value={selectedSubjectId}
                      onChange={(e) => setSelectedSubjectId(e.target.value)}
                      className="px-3 py-2 rounded-xl bg-[#FEF9C3] border-2 border-[#86EFAC] text-xs sm:text-sm font-bold text-[#14532D] focus:outline-none"
                    >
                      {subjects.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.name} ({s.code})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="relative flex-1 sm:w-56">
                      <Search className="w-3.5 h-3.5 text-[#166534] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search questions..."
                        className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-[#FEF9C3] border border-[#86EFAC] text-xs text-[#14532D] font-bold focus:outline-none"
                      />
                    </div>

                    <button
                      onClick={() => handleOpenAddForm()}
                      className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#166534] hover:bg-[#14532D] text-[#FEF9C3] font-bold text-xs uppercase shadow-xs transition shrink-0"
                    >
                      <Plus className="w-4 h-4 text-[#86EFAC]" />
                      <span>Add Question</span>
                    </button>
                  </div>
                </div>

                {/* Notice regarding sample questions */}
                <div className="bg-[#FEF08A] p-3 rounded-xl border border-[#CA8A04]/30 text-xs font-semibold text-[#14532D] flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-[#CA8A04] shrink-0" />
                  <span>
                    Questions marked <strong>[Sample]</strong> are provided for offline testing and can be customized or replaced with Royal Cresent school questions.
                  </span>
                </div>

                {/* Questions List */}
                <div className="space-y-3">
                  {currentQuestions.map((q, idx) => (
                    <div
                      key={q.id}
                      className="bg-white p-4 rounded-2xl border-2 border-[#86EFAC] shadow-xs space-y-2"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-2">
                          <span className="w-6 h-6 rounded-lg bg-[#DCFCE7] text-[#14532D] font-black text-xs flex items-center justify-center shrink-0">
                            {idx + 1}
                          </span>
                          <span className="font-bold text-sm text-[#14532D]">
                            {q.questionText}
                          </span>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          {q.isSample ? (
                            <span className="px-2 py-0.5 rounded-md bg-amber-100 text-amber-800 text-[10px] font-black border border-amber-300">
                              Sample
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 text-[10px] font-black border border-emerald-300">
                              Royal Cresent
                            </span>
                          )}

                          <button
                            onClick={() => handleOpenAddForm(q)}
                            className="px-2.5 py-1 rounded-lg bg-[#FEF08A] hover:bg-[#FDE047] text-xs font-bold text-[#14532D]"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteQuestion(q.id)}
                            className="p-1 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700"
                            title="Delete"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs pt-1">
                        <div className={`p-2 rounded-lg border ${q.correctAnswer === 'A' ? 'bg-emerald-50 border-emerald-400 font-bold' : 'bg-gray-50 border-gray-200'}`}>
                          <strong>(A)</strong> {q.optionA}
                        </div>
                        <div className={`p-2 rounded-lg border ${q.correctAnswer === 'B' ? 'bg-emerald-50 border-emerald-400 font-bold' : 'bg-gray-50 border-gray-200'}`}>
                          <strong>(B)</strong> {q.optionB}
                        </div>
                        <div className={`p-2 rounded-lg border ${q.correctAnswer === 'C' ? 'bg-emerald-50 border-emerald-400 font-bold' : 'bg-gray-50 border-gray-200'}`}>
                          <strong>(C)</strong> {q.optionC}
                        </div>
                        <div className={`p-2 rounded-lg border ${q.correctAnswer === 'D' ? 'bg-emerald-50 border-emerald-400 font-bold' : 'bg-gray-50 border-gray-200'}`}>
                          <strong>(D)</strong> {q.optionD}
                        </div>
                      </div>
                    </div>
                  ))}

                  {currentQuestions.length === 0 && (
                    <div className="text-center py-8 text-xs font-bold text-[#166534]">
                      No questions found for this subject. Tap "Add Question" above.
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Tab 2: Import & Export */}
            {activeTab === 'import-export' && (
              <div className="flex-1 p-6 overflow-y-auto space-y-6">
                {importStatus && (
                  <div
                    className={`p-4 rounded-2xl text-xs font-bold border ${
                      importStatus.isError
                        ? 'bg-rose-50 border-rose-300 text-rose-800'
                        : 'bg-emerald-50 border-emerald-300 text-emerald-800'
                    }`}
                  >
                    {importStatus.message}
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Export Card */}
                  <div className="bg-white p-5 rounded-3xl border-2 border-[#86EFAC] space-y-3">
                    <div className="w-10 h-10 rounded-xl bg-[#DCFCE7] flex items-center justify-center text-[#166534]">
                      <Download className="w-5 h-5" />
                    </div>
                    <h4 className="font-black text-base text-[#14532D]">
                      Backup & Export Question Bank
                    </h4>
                    <p className="text-xs text-[#166534] font-medium leading-relaxed">
                      Download the entire offline question bank as a JSON file. Use this for backing up or transferring between school tablets and laptops.
                    </p>
                    <button
                      onClick={handleExportJSON}
                      className="w-full py-2.5 rounded-xl bg-[#166534] hover:bg-[#14532D] text-[#FEF9C3] font-bold text-xs uppercase transition shadow-xs"
                    >
                      Export to JSON File
                    </button>
                  </div>

                  {/* Import JSON Card */}
                  <div className="bg-white p-5 rounded-3xl border-2 border-[#86EFAC] space-y-3">
                    <div className="w-10 h-10 rounded-xl bg-[#FEF08A] flex items-center justify-center text-[#14532D]">
                      <Upload className="w-5 h-5" />
                    </div>
                    <h4 className="font-black text-base text-[#14532D]">
                      Import Questions (JSON File)
                    </h4>
                    <p className="text-xs text-[#166534] font-medium leading-relaxed">
                      Load questions from a JSON file created by school staff or teachers. Works completely offline with no network connection.
                    </p>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".json"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="w-full py-2.5 rounded-xl bg-[#DCFCE7] hover:bg-[#86EFAC] text-[#14532D] font-bold text-xs uppercase border border-[#86EFAC] transition"
                    >
                      Choose JSON File
                    </button>
                  </div>

                  {/* Import CSV Card */}
                  <div className="bg-white p-5 rounded-3xl border-2 border-[#86EFAC] space-y-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-800">
                      <FileSpreadsheet className="w-5 h-5" />
                    </div>
                    <h4 className="font-black text-base text-[#14532D]">
                      Import from Excel / CSV
                    </h4>
                    <p className="text-xs text-[#166534] font-medium leading-relaxed">
                      Teachers can write questions in Excel, save as CSV, and import them directly into {subjects.find(s => s.id === selectedSubjectId)?.name}.
                    </p>
                    <div className="flex gap-2">
                      <input
                        ref={csvInputRef}
                        type="file"
                        accept=".csv"
                        onChange={handleCSVUpload}
                        className="hidden"
                      />
                      <button
                        onClick={() => csvInputRef.current?.click()}
                        className="flex-1 py-2.5 rounded-xl bg-[#DCFCE7] hover:bg-[#86EFAC] text-[#14532D] font-bold text-xs uppercase border border-[#86EFAC] transition"
                      >
                        Import CSV
                      </button>
                      <button
                        onClick={handleDownloadSampleCSV}
                        className="py-2.5 px-3 rounded-xl bg-[#FEF9C3] hover:bg-[#FEF08A] text-[#14532D] font-bold text-xs border border-[#86EFAC] transition"
                        title="Download CSV format template"
                      >
                        Template
                      </button>
                    </div>
                  </div>

                  {/* Reset Defaults Card */}
                  <div className="bg-white p-5 rounded-3xl border-2 border-[#86EFAC] space-y-3">
                    <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center text-amber-800">
                      <RefreshCw className="w-5 h-5" />
                    </div>
                    <h4 className="font-black text-base text-[#14532D]">
                      Reset Question Bank
                    </h4>
                    <p className="text-xs text-[#166534] font-medium leading-relaxed">
                      Restore default curriculum questions for Mathematics, English, Sciences, Social Studies, Technology, and Civics.
                    </p>
                    <button
                      onClick={handleResetDefaults}
                      className="w-full py-2.5 rounded-xl bg-amber-100 hover:bg-amber-200 text-amber-900 font-bold text-xs uppercase border border-amber-300 transition"
                    >
                      Reset to Default Questions
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Tab 3: Security & PIN */}
            {activeTab === 'security' && (
              <div className="flex-1 p-6 overflow-y-auto max-w-md mx-auto space-y-6">
                <div className="bg-white p-6 rounded-3xl border-2 border-[#86EFAC] space-y-4">
                  <h4 className="font-black text-base text-[#14532D]">
                    Change Teacher Access PIN
                  </h4>
                  <p className="text-xs text-[#166534] font-medium leading-relaxed">
                    Set a secure PIN for staff to protect question editing from unauthorized student access.
                  </p>

                  <form onSubmit={handleChangePin} className="space-y-3">
                    <input
                      type="password"
                      maxLength={8}
                      value={newPin}
                      onChange={(e) => setNewPin(e.target.value)}
                      placeholder="New PIN (min 4 digits)"
                      className="w-full px-4 py-2.5 rounded-xl bg-[#FEF9C3] border-2 border-[#86EFAC] text-sm font-bold text-[#14532D] focus:outline-none"
                    />

                    {pinSuccess && (
                      <p className="text-xs font-bold text-emerald-700 bg-emerald-50 p-2 rounded-lg">
                        ✓ PIN updated successfully!
                      </p>
                    )}

                    <button
                      type="submit"
                      className="w-full py-2.5 rounded-xl bg-[#166534] hover:bg-[#14532D] text-[#FEF9C3] font-bold text-xs uppercase transition shadow-xs"
                    >
                      Update Teacher PIN
                    </button>
                  </form>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Add / Edit Question Submodal */}
        {showAddForm && (
          <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4 animate-in fade-in">
            <div className="w-full max-w-2xl bg-[#FFFDF5] rounded-3xl border-4 border-[#166534] p-6 shadow-2xl max-h-[88vh] overflow-y-auto space-y-4">
              <div className="flex items-center justify-between border-b pb-3 border-[#86EFAC]">
                <h4 className="font-black text-lg text-[#14532D]">
                  {editingQuestion ? 'Edit Question' : 'Add New Question'}
                </h4>
                <button
                  onClick={() => setShowAddForm(false)}
                  className="p-1 rounded-lg hover:bg-gray-100"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSaveQuestion} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-[#14532D] mb-1">
                    Question Text *
                  </label>
                  <textarea
                    rows={3}
                    value={formData.questionText}
                    onChange={(e) => setFormData({ ...formData, questionText: e.target.value })}
                    placeholder="Enter the examination question..."
                    className="w-full p-3 rounded-xl bg-[#FEF9C3] border-2 border-[#86EFAC] text-sm text-[#14532D] font-bold focus:outline-none"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-[#14532D] mb-1">
                      Option (A) *
                    </label>
                    <input
                      type="text"
                      value={formData.optionA}
                      onChange={(e) => setFormData({ ...formData, optionA: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-[#FEF9C3] border border-[#86EFAC] text-xs font-bold text-[#14532D]"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#14532D] mb-1">
                      Option (B) *
                    </label>
                    <input
                      type="text"
                      value={formData.optionB}
                      onChange={(e) => setFormData({ ...formData, optionB: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-[#FEF9C3] border border-[#86EFAC] text-xs font-bold text-[#14532D]"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#14532D] mb-1">
                      Option (C) *
                    </label>
                    <input
                      type="text"
                      value={formData.optionC}
                      onChange={(e) => setFormData({ ...formData, optionC: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-[#FEF9C3] border border-[#86EFAC] text-xs font-bold text-[#14532D]"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#14532D] mb-1">
                      Option (D) *
                    </label>
                    <input
                      type="text"
                      value={formData.optionD}
                      onChange={(e) => setFormData({ ...formData, optionD: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-[#FEF9C3] border border-[#86EFAC] text-xs font-bold text-[#14532D]"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-[#14532D] mb-1">
                      Correct Answer Option *
                    </label>
                    <select
                      value={formData.correctAnswer}
                      onChange={(e) => setFormData({ ...formData, correctAnswer: e.target.value as AnswerOption })}
                      className="w-full px-3 py-2 rounded-xl bg-[#DCFCE7] border-2 border-[#166534] text-xs font-black text-[#14532D]"
                    >
                      <option value="A">Option (A)</option>
                      <option value="B">Option (B)</option>
                      <option value="C">Option (C)</option>
                      <option value="D">Option (D)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#14532D] mb-1">
                      Assign to Test
                    </label>
                    <select
                      value={formData.testId}
                      onChange={(e) => setFormData({ ...formData, testId: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-[#FEF9C3] border border-[#86EFAC] text-xs font-bold text-[#14532D]"
                    >
                      {tests.filter(t => t.subjectId === selectedSubjectId).map(t => (
                        <option key={t.id} value={t.id}>{t.title}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#14532D] mb-1">
                    Educational Explanation (Optional)
                  </label>
                  <textarea
                    rows={2}
                    value={formData.explanation}
                    onChange={(e) => setFormData({ ...formData, explanation: e.target.value })}
                    placeholder="Explain why this option is correct for Practice Mode learning..."
                    className="w-full p-2.5 rounded-xl bg-[#FEF9C3] border border-[#86EFAC] text-xs text-[#14532D] font-medium"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#86EFAC]/40">
                  <button
                    type="button"
                    onClick={() => setShowAddForm(false)}
                    className="px-4 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-xs font-bold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2.5 rounded-xl bg-[#166534] hover:bg-[#14532D] text-[#FEF9C3] text-xs font-black uppercase shadow-xs"
                  >
                    Save Question
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
