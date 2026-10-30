import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { careerService } from '../services/careerService';
import CareerCard from '../components/career/CareerCard';
import Button from '../components/common/Button';
import { Sparkles, Target } from 'lucide-react';

export default function CareerPage() {
  const [careers, setCareers] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    async function load() {
      const list = await careerService.getCareers();
      setCareers(list);
    }
    load();
  }, []);

  return (
    <div className="space-y-6 sm:space-y-8 animate-fadeIn">
      {/* Top Banner */}
      <div className="p-6 sm:p-8 rounded-lg bg-[#0a0a0a] text-white border border-[#262626] relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(#262626_1px,transparent_1px)] [background-size:24px_24px] opacity-40 pointer-events-none" />
        <div className="relative z-10 max-w-2xl space-y-3">
          <span className="text-[10px] uppercase font-mono font-bold tracking-widest text-crimson bg-[#171717] border border-[#262626] px-3 py-1 rounded flex items-center gap-1.5 w-fit">
            <Sparkles className="w-3 h-3 text-crimson" />
            Engineering Career Telemetry
          </span>
          <h1 className="text-2xl sm:text-3xl font-headline font-bold tracking-tight text-white">
            Industry Benchmark & Career Pathways
          </h1>
          <p className="text-xs sm:text-sm text-[#d4d4d4] leading-relaxed">
            Benchmark current semester theoretical competencies against industry engineering standards, diagnose critical skill deficiencies, and calibrate an authoritative 5-phase career roadmap.
          </p>

          <div className="pt-2">
            <Button
              onClick={() => navigate('/career/assessment')}
              variant="primary"
              size="lg"
              icon={Target}
            >
              Calibrate Skill Gap Diagnostic
            </Button>
          </div>
        </div>
      </div>

      {/* Career Grid */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-headline font-bold text-swiss-black dark:text-white tracking-tight">
            Specialized Software Engineering Disciplines
          </h2>
          <span className="text-xs font-mono text-[#737373]">
            Indexed for 2025 Industry Standards
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {careers.map((career) => (
            <CareerCard key={career.id} career={career} />
          ))}
        </div>
      </div>
    </div>
  );
}
