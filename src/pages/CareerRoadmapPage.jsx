import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import RoadmapTimeline from '../components/career/RoadmapTimeline';
import SkillGapBar from '../components/career/SkillGapBar';
import ProjectRecommendationCard from '../components/career/ProjectRecommendationCard';
import Badge from '../components/common/Badge';
import Button from '../components/common/Button';
import Card from '../components/common/Card';
import {
  Compass,
  Sparkles,
  ArrowLeft,
  FolderGit2,
  Play,
  RotateCcw,
  Target,
} from 'lucide-react';

export default function CareerRoadmapPage() {
  const { careerRoadmap } = useApp();
  const navigate = useNavigate();

  return (
    <div className="space-y-8 animate-fadeIn max-w-6xl mx-auto">
      {/* Top Breadcrumb & Retake CTA */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <button
          onClick={() => navigate('/career')}
          className="inline-flex items-center gap-1.5 text-xs font-mono font-bold text-[#737373] hover:text-crimson transition-colors uppercase tracking-wider"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to Career Tracks
        </button>

        <Button
          onClick={() => navigate('/career/assessment')}
          variant="outline"
          size="sm"
          icon={RotateCcw}
        >
          Recalibrate Diagnostics
        </Button>
      </div>

      {/* Header Banner */}
      <div className="p-6 sm:p-8 rounded-lg bg-[#0a0a0a] text-white border border-[#262626] relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(#262626_1px,transparent_1px)] [background-size:24px_24px] opacity-40 pointer-events-none" />

        <div className="relative z-10 space-y-4 max-w-3xl">
          <div className="flex items-center gap-2">
            <span className="text-[10px] uppercase font-mono font-bold tracking-widest text-crimson bg-[#171717] border border-[#262626] px-3 py-1 rounded flex items-center gap-1.5 w-fit">
              <Sparkles className="w-3 h-3 text-crimson" />
              Verified Career Trajectory
            </span>
            <span className="text-xs font-mono text-[#a3a3a3]">
              Diagnostic Tier: {careerRoadmap.currentLevel}
            </span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-headline font-bold tracking-tight text-white">
            {careerRoadmap.careerName} Roadmap
          </h1>
          <p className="text-xs sm:text-sm text-[#d4d4d4] leading-relaxed">
            {careerRoadmap.summary}
          </p>

          {/* Roadmap Milestone Progress */}
          <div className="pt-2 max-w-lg">
            <div className="flex justify-between items-center text-xs font-mono mb-1.5 text-[#a3a3a3]">
              <span>Cumulative Phase Progress</span>
              <span className="text-crimson font-bold tabular-nums">{careerRoadmap.overallProgress}%</span>
            </div>
            <div className="w-full bg-[#262626] rounded h-2 overflow-hidden">
              <div
                className="bg-crimson h-full rounded transition-all duration-700"
                style={{ width: `${careerRoadmap.overallProgress}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Recommended Next Step AI Card */}
      {careerRoadmap.recommendedNextStep && (
        <Card className="p-6 sm:p-7 bg-white dark:bg-[#171717] border border-swiss-border dark:border-[#262626]">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-3">
            <div className="flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-wider text-crimson">
              <Sparkles className="w-3.5 h-3.5 text-crimson" />
              <span>Immediate Milestone Target</span>
            </div>
            <Badge variant="crimson" size="sm">
              {careerRoadmap.recommendedNextStep.badge}
            </Badge>
          </div>

          <h3 className="text-xl font-headline font-bold text-swiss-black dark:text-white mb-2 tracking-tight">
            {careerRoadmap.recommendedNextStep.title}
          </h3>
          <p className="text-xs sm:text-sm text-[#737373] leading-relaxed mb-4 max-w-3xl">
            {careerRoadmap.recommendedNextStep.why}
          </p>

          <div className="flex flex-wrap items-center justify-between gap-4 pt-3 border-t border-swiss-border dark:border-[#262626]">
            <span className="text-xs font-mono text-[#737373] tabular-nums">
              Estimated Duration: {careerRoadmap.recommendedNextStep.estimatedDuration}
            </span>
            <Button
              onClick={() => navigate('/study/cn-101/topic/cn-t4')}
              variant="primary"
              size="md"
              icon={Play}
            >
              Initiate Milestone
            </Button>
          </div>
        </Card>
      )}

      {/* Main Two-Column Layout: Timeline on Left, Skill Gap on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column (2 spans): Vertical Timeline */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-headline font-bold text-swiss-black dark:text-white flex items-center gap-2 tracking-tight">
              <Compass className="w-4 h-4 text-crimson" />
              Disciplined Phase Progression
            </h2>
            <span className="text-xs font-mono text-[#737373] tabular-nums">
              {careerRoadmap.phases.length} Phases Total
            </span>
          </div>

          <RoadmapTimeline roadmap={careerRoadmap} />
        </div>

        {/* Right Column (1 span): Skill Gap & Priorities */}
        <div className="space-y-6">
          {/* Skill Gap Analysis Box */}
          <Card className="p-6 space-y-4">
            <div>
              <h3 className="text-base font-headline font-bold text-swiss-black dark:text-white flex items-center gap-2 tracking-tight">
                <Target className="w-4 h-4 text-crimson" />
                Deficiency Diagnostics
              </h3>
              <p className="text-xs text-[#737373] mt-0.5">
                Current proficiencies benchmarked against hiring standards
              </p>
            </div>

            <div className="space-y-2.5 pt-1">
              {careerRoadmap.skillGaps.map((item, idx) => (
                <SkillGapBar key={idx} skillItem={item} />
              ))}
            </div>
          </Card>

          {/* Priority Skills List */}
          <Card className="p-6 space-y-3">
            <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-crimson flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5 text-crimson" />
              Priority Competencies to Acquire
            </h3>
            <div className="space-y-2.5">
              {careerRoadmap.prioritySkills.map((p) => (
                <div key={p.rank} className="p-3.5 rounded-lg bg-swiss-surface dark:bg-[#1f1f1f] border border-swiss-border dark:border-[#262626] flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded bg-[#0a0a0a] text-white font-mono font-bold text-xs flex items-center justify-center shrink-0">
                    {p.rank}
                  </span>
                  <div>
                    <h4 className="text-xs font-headline font-bold text-swiss-black dark:text-white">
                      {p.name}
                    </h4>
                    <p className="text-[11px] text-[#737373] mt-0.5 leading-tight">
                      {p.reason}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>

      {/* Recommended Projects Section */}
      <div className="space-y-4 pt-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-headline font-bold text-swiss-black dark:text-white flex items-center gap-2 tracking-tight">
              <FolderGit2 className="w-4 h-4 text-crimson" />
              Practical Implementation Projects
            </h2>
            <p className="text-xs text-[#737373]">
              Apply theoretical competencies in production-ready software repositories
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {careerRoadmap.projectRecommendations.map((project) => (
            <ProjectRecommendationCard key={project.id} project={project} />
          ))}
        </div>
      </div>
    </div>
  );
}
