import React from 'react';
import { useNavigate } from 'react-router-dom';
import ProgressBar from '../common/ProgressBar';
import {
  Network,
  Cpu,
  Cloud,
  Code,
  BookOpen,
  ArrowRight,
  Clock,
  CheckCircle2,
} from 'lucide-react';

export default function SubjectCard({ subject }) {
  const navigate = useNavigate();

  const iconMap = {
    Network: Network,
    Cpu: Cpu,
    Cloud: Cloud,
    Code: Code,
    BookOpen: BookOpen,
  };

  const Icon = iconMap[subject.iconName] || BookOpen;

  return (
    <div
      onClick={() => navigate(`/study/${subject.id}`)}
      className="bg-white dark:bg-[#171717] rounded-lg p-5 sm:p-6 border border-swiss-border dark:border-[#262626] hover:border-swiss-black dark:hover:border-white transition-all cursor-pointer flex flex-col justify-between group"
    >
      <div>
        {/* Top bar */}
        <div className="flex items-start justify-between gap-2 mb-3.5">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded bg-swiss-surface dark:bg-[#262626] border border-swiss-border dark:border-[#333333] text-swiss-black dark:text-white font-bold">
              {subject.code || 'CS601'}
            </span>
            <span className="text-xs text-[#737373] font-mono">
              {subject.semester || '6th Sem'}
            </span>
          </div>
          <div className="w-8 h-8 rounded-lg bg-swiss-surface dark:bg-[#262626] border border-swiss-border dark:border-[#333333] flex items-center justify-center text-swiss-black dark:text-white shrink-0">
            <Icon className="w-4 h-4" />
          </div>
        </div>

        {/* Title and description */}
        <h3 className="font-headline text-base sm:text-lg font-bold text-swiss-black dark:text-white group-hover:text-crimson transition-colors mb-1.5 tracking-tight">
          {subject.name}
        </h3>
        <p className="text-xs text-[#737373] line-clamp-2 leading-relaxed mb-4">
          {subject.description}
        </p>

        {/* Units and Topics */}
        <div className="flex items-center gap-4 text-xs text-[#737373] mb-4 pb-3 border-b border-swiss-border dark:border-[#262626]">
          <div className="flex items-center gap-1.5">
            <BookOpen className="w-3.5 h-3.5 text-swiss-black dark:text-white" />
            <span className="tabular-nums font-mono">{subject.unitsCount} Units</span>
          </div>
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-crimson" />
            <span className="tabular-nums font-mono">{subject.completedTopics} / {subject.topicsCount} Done</span>
          </div>
        </div>
      </div>

      {/* Progress & Action */}
      <div>
        <ProgressBar
          value={subject.progress}
          showLabel
          label="Curriculum Coverage"
          variant="crimson"
          className="mb-3.5"
        />

        <div className="flex items-center justify-between text-xs pt-1">
          <span className="text-[#737373] flex items-center gap-1 font-mono text-[11px]">
            <Clock className="w-3.5 h-3.5" />
            {subject.lastStudied || 'Recently'}
          </span>
          <span className="font-mono text-xs font-bold text-crimson uppercase tracking-wider flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
            Examine
            <ArrowRight className="w-3.5 h-3.5" />
          </span>
        </div>
      </div>
    </div>
  );
}
