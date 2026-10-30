import React from 'react';

const levels = [
  { value: 'Never Used', label: 'Never Used', desc: 'No prior experience' },
  { value: 'Beginner', label: 'Beginner', desc: 'Basic syntax & concepts' },
  { value: 'Intermediate', label: 'Intermediate', desc: 'Built projects & practiced' },
  { value: 'Advanced', label: 'Advanced', desc: 'Production / deep mastery' },
];

export default function SkillConfidenceSelector({ skill, selectedLevel, onChange }) {
  return (
    <div className="p-4 sm:p-5 rounded-lg bg-white dark:bg-[#171717] border border-swiss-border dark:border-[#262626] transition-colors hover:border-swiss-black dark:hover:border-white">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
        <div>
          <h4 className="font-headline text-sm sm:text-base font-bold text-swiss-black dark:text-white tracking-tight">
            {skill.name}
          </h4>
          <p className="text-xs text-[#737373]">
            {skill.description}
          </p>
        </div>
        <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2.5 py-0.5 rounded bg-swiss-surface dark:bg-[#262626] border border-swiss-border dark:border-[#333333] text-swiss-black dark:text-white self-start sm:self-auto shrink-0">
          Evaluated: <span className="text-crimson">{selectedLevel}</span>
        </span>
      </div>

      {/* Selectable Rating Pills */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 font-mono">
        {levels.map((lvl) => {
          const isSelected = selectedLevel === lvl.value;
          return (
            <button
              key={lvl.value}
              type="button"
              onClick={() => onChange(skill.id, lvl.value)}
              className={`p-2.5 rounded-lg text-left transition-colors border ${
                isSelected
                  ? 'bg-[#fef2f2] dark:bg-crimson/10 border-crimson text-crimson font-bold'
                  : 'bg-swiss-surface dark:bg-[#1f1f1f] border-swiss-border dark:border-[#262626] text-[#737373] hover:border-swiss-black dark:hover:border-white'
              }`}
            >
              <div className="flex items-center justify-between mb-0.5">
                <span className="text-xs uppercase tracking-wider">{lvl.label}</span>
                <span
                  className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${
                    isSelected ? 'border-crimson bg-crimson' : 'border-swiss-border dark:border-[#333333]'
                  }`}
                >
                  {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-white" />}
                </span>
              </div>
              <span className="text-[10px] text-[#737373] block leading-tight font-normal">
                {lvl.desc}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
