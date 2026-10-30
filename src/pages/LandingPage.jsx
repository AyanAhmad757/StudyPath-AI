import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Sparkles,
  BookOpen,
  FileText,
  Video,
  CheckCircle2,
  ArrowRight,
  BrainCircuit,
  GraduationCap,
  Zap,
  HelpCircle,
  BarChart3,
} from 'lucide-react';

export default function LandingPage() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-white dark:bg-[#121212] text-[#1b1c1c] dark:text-[#f2f0f0] flex flex-col selection:bg-crimson/15 selection:text-crimson">
      {/* Top Navbar: 1px hairline border, crisp typography */}
      <header className="sticky top-0 z-50 backdrop-blur-md bg-white/95 dark:bg-[#171717]/95 border-b border-[#e5e5e5] dark:border-[#262626]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-md bg-[#0a0a0a] dark:bg-white flex items-center justify-center text-white dark:text-[#0a0a0a]">
              <GraduationCap className="w-4 h-4" />
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-lg font-headline font-bold tracking-tight text-[#0a0a0a] dark:text-white">StudyPath</span>
              <span className="text-[10px] uppercase font-headline font-bold tracking-wider bg-[#fef2f2] text-crimson dark:bg-crimson/20 border border-crimson/30 px-1.5 py-0.2 rounded">
                AI
              </span>
            </div>
          </Link>

          <nav className="flex items-center gap-3">
            {user ? (
              <Link
                to="/dashboard"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-crimson hover:bg-crimson-hover text-white font-headline font-bold text-xs uppercase tracking-wider transition-colors shadow-xs"
              >
                Go to Dashboard
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            ) : (
              <div className="flex items-center gap-2.5">
                <Link
                  to="/login"
                  className="px-3.5 py-2 text-xs font-headline font-bold text-[#737373] hover:text-[#0a0a0a] dark:hover:text-white uppercase tracking-wider transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  to="/signup"
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-crimson hover:bg-crimson-hover text-white font-headline font-bold text-xs uppercase tracking-wider transition-colors shadow-xs"
                >
                  Get Started
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            )}
          </nav>
        </div>
      </header>

      {/* Hero Section: International Typographic Style, stark contrast, disciplined grid */}
      <main className="flex-1">
        <section className="relative overflow-hidden pt-16 pb-20 md:pt-24 md:pb-28 border-b border-[#e5e5e5] dark:border-[#262626]">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded bg-[#fef2f2] dark:bg-crimson/20 border border-crimson/30 text-crimson text-xs font-headline font-bold uppercase tracking-wider mb-6">
              <Sparkles className="w-3.5 h-3.5" />
              International Typographic Standard • Research & Curriculum AI
            </div>

            <h1 className="text-4xl sm:text-5xl md:text-6xl font-headline font-bold tracking-tight text-[#0a0a0a] dark:text-white leading-[1.12]">
              Rigorous Academic Curriculum &{' '}
              <span className="text-crimson">
                Deep Learning Synthesis
              </span>
            </h1>

            <p className="mt-6 text-base sm:text-lg text-[#737373] max-w-3xl mx-auto leading-relaxed font-normal">
              Whether deconstructing an entire university syllabus or mastering a singular technical theorem,
              our shared academic engine builds objective structured lessons, verified video lectures, interactive doubts, and evaluations.
            </p>

            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                to={user ? '/dashboard' : '/signup'}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-lg bg-crimson hover:bg-crimson-hover text-white font-headline font-bold text-xs uppercase tracking-wider transition-colors shadow-xs"
              >
                Start Learning Now
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                to={user ? '/learn' : '/login'}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-lg bg-white dark:bg-[#171717] hover:bg-[#f4f4f4] dark:hover:bg-[#262626] text-[#0a0a0a] dark:text-white border border-[#0a0a0a] dark:border-white font-headline font-bold text-xs uppercase tracking-wider transition-colors"
              >
                <Sparkles className="w-4 h-4 text-crimson" />
                Try "Learn Anything" Mode
              </Link>
            </div>

            {/* Feature highlights: hairline division */}
            <div className="mt-14 pt-8 border-t border-[#f4f4f4] dark:border-neutral-800 flex flex-wrap items-center justify-center gap-6 sm:gap-8 text-xs text-[#737373] font-headline font-semibold">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-crimson" /> Complete Syllabus Deconstruction
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-crimson" /> PDF, DOCX, TXT & Scanned OCR
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-crimson" /> Deterministic Quiz Scoring
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-crimson" /> Real YouTube Video Discovery
              </span>
            </div>
          </div>
        </section>

        {/* Dual Learning Modes Grid */}
        <section className="py-20 bg-[#fafafa] dark:bg-[#171717] border-b border-[#e5e5e5] dark:border-[#262626]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <span className="text-[10px] font-headline font-bold text-crimson uppercase tracking-wider">
                Architectural Execution
              </span>
              <h2 className="text-2xl sm:text-3xl font-headline font-bold tracking-tight text-[#0a0a0a] dark:text-white mt-1">
                Two Purpose-Built Learning Modes
              </h2>
              <p className="mt-2 text-[#737373] text-sm">
                Engineered for university courses, technical competitive exams, and self-directed deep research.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Mode A: Complete Syllabus Learning */}
              <div className="p-8 rounded-lg bg-white dark:bg-[#121212] border border-[#e5e5e5] dark:border-[#262626] hover:border-[#0a0a0a] dark:hover:border-white transition-all flex flex-col justify-between group">
                <div>
                  <div className="w-10 h-10 rounded-md bg-[#f4f4f4] dark:bg-neutral-800 border border-[#e5e5e5] dark:border-neutral-700 flex items-center justify-center text-crimson mb-6">
                    <BookOpen className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] uppercase font-headline font-bold tracking-wider text-crimson">
                    Mode A
                  </span>
                  <h3 className="text-xl font-headline font-bold text-[#0a0a0a] dark:text-white mt-1 mb-3">
                    Complete Syllabus Curriculum
                  </h3>
                  <p className="text-[#737373] text-xs leading-relaxed mb-6">
                    Upload your university course syllabus as a PDF, Word document, or scanned image.
                    Our engine automatically analyzes and organizes units, chapters, and topics into an editable curriculum tree.
                    Lessons are generated on demand as you study topic-by-topic.
                  </p>
                  <ul className="space-y-2.5 text-xs text-[#171717] dark:text-neutral-300 mb-8">
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-crimson mt-0.5 shrink-0" />
                      <span>Extracts hierarchical units and subtopics with original syllabus order</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-crimson mt-0.5 shrink-0" />
                      <span>Review, reorder, add, and delete topics prior to curriculum enrollment</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-crimson mt-0.5 shrink-0" />
                      <span>Tracks unit and course-level completion percentages automatically</span>
                    </li>
                  </ul>
                </div>
                <Link
                  to={user ? '/study/upload' : '/login'}
                  className="inline-flex items-center gap-1.5 text-xs font-headline font-bold uppercase tracking-wider text-[#0a0a0a] dark:text-white hover:text-crimson transition-colors"
                >
                  Upload a Syllabus <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              {/* Mode B: Individual Topic and Document Learning */}
              <div className="p-8 rounded-lg bg-white dark:bg-[#121212] border border-[#e5e5e5] dark:border-[#262626] hover:border-[#0a0a0a] dark:hover:border-white transition-all flex flex-col justify-between group">
                <div>
                  <div className="w-10 h-10 rounded-md bg-[#f4f4f4] dark:bg-neutral-800 border border-[#e5e5e5] dark:border-neutral-700 flex items-center justify-center text-crimson mb-6">
                    <BrainCircuit className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] uppercase font-headline font-bold tracking-wider text-crimson">
                    Mode B
                  </span>
                  <h3 className="text-xl font-headline font-bold text-[#0a0a0a] dark:text-white mt-1 mb-3">
                    "Learn Anything" Mode
                  </h3>
                  <p className="text-[#737373] text-xs leading-relaxed mb-6">
                    No course or syllabus needed. Simply enter any concept or upload a lecture slide,
                    research paper, or photo of textbook notes. The AI generates a structured, grounded lesson
                    tailored to your chosen difficulty level.
                  </p>
                  <ul className="space-y-2.5 text-xs text-[#171717] dark:text-neutral-300 mb-8">
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-crimson mt-0.5 shrink-0" />
                      <span>Study single documents, textbook pages, or typed topics directly</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-crimson mt-0.5 shrink-0" />
                      <span>OCR for photos and diagram notes with uncertainty detection</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-crimson mt-0.5 shrink-0" />
                      <span>Save syntheses to your private personal learning library</span>
                    </li>
                  </ul>
                </div>
                <Link
                  to={user ? '/learn' : '/login'}
                  className="inline-flex items-center gap-1.5 text-xs font-headline font-bold uppercase tracking-wider text-[#0a0a0a] dark:text-white hover:text-crimson transition-colors"
                >
                  Launch "Learn Anything" <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* 16-Section Lesson Architecture */}
        <section className="py-20 border-b border-[#e5e5e5] dark:border-[#262626]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <span className="text-[10px] font-headline font-bold text-crimson uppercase tracking-wider">
                Pedagogical Rigor
              </span>
              <h2 className="text-2xl sm:text-3xl font-headline font-bold tracking-tight text-[#0a0a0a] dark:text-white mt-1">
                Comprehensive 16-Section Lesson Architecture
              </h2>
              <p className="mt-2 text-[#737373] text-sm">
                Every generated lesson follows an academic structure calibrated for genuine comprehension, retention, and examination success.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { title: 'Learning Objectives', desc: 'Precise outcomes and prerequisites before starting.', icon: Zap },
                { title: 'Step-by-Step Breakdown', desc: 'Logical, rigorous explanations without hand-waving.', icon: BookOpen },
                { title: 'Key Definitions', desc: 'Standard technical definitions and nomenclature.', icon: FileText },
                { title: 'Worked Examples', desc: 'Analytical derivations with step-by-step problem sets.', icon: BrainCircuit },
                { title: 'Equations & Proofs', desc: 'Formula analysis with symbol definitions and diagrams.', icon: Sparkles },
                { title: 'AI Doubt Solver', desc: 'Interactive Q&A grounded directly in the lesson material.', icon: HelpCircle },
                { title: 'Verified Lectures', desc: 'Real YouTube video discoveries matched to your topic.', icon: Video },
                { title: 'Quizzes & Telemetry', desc: 'Multiple-choice evaluations scored deterministically.', icon: BarChart3 },
              ].map((feature, i) => {
                const Icon = feature.icon;
                return (
                  <div key={i} className="p-5 rounded-lg bg-white dark:bg-[#171717] border border-[#e5e5e5] dark:border-[#262626] space-y-3">
                    <div className="w-8 h-8 rounded-md bg-[#f4f4f4] dark:bg-neutral-800 border border-[#e5e5e5] dark:border-neutral-700 flex items-center justify-center text-crimson">
                      <Icon className="w-4 h-4" />
                    </div>
                    <h4 className="font-headline font-bold text-[#0a0a0a] dark:text-white text-sm">{feature.title}</h4>
                    <p className="text-[#737373] text-xs leading-relaxed">{feature.desc}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* CTA Banner: Deep black / Crimson contrast */}
        <section className="py-20 bg-[#0a0a0a] text-white">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-4">
            <span className="text-[10px] font-headline font-bold uppercase tracking-wider text-crimson">
              Get Started Today
            </span>
            <h2 className="text-3xl sm:text-4xl font-headline font-bold text-white tracking-tight">
              Ready to Upgrade How You Study?
            </h2>
            <p className="text-sm text-[#737373] max-w-2xl mx-auto leading-relaxed">
              Create an account in seconds to begin uploading your syllabi or exploring individual topics with AI.
            </p>
            <div className="pt-4">
              <Link
                to={user ? '/dashboard' : '/signup'}
                className="inline-flex items-center gap-2 px-8 py-3.5 rounded-lg bg-crimson hover:bg-crimson-hover text-white font-headline font-bold text-xs uppercase tracking-wider transition-colors shadow-xs"
              >
                Get Started Free
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-[#e5e5e5] dark:border-[#262626] bg-white dark:bg-[#121212] py-8 text-center text-xs text-[#737373]">
        <p>© 2026 StudyPath AI. International Typographic Style for Serious Students.</p>
      </footer>
    </div>
  );
}
