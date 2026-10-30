import React from 'react';
import { useApp } from '../../context/AppContext';

export default function TodayGoalsCard() {
  const { todayGoals, toggleGoalCompletion } = useApp();

  const completedCount = todayGoals.filter((g) => g.completed).length;

  const xpTagMap = {
    g1: { label: '+15 XP', style: 'text-crimson bg-crimson-wash dark:bg-crimson/15 border-crimson/20' },
    g2: { label: 'Video', style: 'text-swiss-black dark:text-white bg-swiss-subtle dark:bg-[#202020] border-swiss-border dark:border-[#262626]' },
    g3: { label: '+30 XP', style: 'text-crimson bg-crimson-wash dark:bg-crimson/15 border-crimson/20' },
    g4: { label: 'Code', style: 'text-swiss-black dark:text-white bg-swiss-subtle dark:bg-[#202020] border-swiss-border dark:border-[#262626]' },
  };

  return (
    <section className="flex flex-col gap-2">
      <div className="flex items-center justify-between px-1">
        <h3 className="font-headline text-sm font-bold text-swiss-black dark:text-white uppercase tracking-wider">
          Today's Daily Quest
        </h3>
        <span className="font-mono tabular-nums text-xs text-swiss-muted dark:text-swiss-border font-medium">
          {completedCount} / {todayGoals.length} Completed
        </span>
      </div>

      <div className="bg-white dark:bg-[#171717] rounded-lg p-4 sm:p-5 flex flex-col gap-2 border border-swiss-border dark:border-[#262626]">
        {todayGoals.map((goal) => {
          const xp = xpTagMap[goal.id] || { label: '+20 XP', style: 'text-swiss-black dark:text-white bg-swiss-subtle dark:bg-[#202020] border-swiss-border dark:border-[#262626]' };

          return (
            <label
              key={goal.id}
              onClick={() => toggleGoalCompletion(goal.id)}
              className="flex items-center gap-3 p-2 rounded-lg hover:bg-swiss-subtle dark:hover:bg-[#202020] transition-colors cursor-pointer select-none"
            >
              <input
                type="checkbox"
                checked={goal.completed}
                readOnly
                className="w-4 h-4 text-crimson rounded accent-crimson cursor-pointer shrink-0"
              />
              <span
                className={`font-body text-xs flex-1 transition-all ${
                  goal.completed
                    ? 'text-swiss-muted dark:text-swiss-border line-through'
                    : 'text-swiss-black dark:text-white font-medium'
                }`}
              >
                {goal.title}
              </span>
              <span
                className={`font-mono text-[10px] tabular-nums px-2 py-0.5 rounded border font-semibold shrink-0 ${xp.style}`}
              >
                {xp.label}
              </span>
            </label>
          );
        })}
      </div>
    </section>
  );
}
