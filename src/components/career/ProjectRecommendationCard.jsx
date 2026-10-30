import React, { useState } from 'react';
import Card from '../common/Card';
import Badge from '../common/Badge';
import Button from '../common/Button';
import Modal from '../common/Modal';
import { FolderGit2, Sparkles, Clock, ArrowUpRight } from 'lucide-react';

export default function ProjectRecommendationCard({ project }) {
  const [isOpen, setIsOpen] = useState(false);

  const difficultyVariants = {
    Beginner: 'emerald',
    Intermediate: 'brand',
    Advanced: 'ai',
  };

  return (
    <>
      <Card hover className="p-5 flex flex-col justify-between group transition-all duration-300">
        <div>
          <div className="flex items-start justify-between gap-2 mb-3">
            <div className="w-10 h-10 rounded-lg bg-swiss-subtle dark:bg-[#202020] text-swiss-black dark:text-white flex items-center justify-center shrink-0 border border-swiss-border dark:border-[#262626]">
              <FolderGit2 className="w-5 h-5" />
            </div>
            <div className="flex items-center gap-1.5">
              {project.isRecommended && (
                <Badge variant="ai" size="sm" icon={Sparkles}>
                  Top Pick
                </Badge>
              )}
              <Badge variant={difficultyVariants[project.difficulty] || 'brand'} size="sm">
                {project.difficulty}
              </Badge>
            </div>
          </div>

          <h4 className="text-base font-headline font-bold text-swiss-black dark:text-white group-hover:text-crimson transition-colors mb-2">
            {project.title}
          </h4>
          <p className="text-xs text-swiss-muted dark:text-swiss-border line-clamp-2 leading-relaxed mb-4">
            {project.description}
          </p>

          {/* Skills tags */}
          <div className="flex flex-wrap gap-1.5 mb-4">
            {project.skills.map((s, idx) => (
              <span
                key={idx}
                className="text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded bg-swiss-subtle dark:bg-[#202020] text-swiss-black dark:text-white border border-swiss-border dark:border-[#262626]"
              >
                {s}
              </span>
            ))}
          </div>
        </div>

        <div className="pt-3 border-t border-swiss-border dark:border-[#262626] flex items-center justify-between">
          <span className="text-xs text-swiss-muted dark:text-swiss-border flex items-center gap-1 font-mono tabular-nums">
            <Clock className="w-3.5 h-3.5" />
            {project.estimatedTime}
          </span>
          <Button
            onClick={() => setIsOpen(true)}
            variant="ghost"
            size="sm"
            icon={ArrowUpRight}
            iconPosition="right"
            className="text-swiss-black dark:text-white font-headline text-xs font-semibold uppercase tracking-wider hover:text-crimson dark:hover:text-crimson"
          >
            View Project
          </Button>
        </div>
      </Card>

      {/* Project Details Modal */}
      <Modal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title={project.title}
        maxWidth="max-w-xl"
      >
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Badge variant={difficultyVariants[project.difficulty] || 'brand'}>
              {project.difficulty} Level
            </Badge>
            <span className="text-xs text-swiss-muted dark:text-swiss-border font-mono tabular-nums">
              Estimated Duration: {project.estimatedTime}
            </span>
          </div>

          <p className="text-sm text-swiss-black dark:text-white leading-relaxed">
            {project.description}
          </p>

          <div className="p-4 bg-swiss-subtle dark:bg-[#202020] rounded-lg border border-swiss-border dark:border-[#262626] space-y-2">
            <p className="text-[11px] font-mono font-bold uppercase tracking-wider text-swiss-muted dark:text-swiss-border">
              Key Technologies & Concepts Practiced:
            </p>
            <div className="flex flex-wrap gap-2">
              {project.skills.map((s, idx) => (
                <span
                  key={idx}
                  className="text-xs font-mono uppercase tracking-wider px-2.5 py-1 rounded bg-white dark:bg-[#171717] border border-swiss-border dark:border-[#262626] text-swiss-black dark:text-white"
                >
                  {s}
                </span>
              ))}
            </div>
          </div>

          <div className="p-4 bg-swiss-black text-white dark:bg-[#121212] rounded-lg border border-swiss-black dark:border-[#262626]">
            <h5 className="text-xs font-headline font-bold uppercase tracking-wider text-white mb-1.5 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-crimson" />
              Resume Impact
            </h5>
            <p className="text-xs text-swiss-border leading-relaxed font-normal">
              Demonstrates practical full-stack integration, reactive state management, asynchronous API pipelines, and clean architectural separation required by top tech recruiters.
            </p>
          </div>

          <div className="pt-2 flex justify-end">
            <Button onClick={() => setIsOpen(false)} variant="primary">
              Got It
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
}
