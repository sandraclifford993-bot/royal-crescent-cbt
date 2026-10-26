/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  ArrowLeft,
  BookOpen,
  Calculator,
  ChevronRight,
  GraduationCap,
  Microscope,
  Monitor,
  ShieldCheck,
  Users,
  Wheat,
  Wrench,
  Search,
} from 'lucide-react';
import { storageService } from '../services/storageService';
import { ClassLevel, Subject } from '../types/cbt';
import { SchoolHeader } from './SchoolHeader';
import { voiceService } from '../services/voiceService';

interface SubjectSelectionScreenProps {
  onSelectSubject: (subject: Subject) => void;
  onBackToWelcome: () => void;
}

export const SubjectSelectionScreen: React.FC<SubjectSelectionScreenProps> = ({
  onSelectSubject,
  onBackToWelcome,
}) => {
  const [subjects] = useState<Subject[]>(storageService.getSubjects());
  const [tests] = useState(storageService.getTests());
  const [selectedLevel, setSelectedLevel] = useState<ClassLevel>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isMuted, setIsMuted] = useState(voiceService.getIsMuted());

  const handleToggleVoice = () => {
    setIsMuted(voiceService.toggleMute());
  };

  const getSubjectIcon = (iconName: string) => {
    switch (iconName) {
      case 'Calculator':
        return <Calculator className="w-8 h-8 text-[#14532D]" />;
      case 'BookOpen':
        return <BookOpen className="w-8 h-8 text-[#14532D]" />;
      case 'Microscope':
        return <Microscope className="w-8 h-8 text-[#14532D]" />;
      case 'Wrench':
        return <Wrench className="w-8 h-8 text-[#14532D]" />;
      case 'Users':
        return <Users className="w-8 h-8 text-[#14532D]" />;
      case 'ShieldCheck':
        return <ShieldCheck className="w-8 h-8 text-[#14532D]" />;
      case 'Monitor':
        return <Monitor className="w-8 h-8 text-[#14532D]" />;
      case 'Wheat':
        return <Wheat className="w-8 h-8 text-[#14532D]" />;
      default:
        return <GraduationCap className="w-8 h-8 text-[#14532D]" />;
    }
  };

  const filteredSubjects = subjects.filter((subj) => {
    const matchesLevel =
      selectedLevel === 'all' ||
      subj.classLevel === 'all' ||
      subj.classLevel === selectedLevel;

    const matchesSearch =
      subj.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      subj.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      subj.description.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesLevel && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-[#FEF9C3] flex flex-col text-[#14532D] selection:bg-[#86EFAC]">
      {/* Permanent Header */}
      <SchoolHeader
        subtitle="Subject Selection • Choose Your Examination Subject"
        isMuted={isMuted}
        onToggleVoice={handleToggleVoice}
        rightAction={
          <button
            onClick={onBackToWelcome}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/80 hover:bg-white text-[#14532D] font-bold text-xs sm:text-sm border border-[#86EFAC] transition shadow-xs"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Home</span>
          </button>
        }
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-6xl w-full mx-auto p-4 sm:p-6 md:p-8 space-y-6">
        {/* Title & Filter Bar */}
        <div className="bg-[#FFFDF5] p-5 sm:p-6 rounded-3xl border-3 border-[#86EFAC] shadow-md space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="text-xs font-black text-[#166534] uppercase tracking-wider bg-[#DCFCE7] px-3 py-1 rounded-full border border-[#86EFAC]">
                Step 1 of 3: Subject
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-[#14532D] mt-2">
                SELECT EXAMINATION SUBJECT
              </h2>
              <p className="text-xs sm:text-sm text-[#166534] font-medium">
                Tap any subject below to view its available tests and practice papers.
              </p>
            </div>

            {/* Search Input */}
            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 text-[#166534] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search subject..."
                className="w-full pl-9 pr-4 py-2 rounded-xl bg-[#FEF9C3] border-2 border-[#86EFAC] text-xs sm:text-sm text-[#14532D] font-bold placeholder-[#166534]/50 focus:outline-none focus:border-[#166534]"
              />
            </div>
          </div>

          {/* Level Filter Tabs */}
          <div className="flex flex-wrap gap-2 pt-2 border-t border-[#86EFAC]/40">
            <span className="text-xs font-bold text-[#166534] self-center mr-2">Filter Level:</span>
            {[
              { id: 'all', label: 'All Classes' },
              { id: 'primary', label: 'Primary School' },
              { id: 'junior', label: 'Junior Secondary (JSS)' },
              { id: 'senior', label: 'Senior Secondary (SSS)' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setSelectedLevel(tab.id as ClassLevel)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition shadow-xs ${
                  selectedLevel === tab.id
                    ? 'bg-[#166534] text-[#FEF9C3] border-2 border-[#86EFAC]'
                    : 'bg-[#DCFCE7] text-[#14532D] hover:bg-[#86EFAC] border border-[#86EFAC]/50'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Subjects Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {filteredSubjects.map((subject) => {
            const subjectTests = tests.filter((t) => t.subjectId === subject.id);
            const questionCount = storageService
              .getQuestions()
              .filter((q) => q.subjectId === subject.id).length;

            return (
              <div
                key={subject.id}
                onClick={() => {
                  voiceService.playChime('click');
                  onSelectSubject(subject);
                }}
                className="bg-[#FFFDF5] rounded-3xl border-3 border-[#86EFAC] hover:border-[#166534] shadow-md hover:shadow-xl transition-all duration-200 p-5 sm:p-6 flex flex-col justify-between cursor-pointer group transform hover:-translate-y-1 active:translate-y-0 text-left"
              >
                <div>
                  {/* Top Subject Badge & Icon */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-14 h-14 rounded-2xl bg-[#DCFCE7] group-hover:bg-[#86EFAC] border-2 border-[#86EFAC] flex items-center justify-center transition-colors shadow-xs">
                      {getSubjectIcon(subject.iconName)}
                    </div>
                    <span className="px-3 py-1 rounded-full bg-[#FEF08A] border border-[#CA8A04]/40 font-black text-xs text-[#14532D]">
                      {subject.code}
                    </span>
                  </div>

                  {/* Subject Details */}
                  <h3 className="text-lg sm:text-xl font-black text-[#14532D] group-hover:text-[#166534] transition">
                    {subject.name}
                  </h3>
                  <p className="text-xs text-[#166534] font-medium mt-1 line-clamp-2">
                    {subject.description}
                  </p>
                </div>

                {/* Bottom Meta & Action */}
                <div className="mt-5 pt-4 border-t border-[#86EFAC]/40 flex items-center justify-between">
                  <div className="text-[11px] font-bold text-[#166534]">
                    <span>{subjectTests.length} test{subjectTests.length !== 1 ? 's' : ''}</span>
                    <span className="mx-1.5">•</span>
                    <span>{questionCount} questions</span>
                  </div>

                  <div className="flex items-center gap-1 text-xs font-black text-[#166534] group-hover:text-[#14532D] group-hover:translate-x-1 transition-all">
                    <span>SELECT</span>
                    <ChevronRight className="w-4 h-4 text-[#166534]" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {filteredSubjects.length === 0 && (
          <div className="bg-[#FFFDF5] rounded-3xl border-2 border-[#86EFAC] p-12 text-center">
            <p className="text-sm font-bold text-[#166534]">
              No subjects found matching "{searchQuery}".
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedLevel('all');
              }}
              className="mt-3 px-4 py-2 bg-[#DCFCE7] text-[#14532D] rounded-xl text-xs font-bold border border-[#86EFAC]"
            >
              Reset Filters
            </button>
          </div>
        )}
      </main>
    </div>
  );
};
