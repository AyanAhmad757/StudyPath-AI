import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { Check, Clock, ChevronRight, Sparkles } from 'lucide-react';

export default function TopicItem({ topic, subjectId, isCurrent }) {
  const navigate = useNavigate();
  const { toggleTopicCompletion } = useApp();

  const handleCheckboxClick = (e) => {
    e.stopPropagation();
    toggleTopicCompletion(subjectId, topic.id);
  };

  const difficultyVariants = {
    Beginner: 'bg-surface-container text-primary',
    Intermediate: 'bg-secondary-fixed text-on-secondary-fixed',
    Advanced: 'bg-primary-fixed text-on-primary-fixed',
  };

  return (
    <div
      onClick={() => navigate(`/study/${subjectId}/topic/${topic.id}`)}
      className={`group flex items-center justify-between p-3 sm:p-4 rounded-lg transition-colors cursor-pointer border ${
        isCurrent
          ? 'bg-[#fef2f2] dark:bg-crimson/10 border-crimson'
          : topic.completed
          ? 'bg-swiss-surface/60 dark:bg-[#1f1f1f]/60 border-swiss-border dark:border-[#262626]'
          : 'bg-white dark:bg-[#171717] border-swiss-border dark:border-[#262626] hover:border-swiss-black dark:hover:border-white'
      }`}
    >
      <div className="flex items-center gap-3.5 min-w-0 pr-3">
        {/* Custom interactive completion checkbox */}
        <button
          type="button"
          onClick={handleCheckboxClick}
          className={`w-4 h-4 rounded flex items-center justify-center shrink-0 transition-colors ${
            topic.completed
              ? 'bg-crimson text-white border border-crimson'
              : 'border border-swiss-border dark:border-[#333333] hover:border-swiss-black dark:hover:border-white text-transparent'
          }`}
          title={topic.completed ? 'Mark incomplete' : 'Mark completed'}
        >
          <Check className="w-3 h-3 stroke-[3]" />
        </button>

        {/* Topic Title */}
        <div className="truncate">
          <div className="flex items-center gap-2">
            <span
              className={`font-headline text-xs sm:text-sm font-bold truncate transition-colors ${
                topic.completed
                  ? 'text-[#737373] line-through font-normal'
                  : 'text-swiss-black dark:text-white group-hover:text-crimson'
              }`}
            >
              {topic.name}
            </span>
            {isCurrent && (
              <span className="shrink-0 inline-flex items-center gap-1 text-[9px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-crimson text-white">
                <Sparkles className="w-2.5 h-2.5" />
                Active
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Meta + Arrow */}
      <div className="flex items-center gap-2.5 sm:gap-4 shrink-0 font-mono">
        <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-swiss-surface dark:bg-[#262626] border border-swiss-border dark:border-[#333333] text-swiss-black dark:text-white hidden sm:inline-block">
          {topic.difficulty}
        </span>

        <div className="flex items-center gap-1 text-[11px] text-[#737373] tabular-nums">
          <Clock className="w-3.5 h-3.5" />
          <span className="hidden xs:inline">{topic.estimatedTime}</span>
        </div>

        <ChevronRight className="w-4 h-4 text-[#737373] group-hover:text-crimson group-hover:translate-x-0.5 transition-transform" />
      </div>
    </div>
  );
}
