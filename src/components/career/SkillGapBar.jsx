import React from 'react';

export default function SkillGapBar({ skillItem }) {
  const statusStyles = {
    Mastered: 'text-swiss-black dark:text-white bg-swiss-subtle dark:bg-[#202020] border-swiss-border dark:border-[#262626]',
    Good: 'text-swiss-black dark:text-white bg-swiss-subtle dark:bg-[#202020] border-swiss-border dark:border-[#262626]',
    'Priority Focus': 'text-crimson bg-crimson-wash dark:bg-crimson/15 border-crimson/30',
    'Learning Now': 'text-swiss-black dark:text-white bg-swiss-subtle dark:bg-[#202020] border-swiss-border dark:border-[#262626]',
    'Skill Gap': 'text-crimson bg-crimson-wash dark:bg-crimson/15 border-crimson/30',
  };

  const badgeStyle = statusStyles[skillItem.status] || statusStyles['Skill Gap'];

  return (
    <div className="space-y-2 p-3.5 rounded-lg bg-white dark:bg-[#171717] border border-swiss-border dark:border-[#262626] hover:border-swiss-black dark:hover:border-white transition-all">
      <div className="flex items-center justify-between text-xs">
        <span className="font-headline font-semibold text-swiss-black dark:text-white">
          {skillItem.skill}
        </span>
        <div className="flex items-center gap-2">
          <span className={`text-[10px] font-mono uppercase tracking-wider font-semibold px-2 py-0.5 rounded border ${badgeStyle}`}>
            {skillItem.status}
          </span>
          <span className="font-mono tabular-nums font-bold text-swiss-muted dark:text-swiss-border">
            {skillItem.currentPercentage}%
          </span>
        </div>
      </div>

      {/* Visual Comparison Progress Bar */}
      <div className="h-2 w-full bg-swiss-subtle dark:bg-[#262626] rounded-full overflow-hidden flex relative">
        {/* Current Proficiency Fill */}
        <div
          className={`h-full rounded-full transition-all duration-700 ${
            skillItem.currentPercentage >= 80
              ? 'bg-swiss-black dark:bg-white'
              : skillItem.currentPercentage >= 40
              ? 'bg-swiss-muted dark:bg-[#888888]'
              : 'bg-crimson'
          }`}
          style={{ width: `${skillItem.currentPercentage}%` }}
        />
      </div>
    </div>
  );
}
