import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Network, Play, ArrowRight } from 'lucide-react';

export default function ContinueLearningCard() {
  const navigate = useNavigate();

  return (
    <section className="flex flex-col gap-2">
      <div className="flex items-center justify-between px-1">
        <h3 className="font-headline text-sm font-bold text-swiss-black dark:text-white uppercase tracking-wider">
          Continue Learning
        </h3>
        <span className="font-mono text-[11px] font-bold text-crimson uppercase tracking-wider">
          Active Session
        </span>
      </div>

      <div className="bg-white dark:bg-[#171717] rounded-lg p-5 sm:p-6 flex flex-col gap-4 border border-swiss-border dark:border-[#262626]">
        <div className="flex items-start gap-4">
          <div className="w-11 h-11 rounded-lg bg-swiss-subtle dark:bg-[#202020] border border-swiss-border dark:border-[#262626] flex items-center justify-center text-swiss-black dark:text-white shrink-0">
            <Network className="w-5 h-5" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2">
              <span className="font-mono text-[11px] font-semibold text-swiss-muted dark:text-swiss-border uppercase tracking-wider">
                Unit 1 • Network Fundamentals
              </span>
              <span className="font-mono tabular-nums text-xs font-bold text-swiss-black dark:text-white">
                80%
              </span>
            </div>
            <h4 className="font-headline text-base sm:text-lg font-bold text-swiss-black dark:text-white truncate mt-0.5">
              Computer Networks
            </h4>
            <p className="text-xs text-swiss-muted dark:text-swiss-border truncate mt-0.5">
              Current topic: <strong className="text-swiss-black dark:text-white font-semibold">OSI Reference Model (7 Layers)</strong>
            </p>
          </div>
        </div>

        {/* Linear visual progress */}
        <div className="w-full bg-swiss-subtle dark:bg-[#202020] rounded-full h-1.5 overflow-hidden">
          <div className="bg-swiss-black dark:bg-white h-full rounded-full transition-all duration-700" style={{ width: '80%' }}></div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3 pt-1">
          <button
            onClick={() => navigate('/study/cn-101/topic/cn-t4')}
            className="flex-1 py-2 px-4 rounded-lg bg-crimson text-white font-headline text-xs font-semibold uppercase tracking-wider flex items-center justify-center gap-2 hover:bg-crimson-hover transition-all"
            type="button"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            Continue
          </button>
          <button
            onClick={() => navigate('/study/cn-101')}
            className="py-2 px-5 rounded-lg bg-white dark:bg-[#202020] text-swiss-black dark:text-white border border-swiss-border dark:border-[#262626] font-headline text-xs font-semibold uppercase tracking-wider hover:bg-swiss-subtle dark:hover:bg-[#2a2a2a] transition-all"
            type="button"
          >
            View Subject
          </button>
        </div>
      </div>
    </section>
  );
}
