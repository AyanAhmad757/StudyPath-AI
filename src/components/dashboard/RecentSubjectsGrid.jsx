import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Network, Cpu, Cloud, Code, BookOpen, ArrowRight, Plus } from 'lucide-react';

export default function RecentSubjectsGrid({ subjects }) {
  const navigate = useNavigate();

  const iconMap = {
    Network: Network,
    Cpu: Cpu,
    Cloud: Cloud,
    Code: Code,
    BookOpen: BookOpen,
  };

  return (
    <section className="flex flex-col gap-2">
      <div className="flex items-center justify-between px-1">
        <h3 className="font-headline text-sm font-bold text-swiss-black dark:text-white uppercase tracking-wider">
          Enrolled Subjects
        </h3>
        <span
          onClick={() => navigate('/study')}
          className="font-headline text-xs text-crimson font-semibold uppercase tracking-wider cursor-pointer hover:underline"
        >
          Explore All
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
        {subjects.slice(0, 6).map((subject) => {
          const Icon = iconMap[subject.iconName] || BookOpen;

          return (
            <div
              key={subject.id}
              onClick={() => navigate(`/study/${subject.id}`)}
              className="bg-white dark:bg-[#171717] rounded-lg p-4 sm:p-5 flex flex-col justify-between gap-3 border border-swiss-border dark:border-[#262626] hover:border-swiss-black dark:hover:border-white transition-all cursor-pointer group"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="w-8 h-8 rounded-lg bg-swiss-subtle dark:bg-[#202020] text-swiss-black dark:text-white border border-swiss-border dark:border-[#262626] flex items-center justify-center">
                    <Icon className="w-4 h-4" />
                  </div>
                  <span className="font-mono tabular-nums text-xs font-bold text-swiss-black dark:text-white">
                    {subject.progress}%
                  </span>
                </div>

                <h4 className="font-headline text-xs font-bold text-swiss-black dark:text-white truncate group-hover:text-crimson transition-colors">
                  {subject.name}
                </h4>
                <p className="font-mono tabular-nums text-[11px] text-swiss-muted dark:text-swiss-border mt-0.5">
                  {subject.completedTopics} of {subject.topicsCount} topics
                </p>
              </div>

              <div className="w-full bg-swiss-subtle dark:bg-[#202020] rounded-full h-1.5 overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-700 bg-swiss-black dark:bg-white"
                  style={{ width: `${subject.progress}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
