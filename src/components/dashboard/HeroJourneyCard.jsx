import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, ArrowRight, Play } from 'lucide-react';

export default function HeroJourneyCard({ stats, careerRoadmap }) {
  const navigate = useNavigate();
  const progressVal = stats?.overallProgress || 64;

  return (
    <section className="relative overflow-hidden rounded-lg bg-swiss-black text-white dark:bg-[#141414] dark:border dark:border-[#262626] p-5 sm:p-7 border border-swiss-black">
      <div className="relative z-10 flex flex-col gap-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex flex-col gap-1">
            <span className="font-mono text-[11px] font-bold uppercase tracking-wider text-swiss-border">
              Target Pathway
            </span>
            <h2 className="font-headline text-xl sm:text-2xl font-bold text-white leading-tight">
              {careerRoadmap?.careerName || 'Full Stack Developer'}
            </h2>
            <span className="text-xs text-swiss-border/80 font-normal">
              Semester 6 Specialization • Modern Web Architecture
            </span>
          </div>

          {/* Radial Gauge SVG */}
          <div className="relative w-16 h-16 sm:w-20 sm:h-20 flex items-center justify-center flex-shrink-0">
            <svg className="w-16 h-16 sm:w-20 sm:h-20 transform -rotate-90" viewBox="0 0 36 36">
              <path
                className="text-white/20"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                fill="none"
                stroke="currentColor"
                strokeWidth="3.5"
              />
              <path
                className="text-crimson transition-all duration-1000 ease-out"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                fill="none"
                stroke="currentColor"
                strokeDasharray={`${progressVal}, 100`}
                strokeLinecap="round"
                strokeWidth="3.5"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
              <span className="font-mono tabular-nums text-xs sm:text-sm font-bold leading-none text-white">
                {progressVal}%
              </span>
              <span className="font-mono text-[9px] uppercase tracking-wider text-swiss-border mt-0.5">
                Overall
              </span>
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-white/20 rounded-full h-1.5 overflow-hidden">
          <div
            className="bg-crimson h-full rounded-full transition-all duration-700"
            style={{ width: `${progressVal}%` }}
          />
        </div>

        {/* Footer info & CTA */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-crimson shrink-0" />
            <span className="font-mono tabular-nums text-xs text-swiss-border font-normal">
              Milestone 4 of 7 reached
            </span>
          </div>
          <button
            onClick={() => navigate('/study/cn-101/topic/cn-t4')}
            className="px-4 py-2 rounded-lg bg-crimson text-white font-headline text-xs font-semibold uppercase tracking-wider hover:bg-crimson-hover transition-all flex items-center justify-center gap-1.5 self-start sm:self-auto"
            type="button"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            Continue Learning
          </button>
        </div>
      </div>
    </section>
  );
}
