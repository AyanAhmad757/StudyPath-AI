import React, { useState } from 'react';
import TopicItem from './TopicItem';
import ProgressBar from '../common/ProgressBar';
import { ChevronDown, ChevronUp } from 'lucide-react';

export default function UnitAccordion({ unit, subjectId, defaultOpen = true }) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="bg-white dark:bg-[#171717] rounded-lg border border-swiss-border dark:border-[#262626] overflow-hidden mb-4 transition-colors">
      {/* Accordion Header */}
      <div
        onClick={() => setIsOpen(!isOpen)}
        className="p-4 sm:p-5 cursor-pointer select-none hover:bg-swiss-surface dark:hover:bg-[#1f1f1f] transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-swiss-border dark:border-[#262626]"
      >
        <div className="flex items-start sm:items-center gap-3.5">
          <div className="w-9 h-9 rounded-lg bg-swiss-surface dark:bg-[#262626] border border-swiss-border dark:border-[#333333] text-swiss-black dark:text-white font-mono font-bold flex items-center justify-center shrink-0 text-xs">
            U{unit.unitNumber}
          </div>
          <div>
            <div className="flex items-center gap-2 font-mono">
              <span className="text-[10px] uppercase font-bold tracking-wider text-crimson">
                Unit {unit.unitNumber}
              </span>
              <span className="text-swiss-border dark:text-[#333333]">•</span>
              <span className="text-[11px] text-[#737373] tabular-nums">
                {unit.topicsCount} Topics
              </span>
            </div>
            <h3 className="font-headline text-sm sm:text-base font-bold text-swiss-black dark:text-white tracking-tight">
              {unit.title}
            </h3>
          </div>
        </div>

        {/* Right side: Progress & Chevron */}
        <div className="flex items-center justify-between sm:justify-end gap-4 pl-12 sm:pl-0">
          <div className="w-32 sm:w-40 font-mono">
            <ProgressBar
              value={unit.progress}
              showLabel
              label={`${unit.completedCount}/${unit.topicsCount} Completed`}
              variant="crimson"
              size="sm"
            />
          </div>
          <div className="w-7 h-7 rounded-lg flex items-center justify-center text-[#737373] hover:text-crimson">
            {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </div>
        </div>
      </div>

      {/* Accordion Content */}
      {isOpen && (
        <div className="p-3 sm:p-5 bg-swiss-surface/30 dark:bg-[#121212]/40 space-y-2 animate-fadeIn border-t border-swiss-border dark:border-[#262626]">
          {unit.description && (
            <p className="text-xs text-[#737373] mb-2.5 px-1 leading-relaxed">
              {unit.description}
            </p>
          )}
          {unit.topics.map((topic) => (
            <TopicItem
              key={topic.id}
              topic={topic}
              subjectId={subjectId}
              isCurrent={topic.isCurrent}
            />
          ))}
        </div>
      )}
    </div>
  );
}
