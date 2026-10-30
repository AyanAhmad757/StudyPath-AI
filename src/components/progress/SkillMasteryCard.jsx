import React from 'react';
import Card from '../common/Card';
import ProgressBar from '../common/ProgressBar';
import { Compass } from 'lucide-react';

export default function SkillMasteryCard({ roadmap }) {
  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-5 pb-3 border-b border-outline-variant/30">
        <div>
          <h3 className="text-base font-headline font-bold text-on-surface flex items-center gap-2">
            <Compass className="w-5 h-5 text-primary dark:text-secondary-fixed" />
            Career Track Progress ({roadmap.careerName})
          </h3>
          <p className="text-xs text-on-surface-variant font-medium">
            Phase completion from foundations to production deployment
          </p>
        </div>
      </div>

      <div className="space-y-3.5">
        {roadmap.phases.map((p) => (
          <div key={p.id} className="p-4 rounded-2xl bg-surface-container-low/70 border border-outline-variant/30 space-y-2 hover:border-primary/30 transition-all">
            <div className="flex items-center justify-between text-xs">
              <span className="font-headline font-bold text-on-surface">
                {p.title}
              </span>
              <span
                className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                  p.status === 'Completed'
                    ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300'
                    : p.status === 'In Progress'
                    ? 'bg-secondary-fixed text-primary dark:bg-primary-950 dark:text-secondary-fixed'
                    : 'bg-surface-container-high text-on-surface-variant'
                }`}
              >
                {p.status} ({p.progress}%)
              </span>
            </div>
            <ProgressBar
              value={p.progress}
              variant={p.status === 'Completed' ? 'emerald' : 'brand'}
              size="sm"
            />
          </div>
        ))}
      </div>
    </Card>
  );
}
