import React from 'react';
import { useNavigate } from 'react-router-dom';
import Badge from '../common/Badge';
import {
  Layers,
  Layout,
  Server,
  Sparkles,
  BarChart3,
  CloudRain,
  ShieldCheck,
  Smartphone,
  ArrowRight,
  Clock,
  TrendingUp,
} from 'lucide-react';

export default function CareerCard({ career }) {
  const navigate = useNavigate();

  const iconMap = {
    Layers: Layers,
    Layout: Layout,
    Server: Server,
    Sparkles: Sparkles,
    BarChart3: BarChart3,
    CloudRain: CloudRain,
    ShieldCheck: ShieldCheck,
    Smartphone: Smartphone,
  };

  const Icon = iconMap[career.iconName] || Layers;

  return (
    <div className="bg-white dark:bg-[#171717] rounded-lg p-5 sm:p-6 border border-swiss-border dark:border-[#262626] flex flex-col justify-between group hover:border-swiss-black dark:hover:border-white transition-colors">
      <div>
        {/* Top: Icon + Badge */}
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="w-10 h-10 rounded-lg bg-swiss-surface dark:bg-[#262626] border border-swiss-border dark:border-[#333333] text-swiss-black dark:text-white flex items-center justify-center shrink-0">
            <Icon className="w-5 h-5 text-crimson" />
          </div>
          <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-[#fef2f2] dark:bg-crimson/10 border border-crimson/30 text-crimson">
            {career.badge}
          </span>
        </div>

        {/* Title & Description */}
        <h3 className="font-headline text-base sm:text-lg font-bold text-swiss-black dark:text-white group-hover:text-crimson transition-colors mb-1.5 tracking-tight">
          {career.name}
        </h3>
        <p className="text-xs text-[#737373] leading-relaxed line-clamp-2 mb-4">
          {career.description}
        </p>

        {/* Quick Stats: Duration, Salary */}
        <div className="grid grid-cols-2 gap-2 p-3 bg-swiss-surface dark:bg-[#1f1f1f] border border-swiss-border dark:border-[#262626] rounded-lg mb-4 text-xs font-mono">
          <div>
            <span className="text-[10px] text-[#737373] block mb-0.5 uppercase">Timeline</span>
            <span className="font-bold text-swiss-black dark:text-white flex items-center gap-1 tabular-nums">
              <Clock className="w-3.5 h-3.5 text-crimson" />
              {career.estimatedDuration}
            </span>
          </div>
          <div>
            <span className="text-[10px] text-[#737373] block mb-0.5 uppercase">Avg Compensation</span>
            <span className="font-bold text-swiss-black dark:text-white flex items-center gap-1 tabular-nums">
              <TrendingUp className="w-3.5 h-3.5 text-crimson" />
              {career.averageSalary}
            </span>
          </div>
        </div>

        {/* Required Skills tags */}
        <div className="mb-4">
          <p className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#737373] mb-2">
            Core Competencies
          </p>
          <div className="flex flex-wrap gap-1.5 font-mono">
            {career.requiredSkills.slice(0, 4).map((skill, idx) => (
              <span
                key={idx}
                className="text-[10px] px-2 py-0.5 rounded bg-swiss-surface dark:bg-[#262626] border border-swiss-border dark:border-[#333333] text-swiss-black dark:text-white"
              >
                {skill}
              </span>
            ))}
            {career.requiredSkills.length > 4 && (
              <span className="text-[10px] px-2 py-0.5 rounded text-[#737373] bg-swiss-surface dark:bg-[#262626] border border-swiss-border dark:border-[#333333]">
                +{career.requiredSkills.length - 4} more
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Action Button */}
      <div className="pt-2">
        <button
          onClick={() => navigate('/career/assessment')}
          className="w-full py-2.5 px-4 rounded-lg bg-swiss-surface dark:bg-[#262626] border border-swiss-border dark:border-[#333333] text-swiss-black dark:text-white font-mono text-xs uppercase tracking-wider font-bold flex items-center justify-center gap-1.5 hover:border-swiss-black dark:hover:border-white transition-colors"
          type="button"
        >
          <span>Examine Discipline</span>
          <ArrowRight className="w-3.5 h-3.5 text-crimson group-hover:translate-x-0.5 transition-transform" />
        </button>
      </div>
    </div>
  );
}
