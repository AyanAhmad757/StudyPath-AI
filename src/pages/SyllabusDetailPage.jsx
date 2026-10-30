import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { syllabusService } from '../services/syllabusService';
import UnitAccordion from '../components/study/UnitAccordion';
import ProgressBar from '../components/common/ProgressBar';
import Button from '../components/common/Button';
import {
  BookOpen,
  CheckCircle2,
  Play,
  Upload,
  ArrowLeft,
  Layers,
  Loader2,
} from 'lucide-react';

export default function SyllabusDetailPage() {
  const { syllabusId } = useParams();
  const { subjects } = useApp();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [subject, setSubject] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function loadSyllabus() {
      setLoading(true);

      // 1. Check in already loaded subjects
      const found = subjects.find((s) => s.id === syllabusId);
      if (found) {
        if (isMounted) {
          setSubject(found);
          setLoading(false);
        }
        return;
      }

      // 2. Fetch directly from syllabusService by ID if not in context yet
      if (syllabusId) {
        try {
          const direct = await syllabusService.getSubjectById(syllabusId, user?.id);
          if (isMounted) {
            setSubject(direct);
            setLoading(false);
          }
        } catch (_) {
          if (isMounted) {
            setSubject(null);
            setLoading(false);
          }
        }
      } else {
        if (isMounted) {
          setSubject(null);
          setLoading(false);
        }
      }
    }

    loadSyllabus();
    return () => {
      isMounted = false;
    };
  }, [syllabusId, subjects, user?.id]);

  if (loading) {
    return (
      <div className="p-16 text-center text-on-surface-variant font-headline space-y-3">
        <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary" />
        <p className="text-sm font-semibold">Loading syllabus details...</p>
      </div>
    );
  }

  if (!subject) {
    return (
      <div className="p-16 text-center text-on-surface-variant font-headline space-y-4 max-w-md mx-auto">
        <h3 className="text-lg font-bold text-on-surface">Syllabus Not Found</h3>
        <p className="text-xs sm:text-sm text-on-surface-variant leading-relaxed">
          The requested syllabus could not be found or has not been analyzed yet.
        </p>
        <Button onClick={() => navigate('/study')} variant="primary" size="md">
          Back to My Study
        </Button>
      </div>
    );
  }

  const units = subject.units || [];

  // Find first incomplete topic to continue
  let nextTopic = null;
  for (const unit of units) {
    if (unit?.topics) {
      const incomplete = unit.topics.find((t) => !t.completed);
      if (incomplete) {
        nextTopic = incomplete;
        break;
      }
    }
  }
  if (!nextTopic && units[0]?.topics?.[0]) {
    nextTopic = units[0].topics[0];
  }

  return (
    <div className="space-y-6 sm:space-y-8 animate-fadeIn">
      {/* Back button */}
      <button
        onClick={() => navigate('/study')}
        className="inline-flex items-center gap-1.5 text-xs font-mono font-bold text-[#737373] hover:text-crimson transition-colors uppercase tracking-wider"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        Return to Curriculum Hub
      </button>

      {/* Header Card with Subject Metrics */}
      <div className="p-6 sm:p-8 rounded-lg bg-white dark:bg-[#171717] border border-swiss-border dark:border-[#262626]">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold px-2.5 py-0.5 rounded bg-swiss-surface dark:bg-[#262626] border border-swiss-border dark:border-[#333333] text-crimson">
                {subject.code || 'CS701'}
              </span>
              <span className="text-xs font-mono text-[#737373]">
                {subject.university || 'Engineering Curriculum'}
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-headline font-bold text-swiss-black dark:text-white tracking-tight">
              {subject.name || subject.title}
            </h1>
            <p className="text-xs sm:text-sm text-[#737373] leading-relaxed">
              {subject.description || 'Verified syllabus document.'}
            </p>

            {/* Quick Metrics Bar */}
            <div className="flex flex-wrap items-center gap-4 sm:gap-6 pt-2 text-xs font-mono text-[#737373]">
              <div className="flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-crimson" />
                <span className="text-swiss-black dark:text-white tabular-nums font-bold">{units.length} Units</span>
              </div>
              <div className="flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5 text-crimson" />
                <span className="text-swiss-black dark:text-white tabular-nums font-bold">{subject.topicsCount || 0} Topics</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-crimson" />
                <span className="text-swiss-black dark:text-white tabular-nums font-bold">{subject.completedTopics || 0} Completed</span>
              </div>
            </div>
          </div>

          {/* Action CTAs */}
          <div className="flex flex-col sm:flex-row lg:flex-col gap-3 shrink-0">
            {nextTopic && (
              <Button
                onClick={() => navigate(`/study/${subject.id}/topic/${nextTopic.id}`)}
                variant="primary"
                size="lg"
                icon={Play}
              >
                Proceed With Curriculum
              </Button>
            )}
            <Button
              onClick={() => navigate('/study/upload')}
              variant="outline"
              size="md"
              icon={Upload}
            >
              Upload New Syllabus
            </Button>
          </div>
        </div>

        {/* Overall Progress Bar */}
        <div className="mt-8 pt-6 border-t border-swiss-border dark:border-[#262626]">
          <ProgressBar
            value={subject.progress || 0}
            showLabel
            label="Overall Course Completion"
            variant="crimson"
            size="md"
          />
        </div>
      </div>

      {/* Unit Accordions List or Raw Extracted Text */}
      {units.length > 0 ? (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-headline font-bold text-swiss-black dark:text-white tracking-tight">
              Curriculum Units & Learning Modules
            </h2>
            <span className="text-xs font-mono text-[#737373]">
              Snap modules to expand topics
            </span>
          </div>

          <div className="space-y-4">
            {units.map((unit) => (
              <UnitAccordion
                key={unit.id}
                unit={unit}
                subjectId={subject.id}
                defaultOpen={unit.unitNumber === 1}
              />
            ))}
          </div>
        </div>
      ) : (
        <div className="bg-white dark:bg-[#171717] rounded-lg border border-swiss-border dark:border-[#262626] p-6 sm:p-8 space-y-4">
          <div className="flex items-center justify-between border-b border-swiss-border dark:border-[#262626] pb-3">
            <h2 className="text-base font-headline font-bold text-swiss-black dark:text-white flex items-center gap-2 tracking-tight">
              <BookOpen className="w-4 h-4 text-crimson" />
              Verified Syllabus Document Text
            </h2>
            <span className="text-[10px] font-mono uppercase tracking-wider text-crimson bg-[#fef2f2] dark:bg-crimson/10 border border-crimson/20 px-2 py-0.5 rounded font-bold">
              Ready for Unit Deconstruction
            </span>
          </div>

          {subject.rawText || subject.raw_text ? (
            <pre className="p-4 rounded-lg bg-swiss-surface dark:bg-[#121212] font-mono text-xs leading-relaxed text-swiss-black dark:text-[#d4d4d4] whitespace-pre-wrap break-words max-h-96 overflow-y-auto border border-swiss-border dark:border-[#262626]">
              {subject.rawText || subject.raw_text}
            </pre>
          ) : (
            <p className="text-xs text-[#737373] font-mono">
              Syllabus text verified. Units will be structured during AI ingestion.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
