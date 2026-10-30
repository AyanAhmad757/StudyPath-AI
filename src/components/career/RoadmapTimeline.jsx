import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import ProgressBar from '../common/ProgressBar';
import {
  CheckCircle2,
  Clock,
  Lock,
  ChevronDown,
  ChevronUp,
  Check,
} from 'lucide-react';

export default function RoadmapTimeline({ roadmap }) {
  const { toggleRoadmapTopic } = useApp();
  const [expandedPhases, setExpandedPhases] = useState({
    'phase-1': true,
    'phase-2': true,
    'phase-3': false,
    'phase-4': false,
    'phase-5': false,
  });

  const togglePhase = (phaseId) => {
    setExpandedPhases((prev) => ({ ...prev, [phaseId]: !prev[phaseId] }));
  };

  const statusConfig = {
    Completed: {
      badge: 'bg-[#fef2f2] dark:bg-crimson/10 text-crimson border border-crimson/30',
      icon: CheckCircle2,
      iconColor: 'text-crimson bg-[#fef2f2] dark:bg-crimson/10 border border-crimson/30',
    },
    'In Progress': {
      badge: 'bg-swiss-surface dark:bg-[#262626] text-crimson border border-crimson font-bold',
      icon: Clock,
      iconColor: 'text-crimson bg-swiss-surface dark:bg-[#262626] border border-crimson',
    },
    Locked: {
      badge: 'bg-swiss-surface dark:bg-[#262626] text-[#737373] border border-swiss-border dark:border-[#333333]',
      icon: Lock,
      iconColor: 'text-[#737373] bg-swiss-surface dark:bg-[#262626] border border-swiss-border dark:border-[#333333]',
    },
  };

  return (
    <div className="space-y-5 relative before:absolute before:inset-0 before:left-5 sm:before:left-6 before:w-0.5 before:bg-swiss-border dark:before:bg-[#262626] before:z-0">
      {roadmap.phases.map((phase) => {
        const config = statusConfig[phase.status] || statusConfig.Locked;
        const Icon = config.icon;
        const isExpanded = expandedPhases[phase.id];

        return (
          <div key={phase.id} className="relative z-10 flex gap-3.5 sm:gap-5 items-start">
            {/* Node Indicator */}
            <div
              className={`w-10 h-10 sm:w-11 sm:h-11 rounded-lg flex items-center justify-center shrink-0 transition-colors ${config.iconColor}`}
            >
              <Icon className="w-5 h-5" />
            </div>

            {/* Card Content */}
            <div
              className={`flex-1 rounded-lg border transition-colors overflow-hidden ${
                phase.status === 'In Progress'
                  ? 'bg-white dark:bg-[#171717] border-crimson'
                  : phase.status === 'Completed'
                  ? 'bg-white dark:bg-[#171717] border-swiss-border dark:border-[#262626]'
                  : 'bg-swiss-surface/60 dark:bg-[#121212]/60 border-swiss-border dark:border-[#262626] opacity-80'
              }`}
            >
              {/* Header */}
              <div
                onClick={() => togglePhase(phase.id)}
                className="p-4 sm:p-5 cursor-pointer select-none flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-swiss-border dark:border-[#262626] hover:bg-swiss-surface dark:hover:bg-[#1f1f1f]"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2 font-mono">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#737373]">
                      Phase {phase.phaseNumber}
                    </span>
                    <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded ${config.badge}`}>
                      {phase.status}
                    </span>
                  </div>
                  <h3 className="font-headline text-sm sm:text-base font-bold text-swiss-black dark:text-white tracking-tight">
                    {phase.title}
                  </h3>
                  <p className="text-xs text-[#737373]">
                    {phase.description}
                  </p>
                </div>

                {/* Progress & Chevron */}
                <div className="flex items-center gap-4 self-end sm:self-center shrink-0 font-mono">
                  {phase.status !== 'Locked' && (
                    <div className="w-28 sm:w-36">
                      <ProgressBar
                        value={phase.progress}
                        showLabel
                        label="Phase Coverage"
                        variant="crimson"
                        size="sm"
                      />
                    </div>
                  )}
                  <div className="w-7 h-7 rounded-lg flex items-center justify-center text-[#737373] hover:text-crimson">
                    {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </div>
                </div>
              </div>

              {/* Topics */}
              {isExpanded && (
                <div className="p-4 bg-swiss-surface/30 dark:bg-[#121212]/30 space-y-2 animate-fadeIn border-t border-swiss-border dark:border-[#262626]">
                  <p className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#737373] mb-1.5">
                    Core Milestones & Technical Tasks
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 font-mono">
                    {phase.topics.map((topic, tIdx) => (
                      <div
                        key={tIdx}
                        onClick={() => {
                          if (phase.status !== 'Locked') {
                            toggleRoadmapTopic(phase.id, topic.name, !topic.completed);
                          }
                        }}
                        className={`p-2.5 rounded-lg border flex items-center gap-2.5 transition-colors ${
                          phase.status === 'Locked'
                            ? 'bg-swiss-surface/40 dark:bg-[#262626]/40 border-swiss-border dark:border-[#333333] text-[#737373]/50 cursor-not-allowed'
                            : topic.completed
                            ? 'bg-swiss-surface dark:bg-[#1f1f1f] border-swiss-border dark:border-[#262626] cursor-pointer'
                            : 'bg-white dark:bg-[#171717] border-swiss-border dark:border-[#262626] hover:border-swiss-black dark:hover:border-white cursor-pointer'
                        }`}
                      >
                        <button
                          type="button"
                          disabled={phase.status === 'Locked'}
                          className={`w-4 h-4 rounded flex items-center justify-center shrink-0 transition-colors ${
                            topic.completed
                              ? 'bg-crimson text-white'
                              : 'border border-swiss-border dark:border-[#333333]'
                          }`}
                        >
                          {topic.completed && <Check className="w-3 h-3 stroke-[3]" />}
                        </button>
                        <span
                          className={`text-xs font-medium truncate ${
                            topic.completed
                              ? 'text-[#737373] line-through'
                              : 'text-swiss-black dark:text-white'
                          }`}
                        >
                          {topic.name}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
