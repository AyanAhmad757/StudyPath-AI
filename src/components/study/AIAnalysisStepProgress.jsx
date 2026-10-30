import React from 'react';
import { Sparkles, Check, Loader2 } from 'lucide-react';
import ProgressBar from '../common/ProgressBar';

export default function AIAnalysisStepProgress({
  currentStep = 1,
  totalSteps = 5,
  currentLabel = 'Reading syllabus document...',
  title = 'Friday is analyzing your syllabus...',
  steps = [
    { step: 1, name: 'Reading syllabus document & structure' },
    { step: 2, name: 'Identifying academic units & modules' },
    { step: 3, name: 'Extracting key topics & difficulty levels' },
    { step: 4, name: 'Organizing optimal prerequisite learning order' },
    { step: 5, name: 'Generating curated study resources & recommendations' },
  ]
}) {
  const progressPercent = Math.round((currentStep / totalSteps) * 100);

  return (
    <div className="bg-white dark:bg-[#171717] rounded-lg border border-swiss-border dark:border-[#262626] p-6 sm:p-10 max-w-xl mx-auto text-center relative overflow-hidden animate-slide-up">
      {/* Swiss AI Icon */}
      <div className="w-12 h-12 rounded-lg bg-crimson text-white mx-auto flex items-center justify-center mb-5">
        <Sparkles className="w-6 h-6 animate-pulse" />
      </div>

      <h3 className="font-headline text-xl sm:text-2xl font-bold text-swiss-black dark:text-white tracking-tight mb-1.5">
        {title}
      </h3>
      <p className="text-xs sm:text-sm text-[#737373] mb-6 max-w-md mx-auto">
        Please stand by while Friday executes telemetry benchmarks and structural decomposition.
      </p>

      {/* Progress Bar */}
      <div className="mb-6 font-mono">
        <ProgressBar
          value={progressPercent}
          variant="crimson"
          size="md"
          showLabel
          label={`Phase ${currentStep} of ${totalSteps}`}
        />
      </div>

      {/* Step Checklist */}
      <div className="space-y-2.5 text-left bg-swiss-surface dark:bg-[#1f1f1f] p-4 rounded-lg border border-swiss-border dark:border-[#262626] font-mono">
        {steps.map((item) => {
          const isDone = item.step < currentStep;
          const isCurrent = item.step === currentStep;

          return (
            <div
              key={item.step}
              className={`flex items-center gap-3 text-xs sm:text-sm transition-colors ${
                isDone
                  ? 'text-swiss-black dark:text-white font-medium'
                  : isCurrent
                  ? 'text-crimson font-bold'
                  : 'text-[#737373]'
              }`}
            >
              <div
                className={`w-5 h-5 rounded flex items-center justify-center shrink-0 text-[10px] ${
                  isDone
                    ? 'bg-crimson text-white font-bold'
                    : isCurrent
                    ? 'bg-crimson text-white'
                    : 'bg-swiss-surface dark:bg-[#262626] border border-swiss-border dark:border-[#333333] text-[#737373]'
                }`}
              >
                {isDone ? (
                  <Check className="w-3 h-3 stroke-[3]" />
                ) : isCurrent ? (
                  <Loader2 className="w-3 h-3 animate-spin text-white" />
                ) : (
                  <span>{item.step}</span>
                )}
              </div>
              <span className="truncate">{item.name}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
