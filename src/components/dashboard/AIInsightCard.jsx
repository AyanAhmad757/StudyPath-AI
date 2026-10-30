import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Modal from '../common/Modal';
import Button from '../common/Button';
import { Sparkles, Brain, Lightbulb, ArrowRight } from 'lucide-react';

export default function AIInsightCard() {
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <section className="relative overflow-hidden rounded-lg bg-swiss-subtle dark:bg-[#171717] text-swiss-black dark:text-white p-4 sm:p-5 border border-swiss-border dark:border-[#262626]">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-lg bg-crimson-wash dark:bg-crimson/15 text-crimson flex items-center justify-center shrink-0 border border-crimson/20">
            <Sparkles className="w-4 h-4 fill-current" />
          </div>
          <div className="flex flex-col gap-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-headline text-xs font-bold text-crimson tracking-wider uppercase">
                AI Mentor Insight
              </span>
              <span className="w-2 h-2 rounded-full bg-crimson animate-ping"></span>
            </div>
            <p className="font-body text-xs text-swiss-muted dark:text-swiss-border leading-relaxed">
              You're strong in <strong className="text-swiss-black dark:text-white font-semibold">HTML & CSS</strong>. Your biggest current skill gap is <strong className="text-crimson font-semibold underline">JavaScript</strong>. Focus on JavaScript fundamentals before moving deeper into React.
            </p>
          </div>
        </div>

        <div className="mt-4 pt-3 border-t border-swiss-border dark:border-[#262626] flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 text-[11px] font-mono text-swiss-muted dark:text-swiss-border">
            <Brain className="w-3.5 h-3.5" />
            <span>Based on 14 topic milestones</span>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="px-3 py-1.5 rounded-lg bg-swiss-black text-white hover:bg-swiss-dark dark:bg-white dark:text-swiss-black dark:hover:bg-swiss-subtle font-headline text-xs font-semibold uppercase tracking-wider transition-colors"
            type="button"
          >
            View Recommendations
          </button>
        </div>
      </section>

      {/* AI Recommendations Dialog */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="AI Mentor Recommendations Breakdown"
        maxWidth="max-w-lg"
      >
        <div className="space-y-4">
          <div className="p-4 bg-swiss-subtle dark:bg-[#202020] rounded-lg text-xs sm:text-sm text-swiss-black dark:text-white space-y-2 border border-swiss-border dark:border-[#262626]">
            <div className="flex items-center gap-2 font-headline font-semibold text-crimson">
              <Lightbulb className="w-4 h-4 text-crimson" />
              Strategic Learning Path
            </div>
            <p className="leading-relaxed text-swiss-muted dark:text-swiss-border">
              Based on your skill assessment for <strong className="text-swiss-black dark:text-white">Full Stack Developer</strong> and your 6th-semester coursework, here is the suggested high-yield sequence:
            </p>
          </div>

          <div className="space-y-2.5 text-xs text-swiss-black dark:text-white">
            <div className="p-3 bg-white dark:bg-[#171717] rounded-lg border border-swiss-border dark:border-[#262626] flex items-start gap-3">
              <span className="w-5 h-5 rounded bg-swiss-black text-white dark:bg-white dark:text-swiss-black font-mono font-bold text-xs flex items-center justify-center shrink-0">1</span>
              <div>
                <p className="font-headline font-semibold text-swiss-black dark:text-white">Master Promises & Async/Await</p>
                <p className="text-swiss-muted dark:text-swiss-border mt-0.5">Understand event loop, microtasks, and error handling for reliable API data fetching.</p>
              </div>
            </div>

            <div className="p-3 bg-white dark:bg-[#171717] rounded-lg border border-swiss-border dark:border-[#262626] flex items-start gap-3">
              <span className="w-5 h-5 rounded bg-swiss-black text-white dark:bg-white dark:text-swiss-black font-mono font-bold text-xs flex items-center justify-center shrink-0">2</span>
              <div>
                <p className="font-headline font-semibold text-swiss-black dark:text-white">Practice React useState & useEffect</p>
                <p className="text-swiss-muted dark:text-swiss-border mt-0.5">Build single-page apps that react to asynchronous data changes without layout shifts.</p>
              </div>
            </div>
          </div>

          <div className="pt-3 flex justify-end gap-2">
            <Button onClick={() => setIsModalOpen(false)} variant="secondary" size="sm">
              Close
            </Button>
            <Button
              onClick={() => {
                setIsModalOpen(false);
                navigate('/career/roadmap');
              }}
              variant="primary"
              size="sm"
            >
              Open Full Roadmap
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
}
