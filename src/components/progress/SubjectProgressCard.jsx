import React from 'react';
import Card from '../common/Card';
import ProgressBar from '../common/ProgressBar';
import { BookOpen } from 'lucide-react';

export default function SubjectProgressCard({ subjects }) {
  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-5 pb-3 border-b border-outline-variant/30">
        <div>
          <h3 className="text-base font-headline font-bold text-on-surface flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-primary dark:text-secondary-fixed" />
            Curriculum Subject Mastery
          </h3>
          <p className="text-xs text-on-surface-variant font-medium">
            Completion rate across current syllabus subjects
          </p>
        </div>
      </div>

      <div className="space-y-3.5">
        {subjects.map((s) => (
          <div key={s.id} className="space-y-2 p-4 rounded-2xl bg-surface-container-low/70 border border-outline-variant/30 hover:border-primary/30 transition-all">
            <div className="flex items-center justify-between text-xs">
              <span className="font-headline font-bold text-on-surface">
                {s.name} <span className="text-on-surface-variant font-normal">({s.code})</span>
              </span>
              <span className="font-mono font-bold text-on-surface-variant">
                {s.completedTopics} / {s.topicsCount} topics ({s.progress}%)
              </span>
            </div>
            <ProgressBar
              value={s.progress}
              variant={s.progress === 100 ? 'emerald' : 'brand'}
              size="sm"
            />
          </div>
        ))}
      </div>
    </Card>
  );
}
