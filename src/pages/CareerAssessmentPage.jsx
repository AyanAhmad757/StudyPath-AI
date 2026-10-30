import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { skillService } from '../services/skillService';
import { aiService } from '../services/aiService';
import SkillConfidenceSelector from '../components/career/SkillConfidenceSelector';
import AIAnalysisStepProgress from '../components/study/AIAnalysisStepProgress';
import Button from '../components/common/Button';
import { Sparkles, ArrowLeft } from 'lucide-react';

export default function CareerAssessmentPage() {
  const { skillRatings, updateSkillRatings, careerRoadmap } = useApp();
  const navigate = useNavigate();

  const [categories, setCategories] = useState([]);
  const [ratings, setRatings] = useState(skillRatings);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [currentLabel, setCurrentLabel] = useState('Reviewing your skills...');

  useEffect(() => {
    async function loadSkills() {
      const cats = await skillService.getAllSkills();
      setCategories(cats);
    }
    loadSkills();
  }, []);

  const handleRatingChange = (skillId, newLevel) => {
    const updated = { ...ratings, [skillId]: newLevel };
    setRatings(updated);
  };

  const handleStartAnalysis = async () => {
    setIsAnalyzing(true);
    await updateSkillRatings(ratings);

    const career = {
      id: 'career-fullstack',
      name: careerRoadmap?.careerName || 'Full Stack Developer',
    };

    await aiService.analyzeSkillsAndCareer(
      career,
      ratings,
      (step, label) => {
        setCurrentStep(step);
        setCurrentLabel(label);
      }
    );

    setTimeout(() => {
      navigate('/career/roadmap');
    }, 400);
  };

  return (
    <div className="space-y-6 sm:space-y-8 animate-fadeIn max-w-6xl mx-auto">
      {/* Back button + Header */}
      <div>
        <button
          onClick={() => navigate('/career')}
          className="inline-flex items-center gap-1.5 text-xs font-mono font-bold text-[#737373] hover:text-crimson transition-colors mb-3 uppercase tracking-wider"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to Career Tracks
        </button>

        <div className="flex items-center gap-2 mb-1">
          <span className="text-[10px] uppercase font-mono font-bold tracking-widest text-crimson bg-[#fef2f2] dark:bg-crimson/10 border border-crimson/20 px-2.5 py-0.5 rounded flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-crimson" />
            Target Pathway: {careerRoadmap.careerName}
          </span>
        </div>

        <h1 className="text-2xl sm:text-3xl font-headline font-bold text-swiss-black dark:text-white tracking-tight">
          Calibrate Current Technical Proficiencies
        </h1>
        <p className="text-xs sm:text-sm text-[#737373] mt-1 max-w-2xl">
          Evaluate your verified confidence in each technical area. Friday AI computes your deficiency percentages against industry criteria to calibrate a step-by-step roadmap.
        </p>
      </div>

      {!isAnalyzing ? (
        <div className="space-y-8">
          {/* Categories and Skill Cards */}
          {categories.map((cat, idx) => (
            <div key={idx} className="space-y-3">
              <div className="flex items-center gap-2 pb-2 border-b border-swiss-border dark:border-[#262626]">
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-crimson">
                  {cat.name}
                </span>
                <span className="text-xs font-mono text-[#737373]">
                  ({cat.skills?.length || 0} skills)
                </span>
              </div>

              <div className="space-y-3">
                {(cat.skills || []).map((skill) => (
                  <SkillConfidenceSelector
                    key={skill.id}
                    skill={skill}
                    selectedLevel={ratings[skill.id] ?? ratings[skill.name] ?? skill.defaultLevel ?? 0}
                    onChange={handleRatingChange}
                  />
                ))}
              </div>
            </div>
          ))}

          {/* Bottom Action */}
          <div className="p-6 rounded-lg bg-white/95 dark:bg-[#121212]/95 backdrop-blur-md border border-swiss-border dark:border-[#262626] flex flex-col sm:flex-row sm:items-center justify-between gap-4 sticky bottom-4 z-10">
            <div>
              <h4 className="text-sm font-headline font-bold text-swiss-black dark:text-white tracking-tight">
                Ready to synthesize your engineering pathway?
              </h4>
              <p className="text-xs text-[#737373] font-mono">
                Friday AI will evaluate your gap percentage and prioritize learning sequences.
              </p>
            </div>

            <Button
              onClick={handleStartAnalysis}
              variant="primary"
              size="lg"
              icon={Sparkles}
              className="shrink-0"
            >
              Synthesize Career Roadmap
            </Button>
          </div>
        </div>
      ) : (
        <AIAnalysisStepProgress
          currentStep={currentStep}
          totalSteps={5}
          currentLabel={currentLabel}
          title="Analyzing your skills & roadmap..."
          steps={[
            { step: 1, name: 'Reviewing your submitted skill proficiencies' },
            { step: 2, name: 'Comparing against Full Stack Developer requirements' },
            { step: 3, name: 'Identifying high-impact skill gaps & bottlenecks' },
            { step: 4, name: 'Building customized 5-phase learning roadmap' },
            { step: 5, name: 'Preparing tailored portfolio recommendations' },
          ]}
        />
      )}
    </div>
  );
}
