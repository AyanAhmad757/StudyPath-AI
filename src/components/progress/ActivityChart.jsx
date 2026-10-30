import React from 'react';
import Card from '../common/Card';
import { BarChart3 } from 'lucide-react';

export default function ActivityChart({ data }) {
  const maxHours = Math.max(...data.map((d) => d.hours), 8);

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6 pb-3 border-b border-swiss-border dark:border-[#262626]">
        <div>
          <h3 className="text-base font-headline font-semibold text-swiss-black dark:text-white flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-crimson" />
            Weekly Study Activity
          </h3>
          <p className="text-xs text-swiss-muted dark:text-swiss-border font-normal">
            Hours dedicated to syllabus topics and technical roadmaps
          </p>
        </div>
        <span className="text-xs font-mono tabular-nums font-semibold text-swiss-black dark:text-white bg-swiss-subtle dark:bg-[#202020] px-3 py-1 rounded border border-swiss-border dark:border-[#262626]">
          Total: 29.3 hrs this week
        </span>
      </div>

      {/* Bar Chart Visualization */}
      <div className="h-48 flex items-end justify-between gap-2 sm:gap-4 pt-4 px-2">
        {data.map((item, idx) => {
          const heightPercent = Math.round((item.hours / maxHours) * 100);

          return (
            <div key={idx} className="flex-1 flex flex-col items-center gap-2 group cursor-pointer">
              {/* Tooltip on hover */}
              <div className="text-[11px] font-mono tabular-nums font-bold text-white bg-swiss-black dark:bg-white dark:text-swiss-black opacity-0 group-hover:opacity-100 transition-opacity px-2 py-0.5 rounded whitespace-nowrap shadow-hard-sm">
                {item.hours}h ({item.topics} topics)
              </div>

              {/* Bar Fill */}
              <div className="w-full max-w-[36px] bg-swiss-subtle dark:bg-[#202020] rounded-none h-36 flex items-end">
                <div
                  className="w-full bg-swiss-black dark:bg-white group-hover:bg-crimson dark:group-hover:bg-crimson transition-all duration-300"
                  style={{ height: `${heightPercent}%` }}
                />
              </div>

              {/* Day Label */}
              <span className="text-xs font-mono font-semibold uppercase tracking-wider text-swiss-muted dark:text-swiss-border group-hover:text-crimson transition-colors">
                {item.day}
              </span>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
