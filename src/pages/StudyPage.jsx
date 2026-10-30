import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import SubjectCard from '../components/study/SubjectCard';
import Button from '../components/common/Button';
import { EmptyState } from '../components/common/EmptyState';
import { Plus, Search, BookOpen } from 'lucide-react';

export default function StudyPage() {
  const { subjects, stats, loadingSubjects } = useApp();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');

  const filteredSubjects = subjects.filter(
    (s) =>
      s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 sm:space-y-8 animate-fadeIn">
      {/* Top Banner & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-mono uppercase tracking-widest text-crimson bg-[#fef2f2] dark:bg-crimson/10 border border-crimson/20 px-2 py-0.5 rounded">
              Curriculum Core
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-headline font-bold text-swiss-black dark:text-white tracking-tight">
            Curriculum Hub
          </h1>
          <p className="text-xs sm:text-sm text-[#737373] mt-0.5">
            Institutional syllabus breakdown, AI-verified topic units, and academic references.
          </p>
        </div>

        <Button
          onClick={() => navigate('/study/upload')}
          variant="primary"
          size="lg"
          icon={Plus}
          className="self-start sm:self-auto"
        >
          Upload Syllabus
        </Button>
      </div>

      {/* Quick Summary Pill Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 sm:p-5 rounded-lg bg-white dark:bg-[#171717] border border-swiss-border dark:border-[#262626]">
        <div className="p-2">
          <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#737373] block mb-0.5">Enrolled Courses</span>
          <span className="text-xl font-headline font-bold text-swiss-black dark:text-white tabular-nums">{subjects.length} Subjects</span>
        </div>
        <div className="p-2 border-l border-swiss-border dark:border-[#262626] pl-4">
          <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#737373] block mb-0.5">Total Units</span>
          <span className="text-xl font-headline font-bold text-swiss-black dark:text-white tabular-nums">
            {subjects.reduce((acc, curr) => acc + (curr.unitsCount || 0), 0)} Units
          </span>
        </div>
        <div className="p-2 border-l border-swiss-border dark:border-[#262626] pl-4">
          <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#737373] block mb-0.5">Verified Topics</span>
          <span className="text-xl font-headline font-bold text-crimson tabular-nums">
            {stats.topicsCompleted || 0} Done
          </span>
        </div>
        <div className="p-2 border-l border-swiss-border dark:border-[#262626] pl-4">
          <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#737373] block mb-0.5">Telemetry Rate</span>
          <span className="text-xl font-headline font-bold text-swiss-black dark:text-white tabular-nums">
            {stats.overallProgress || 0}%
          </span>
        </div>
      </div>

      {/* Search and Filters */}
      {subjects.length > 0 && (
        <div className="flex items-center gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-[#737373] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search curriculum by code or title (e.g., 'CS601')..."
              className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-[#171717] rounded-lg border border-swiss-border dark:border-[#262626] text-xs sm:text-sm text-swiss-black dark:text-white placeholder-[#a3a3a3] focus:outline-none focus:border-swiss-black dark:focus:border-white transition-colors"
            />
          </div>
        </div>
      )}

      {/* Subject Cards Grid or Empty State */}
      {filteredSubjects.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredSubjects.map((subject) => (
            <SubjectCard key={subject.id} subject={subject} />
          ))}
        </div>
      ) : (
        <EmptyState
          icon={BookOpen}
          title="No syllabus yet."
          description="Upload your semester university syllabus PDF or Word document. Friday AI will automatically extract units, generate topic breakdowns, and curate video lectures."
          actionText="Upload Syllabus"
          onAction={() => navigate('/study/upload')}
          className="py-12"
        />
      )}
    </div>
  );
}
