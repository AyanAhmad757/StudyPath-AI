import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { syllabusService } from '../services/syllabusService';
import VideoCard from '../components/study/VideoCard';
import Badge from '../components/common/Badge';
import Button from '../components/common/Button';
import Card from '../components/common/Card';
import {
  BookOpen,
  Clock,
  ArrowLeft,
  ArrowRight,
  Sparkles,
  Check,
  Lightbulb,
  Layers,
  Flame,
} from 'lucide-react';

export default function TopicDetailPage() {
  const { syllabusId, topicId } = useParams();
  const { toggleTopicCompletion } = useApp();
  const navigate = useNavigate();

  const [topicDetail, setTopicDetail] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      const data = await syllabusService.getTopicDetail(syllabusId, topicId);
      setTopicDetail(data);
      setLoading(false);
    }
    loadData();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [syllabusId, topicId]);

  if (loading || !topicDetail) {
    return (
      <div className="p-12 text-center text-on-surface-variant font-headline">
        Loading topic theory and resources...
      </div>
    );
  }

  const handleToggleComplete = async () => {
    const res = await toggleTopicCompletion(syllabusId, topicId);
    if (res.success) {
      setTopicDetail((prev) => ({
        ...prev,
        completed: res.completed,
        progress: res.completed ? 100 : 30,
      }));
    }
  };

  return (
    <div className="space-y-6 sm:space-y-8 animate-fadeIn max-w-7xl mx-auto">
      {/* Top Breadcrumb navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate(`/study/${syllabusId}`)}
          className="inline-flex items-center gap-1.5 text-xs font-mono font-bold text-[#737373] hover:text-crimson transition-colors uppercase tracking-wider"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to {topicDetail.subjectName} Syllabus
        </button>

        <div className="flex items-center gap-2">
          <Badge variant="crimson" size="sm">
            Unit {topicDetail.unitNumber}
          </Badge>
          <Badge variant="default" size="sm" icon={Clock}>
            {topicDetail.estimatedTime}
          </Badge>
        </div>
      </div>

      {/* Topic Header Hero */}
      <div className="p-6 sm:p-8 rounded-lg bg-white dark:bg-[#171717] border border-swiss-border dark:border-[#262626]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
          <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-crimson">
            {topicDetail.subjectName} • {topicDetail.unitTitle}
          </span>
          <span
            className={`text-xs font-mono font-bold px-3 py-1 rounded border self-start sm:self-auto ${
              topicDetail.completed
                ? 'bg-[#fef2f2] dark:bg-crimson/10 text-crimson border-crimson/30'
                : 'bg-swiss-surface dark:bg-[#262626] text-swiss-black dark:text-white border-swiss-border dark:border-[#333333]'
            }`}
          >
            {topicDetail.completed ? 'Completed ✓' : 'In Progress'}
          </span>
        </div>

        <h1 className="text-2xl sm:text-3xl font-headline font-bold text-swiss-black dark:text-white tracking-tight mb-4">
          {topicDetail.title}
        </h1>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-4 border-t border-swiss-border dark:border-[#262626]">
          <div className="flex items-center gap-4 text-xs font-mono text-[#737373]">
            <span>Difficulty: <strong className="text-swiss-black dark:text-white">{topicDetail.difficulty}</strong></span>
            <span>•</span>
            <span>Est. Time: <strong className="text-swiss-black dark:text-white tabular-nums">{topicDetail.estimatedTime}</strong></span>
          </div>

          <Button
            onClick={handleToggleComplete}
            variant={topicDetail.completed ? 'outline' : 'primary'}
            size="md"
            icon={Check}
          >
            {topicDetail.completed ? 'Mark Incomplete' : 'Mark as Completed'}
          </Button>
        </div>
      </div>

      {/* Learning Objectives Checklist */}
      {topicDetail.learningObjectives && (
        <Card className="p-6 bg-white dark:bg-[#171717] border border-swiss-border dark:border-[#262626]">
          <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-crimson mb-3 flex items-center gap-2">
            <Sparkles className="w-3.5 h-3.5 text-crimson" />
            Learning Objectives & Core Competencies
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {topicDetail.learningObjectives.map((obj, idx) => (
              <div key={idx} className="flex items-start gap-2.5 text-xs sm:text-sm text-swiss-black dark:text-[#d4d4d4]">
                <div className="w-4 h-4 rounded bg-swiss-surface dark:bg-[#262626] border border-swiss-border dark:border-[#333333] text-crimson flex items-center justify-center shrink-0 mt-0.5">
                  <Check className="w-3 h-3 stroke-[3]" />
                </div>
                <span>{obj}</span>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Rich Educational Theory Content */}
      <div className="space-y-6">
        {/* Section 1: Overview */}
        <Card className="p-6 sm:p-8 space-y-4">
          <h2 className="text-lg sm:text-xl font-headline font-bold text-swiss-black dark:text-white flex items-center gap-2 pb-2 border-b border-swiss-border dark:border-[#262626] tracking-tight">
            <BookOpen className="w-4 h-4 text-crimson" />
            Theoretical Foundation & Overview
          </h2>
          <p className="text-sm sm:text-base text-swiss-black dark:text-[#d4d4d4] leading-relaxed">
            {topicDetail.overview}
          </p>

          {/* Key Concepts Box */}
          {topicDetail.keyConcepts && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4">
              {topicDetail.keyConcepts.map((kc, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-lg bg-swiss-surface dark:bg-[#1f1f1f] border border-swiss-border dark:border-[#262626] space-y-1.5"
                >
                  <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-crimson">
                    {kc.title}
                  </h4>
                  <p className="text-xs text-[#737373] leading-relaxed">
                    {kc.content}
                  </p>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Section 2: OSI 7-Layer Breakdown Cards */}
        {topicDetail.layers && (
          <Card className="p-6 sm:p-8 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-swiss-border dark:border-[#262626]">
              <h2 className="text-lg sm:text-xl font-headline font-bold text-swiss-black dark:text-white flex items-center gap-2 tracking-tight">
                <Layers className="w-4 h-4 text-crimson" />
                Architectural Layer Hierarchy
              </h2>
              <span className="text-xs font-mono text-[#737373]">
                Layer 7 to Layer 1
              </span>
            </div>

            <div className="space-y-3 pt-2">
              {topicDetail.layers.map((layer) => (
                <div
                  key={layer.number}
                  className="p-4 sm:p-5 rounded-lg bg-white dark:bg-[#1f1f1f] border border-swiss-border dark:border-[#262626] hover:border-swiss-black dark:hover:border-white transition-colors"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                    <div className="flex items-center gap-3">
                      <span className="w-7 h-7 rounded bg-[#0a0a0a] text-white font-mono font-bold text-xs flex items-center justify-center shrink-0">
                        L{layer.number}
                      </span>
                      <h3 className="text-base font-headline font-bold text-swiss-black dark:text-white tracking-tight">
                        {layer.name}
                      </h3>
                    </div>

                    <div className="flex items-center gap-2 self-start sm:self-auto font-mono text-xs">
                      <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-swiss-surface dark:bg-[#262626] border border-swiss-border dark:border-[#333333] text-swiss-black dark:text-white">
                        PDU: {layer.pdu}
                      </span>
                      <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-[#fef2f2] dark:bg-crimson/10 border border-crimson/30 text-crimson">
                        {layer.mnemonic}
                      </span>
                    </div>
                  </div>

                  <p className="text-xs sm:text-sm text-[#737373] leading-relaxed mb-3">
                    {layer.description}
                  </p>

                  <div className="text-xs text-[#737373] pt-2 border-t border-swiss-border dark:border-[#262626] flex items-center gap-2 font-mono">
                    <span className="font-bold text-swiss-black dark:text-white">Protocols:</span>
                    <span className="text-crimson font-bold">{layer.protocols}</span>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Section 3: How It Works & Real-world Analogy */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {topicDetail.howItWorks && (
            <Card className="p-6 space-y-3">
              <h3 className="text-base font-headline font-bold text-swiss-black dark:text-white flex items-center gap-2 tracking-tight">
                <Sparkles className="w-4 h-4 text-crimson" />
                Operational Model & Execution Flow
              </h3>
              <div className="text-xs sm:text-sm text-swiss-black dark:text-[#d4d4d4] whitespace-pre-line leading-relaxed">
                {topicDetail.howItWorks}
              </div>
            </Card>
          )}

          {topicDetail.realWorldExample && (
            <Card className="p-6 space-y-3 bg-white dark:bg-[#171717] border border-swiss-border dark:border-[#262626]">
              <h3 className="text-base font-headline font-bold text-swiss-black dark:text-white flex items-center gap-2 tracking-tight">
                <Lightbulb className="w-4 h-4 text-crimson" />
                {topicDetail.realWorldExample.title}
              </h3>
              <div className="text-xs sm:text-sm text-swiss-black dark:text-[#d4d4d4] whitespace-pre-line leading-relaxed">
                {topicDetail.realWorldExample.content}
              </div>
            </Card>
          )}
        </div>

        {/* Section 4: University Exam Tips */}
        {topicDetail.examTips && (
          <Card className="p-6 bg-white dark:bg-[#171717] border border-crimson/30 space-y-3">
            <h3 className="text-base font-headline font-bold text-swiss-black dark:text-white flex items-center gap-2 tracking-tight">
              <Flame className="w-4 h-4 text-crimson" />
              High-Frequency University Exam Directives & Viva Questions
            </h3>
            <div className="space-y-2">
              {topicDetail.examTips.map((tip, idx) => (
                <p key={idx} className="text-xs sm:text-sm text-swiss-black dark:text-[#d4d4d4] leading-relaxed">
                  {tip}
                </p>
              ))}
            </div>
          </Card>
        )}

        {/* Section 5: Key Terms */}
        {topicDetail.keyTerms && (
          <Card className="p-6 space-y-3">
            <h3 className="text-base font-headline font-bold text-swiss-black dark:text-white mb-2 tracking-tight">
              Authoritative Terminology & Definitions
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {topicDetail.keyTerms.map((term, idx) => (
                <div key={idx} className="p-3.5 bg-swiss-surface dark:bg-[#1f1f1f] rounded-lg border border-swiss-border dark:border-[#262626]">
                  <span className="text-xs font-mono font-bold text-crimson block mb-1">
                    {term.term}
                  </span>
                  <span className="text-xs text-[#737373] leading-relaxed">
                    {term.definition}
                  </span>
                </div>
              ))}
            </div>
          </Card>
        )}
      </div>

      {/* Recommended YouTube Video Section */}
      <div className="space-y-4 pt-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-headline font-bold text-swiss-black dark:text-white tracking-tight">
              Authoritative Video Lectures & Technical Syntheses
            </h2>
            <p className="text-xs text-[#737373]">
              Curated pedagogical video lectures strictly aligned with topic units
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {topicDetail.videos.map((video) => (
            <VideoCard key={video.id} video={video} />
          ))}
        </div>
      </div>

      {/* Topic Bottom Navigation */}
      <div className="pt-6 border-t border-swiss-border dark:border-[#262626] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {topicDetail.prevTopicId ? (
          <Button
            onClick={() => navigate(`/study/${syllabusId}/topic/${topicDetail.prevTopicId}`)}
            variant="outline"
            size="lg"
            icon={ArrowLeft}
          >
            Preceding Topic
          </Button>
        ) : (
          <div />
        )}

        <div className="flex items-center gap-3">
          <Button
            onClick={handleToggleComplete}
            variant={topicDetail.completed ? 'outline' : 'primary'}
            size="lg"
            icon={Check}
          >
            {topicDetail.completed ? 'Completed ✓' : 'Mark as Completed'}
          </Button>

          {topicDetail.nextTopicId && (
            <Button
              onClick={() => navigate(`/study/${syllabusId}/topic/${topicDetail.nextTopicId}`)}
              variant="primary"
              size="lg"
              icon={ArrowRight}
              iconPosition="right"
            >
              Next Topic
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
