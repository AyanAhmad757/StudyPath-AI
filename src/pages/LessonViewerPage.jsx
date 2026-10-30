import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { lessonService } from '../services/api/lessonService';
import { aiTeachingEngine } from '../services/api/aiTeachingEngine';
import { videoDiscoveryService } from '../services/api/videoDiscoveryService';
import { quizEngineService } from '../services/api/quizEngineService';
import { learningProgressService } from '../services/api/learningProgressService';
import confetti from 'canvas-confetti';
import {
  BookOpen,
  Sparkles,
  HelpCircle,
  Video,
  CheckCircle2,
  AlertCircle,
  ChevronRight,
  Send,
  RefreshCw,
  ArrowLeft,
  GraduationCap,
  FileText,
  ExternalLink,
  Flame,
  Award,
  RotateCcw,
  ListOrdered,
  Layers,
  Calculator,
} from 'lucide-react';

export default function LessonViewerPage() {
  const { lessonId, syllabusId, topicId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  // Lesson State
  const [lesson, setLesson] = useState(null);
  const [content, setContent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('lesson'); // 'lesson', 'quiz', 'videos', 'doubts', 'revision'

  // Video State
  const [videos, setVideos] = useState([]);
  const [videosLoading, setVideosLoading] = useState(false);
  const [videoNotice, setVideoNotice] = useState(null);

  // Doubt Solver State
  const [doubtInput, setDoubtInput] = useState('');
  const [doubts, setDoubts] = useState([]);
  const [isAnsweringDoubt, setIsAnsweringDoubt] = useState(false);

  // Quiz Player State
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [quizResult, setQuizResult] = useState(null);
  const [isSubmittingQuiz, setIsSubmittingQuiz] = useState(false);

  // Learning Level Switcher
  const [currentLevel, setCurrentLevel] = useState('intermediate');
  const [isRegeneratingLevel, setIsRegeneratingLevel] = useState(false);

  // Load Lesson on Mount
  useEffect(() => {
    let isMounted = true;
    async function loadLessonData() {
      setLoading(true);
      setError(null);
      try {
        let loaded = null;
        if (lessonId) {
          loaded = await lessonService.getLessonById(lessonId, user?.id);
        }

        if (!loaded && topicId) {
          // If navigated from syllabus without a preexisting lesson, generate on-demand
          const generated = await aiTeachingEngine.generateLesson({
            topicTitle: `Topic ${topicId}`,
            learningLevel: currentLevel,
            courseId: syllabusId || null,
            topicId: topicId || null,
          });

          loaded = await lessonService.saveLesson({
            title: generated.title,
            content: generated.content,
            learningLevel: currentLevel,
            courseId: syllabusId || null,
            topicId: topicId || null,
            userId: user?.id || null,
          });
        }

        if (isMounted) {
          if (!loaded) {
            setError('Lesson could not be loaded. Please return to your courses or library.');
          } else {
            setLesson(loaded);
            const parsed = typeof loaded.content_json === 'string'
              ? JSON.parse(loaded.content_json)
              : loaded.content_json;
            setContent(parsed);
            setCurrentLevel(loaded.learning_level || 'intermediate');

            // Load verified videos
            loadVideos(parsed?.lessonTitle || loaded.title, loaded.id);
          }
        }
      } catch (err) {
        if (isMounted) {
          console.error('Failed to load lesson:', err);
          setError(err.message || 'Error loading lesson.');
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadLessonData();
    return () => { isMounted = false; };
  }, [lessonId, topicId, syllabusId, user?.id]);

  // Load Videos using YouTube Data API
  const loadVideos = async (title, id) => {
    setVideosLoading(true);
    setVideoNotice(null);
    try {
      const res = await videoDiscoveryService.searchVideos({
        topicTitle: title,
        lessonId: id,
      });

      setVideos(res.videos || []);
      if (!res.isConfigured || res.error) {
        setVideoNotice(res.error || 'YouTube Data API integration is unconfigured.');
      }
    } catch (err) {
      setVideoNotice(err.message);
    } finally {
      setVideosLoading(false);
    }
  };

  // Switch Learning Level
  const handleLevelChange = async (newLevel) => {
    if (newLevel === currentLevel || isRegeneratingLevel) return;
    setIsRegeneratingLevel(true);
    try {
      const updated = await aiTeachingEngine.generateLesson({
        topicTitle: content?.lessonTitle || lesson?.title,
        learningLevel: newLevel,
        courseId: lesson?.course_id || null,
        topicId: lesson?.topic_id || null,
      });

      setContent(updated.content);
      setCurrentLevel(newLevel);

      // Save updated level
      await lessonService.saveLesson({
        title: updated.title,
        content: updated.content,
        learningLevel: newLevel,
        courseId: lesson?.course_id || null,
        topicId: lesson?.topic_id || null,
        userId: user?.id || null,
      });
    } catch (err) {
      console.error('Failed to regenerate lesson at level:', err);
    } finally {
      setIsRegeneratingLevel(false);
    }
  };

  // Submit Doubt to AI Doubt Solver
  const handleAskDoubt = async (e) => {
    e.preventDefault();
    const q = doubtInput.trim();
    if (!q || isAnsweringDoubt) return;

    setDoubtInput('');
    setIsAnsweringDoubt(true);

    const newEntry = {
      id: `d-${Date.now()}`,
      question: q,
      answer: null,
      loading: true,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setDoubts((prev) => [...prev, newEntry]);

    try {
      const res = await aiTeachingEngine.askDoubt({
        question: q,
        topicTitle: content?.lessonTitle || lesson?.title,
        lessonContext: content?.simpleIntroduction || '',
        sourceExcerpt: content?.sourceCoverage?.coverageNotes || '',
        learningLevel: currentLevel,
      });

      setDoubts((prev) =>
        prev.map((d) =>
          d.id === newEntry.id
            ? {
                ...d,
                answer: res.answer,
                sourceGrounded: res.sourceGrounded,
                suggestedFollowUps: res.suggestedFollowUps || [],
                loading: false,
              }
            : d
        )
      );
    } catch (err) {
      setDoubts((prev) =>
        prev.map((d) =>
          d.id === newEntry.id
            ? {
                ...d,
                answer: `Unable to get answer: ${err.message}. Please try again.`,
                loading: false,
              }
            : d
        )
      );
    } finally {
      setIsAnsweringDoubt(false);
    }
  };

  // Submit Quiz Answers
  const handleSubmitQuiz = async () => {
    if (!content?.quizQuestions || content.quizQuestions.length === 0 || isSubmittingQuiz) return;
    setIsSubmittingQuiz(true);

    try {
      const result = await quizEngineService.submitQuizAttempt({
        lessonId: lesson?.id || 'temp',
        topicId: lesson?.topic_id || null,
        answers: selectedAnswers,
        quizQuestions: content.quizQuestions,
        userId: user?.id || null,
      });

      setQuizResult(result);
      setQuizSubmitted(true);

      if (result.percentage >= 80) {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
        });
      }
    } catch (err) {
      console.error('Quiz submission error:', err);
    } finally {
      setIsSubmittingQuiz(false);
    }
  };

  const handleRetryQuiz = () => {
    setSelectedAnswers({});
    setQuizSubmitted(false);
    setQuizResult(null);
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto py-16 text-center space-y-4">
        <RefreshCw className="w-8 h-8 text-crimson animate-spin mx-auto" />
        <h2 className="text-xl font-headline font-bold text-[#0a0a0a] dark:text-white">Loading Lesson Synthesis...</h2>
        <p className="text-xs font-headline font-bold uppercase tracking-wider text-[#737373]">Consulting AI teaching engine and curriculum standards.</p>
      </div>
    );
  }

  if (error || !content) {
    return (
      <div className="max-w-2xl mx-auto py-16 text-center space-y-6">
        <div className="w-12 h-12 rounded-lg bg-[#fef2f2] dark:bg-crimson/20 text-crimson flex items-center justify-center mx-auto border border-crimson/30">
          <AlertCircle className="w-6 h-6" />
        </div>
        <h2 className="text-2xl font-headline font-bold text-[#0a0a0a] dark:text-white">Lesson Unavailable</h2>
        <p className="text-[#737373] text-xs leading-relaxed">{error || 'Could not load lesson content.'}</p>
        <Link
          to="/dashboard"
          className="inline-flex items-center gap-2 px-6 py-2.5 rounded-lg bg-[#0a0a0a] text-white hover:bg-[#171717] dark:bg-white dark:text-[#0a0a0a] text-xs font-headline font-bold uppercase tracking-wider transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Return to Dashboard
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto py-4 sm:py-8 space-y-8 animate-fade-in">
      {/* Top Breadcrumb & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#e5e5e5] dark:border-[#262626]">
        <div className="flex items-center gap-2 text-xs text-[#737373] font-medium font-headline">
          <Link to="/dashboard" className="hover:text-[#0a0a0a] dark:hover:text-white transition-colors">
            Dashboard
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-[#737373]" />
          {lesson?.courses?.title ? (
            <>
              <Link to={`/courses/${lesson.course_id}`} className="hover:text-[#0a0a0a] dark:hover:text-white transition-colors">
                {lesson.courses.title}
              </Link>
              <ChevronRight className="w-3.5 h-3.5 text-[#737373]" />
            </>
          ) : (
            <span className="text-[#737373]">Standalone Lesson</span>
          )}
          <span className="text-[#0a0a0a] dark:text-white font-bold truncate max-w-[200px]">
            {content.lessonTitle || lesson.title}
          </span>
        </div>

        {/* Level Selector */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-[#737373] font-headline font-semibold uppercase tracking-wider">Depth:</span>
          <div className="inline-flex p-1 rounded-lg bg-[#fafafa] dark:bg-[#1a1a1a] border border-[#e5e5e5] dark:border-[#262626]">
            {['beginner', 'intermediate', 'advanced'].map((lvl) => (
              <button
                key={lvl}
                onClick={() => handleLevelChange(lvl)}
                disabled={isRegeneratingLevel}
                className={`px-3 py-1 text-xs font-headline font-bold uppercase tracking-wider rounded-md capitalize transition-all ${
                  currentLevel === lvl
                    ? 'bg-[#0a0a0a] text-white dark:bg-white dark:text-[#0a0a0a]'
                    : 'text-[#737373] hover:text-[#0a0a0a] dark:hover:text-white'
                }`}
              >
                {lvl}
              </button>
            ))}
          </div>
          {isRegeneratingLevel && <RefreshCw className="w-3.5 h-3.5 text-crimson animate-spin" />}
        </div>
      </div>

      {/* Lesson Header Banner */}
      <div className="bg-white dark:bg-[#171717] border border-[#e5e5e5] dark:border-[#262626] rounded-lg p-6 sm:p-8 space-y-4">
        <div className="flex flex-wrap items-center gap-2">
          <span className="px-2.5 py-0.5 rounded bg-[#fef2f2] text-crimson dark:bg-crimson/20 text-[10px] font-headline font-bold uppercase tracking-wider border border-crimson/30">
            {currentLevel} Level
          </span>
          {content.sourceCoverage?.groundedInSource && (
            <span className="px-2.5 py-0.5 rounded bg-[#f4f4f4] text-[#171717] dark:bg-neutral-800 dark:text-neutral-200 text-[10px] font-headline font-bold uppercase tracking-wider border border-[#e5e5e5] dark:border-neutral-700 flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3 text-crimson" /> Source Grounded
            </span>
          )}
        </div>

        <h1 className="text-2xl sm:text-3xl md:text-4xl font-headline font-bold text-[#0a0a0a] dark:text-white tracking-tight leading-tight">
          {content.lessonTitle || lesson.title}
        </h1>

        <p className="text-[#444748] dark:text-neutral-300 text-xs sm:text-sm leading-relaxed max-w-3xl">
          {content.simpleIntroduction}
        </p>

        {/* Learning Objectives */}
        {content.learningObjectives && content.learningObjectives.length > 0 && (
          <div className="pt-2">
            <h4 className="text-[10px] font-headline font-bold uppercase tracking-wider text-[#737373] mb-2">
              Key Learning Objectives
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-[#171717] dark:text-neutral-200">
              {content.learningObjectives.map((obj, i) => (
                <div key={i} className="flex items-start gap-2 bg-[#fafafa] dark:bg-[#121212] p-2.5 rounded-lg border border-[#e5e5e5] dark:border-[#262626]">
                  <CheckCircle2 className="w-4 h-4 text-crimson shrink-0 mt-0.5" />
                  <span>{obj}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-[#e5e5e5] dark:border-[#262626] overflow-x-auto pb-2">
        {[
          { id: 'lesson', label: 'Structured Lesson', icon: BookOpen },
          { id: 'quiz', label: `Practice Quiz (${content.quizQuestions?.length || 0})`, icon: Award },
          { id: 'videos', label: `Video Lectures (${videos.length})`, icon: Video },
          { id: 'doubts', label: `Ask AI Doubt (${doubts.length})`, icon: HelpCircle },
          { id: 'revision', label: 'Revision Notes', icon: FileText },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-headline font-bold uppercase tracking-wider whitespace-nowrap transition-all ${
                isActive
                  ? 'bg-[#0a0a0a] text-white dark:bg-white dark:text-[#0a0a0a]'
                  : 'text-[#737373] hover:text-[#0a0a0a] dark:hover:text-white hover:bg-[#fafafa] dark:hover:bg-[#1a1a1a]'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: STRUCTURED LESSON CONTENT */}
      {activeTab === 'lesson' && (
        <div className="space-y-8">
          {/* Detailed Step-by-Step Explanation */}
          <div className="space-y-4">
            <h3 className="text-xs font-headline font-bold text-[#0a0a0a] dark:text-white uppercase tracking-wider flex items-center gap-2">
              <ListOrdered className="w-4 h-4 text-crimson" />
              Step-by-Step Analysis
            </h3>
            <div className="space-y-3">
              {(content.detailedExplanation || []).map((step, idx) => (
                <div key={idx} className="p-5 sm:p-6 rounded-lg bg-white dark:bg-[#171717] border border-[#e5e5e5] dark:border-[#262626] space-y-2.5">
                  <div className="flex items-center gap-2.5">
                    <span className="w-6 h-6 rounded bg-[#f4f4f4] dark:bg-neutral-800 text-crimson border border-[#e5e5e5] dark:border-neutral-700 font-headline font-bold text-xs flex items-center justify-center shrink-0">
                      {step.stepNumber || idx + 1}
                    </span>
                    <h4 className="font-headline font-bold text-[#0a0a0a] dark:text-white text-sm">{step.title}</h4>
                  </div>
                  <p className="text-[#444748] dark:text-neutral-300 text-xs sm:text-sm leading-relaxed whitespace-pre-wrap pl-8">
                    {step.content}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Important Definitions */}
          {content.keyDefinitions && content.keyDefinitions.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-xs font-headline font-bold text-[#0a0a0a] dark:text-white uppercase tracking-wider flex items-center gap-2">
                <Layers className="w-4 h-4 text-crimson" />
                Key Definitions & Concepts
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {content.keyDefinitions.map((item, idx) => (
                  <div key={idx} className="p-4 rounded-lg bg-white dark:bg-[#171717] border border-[#e5e5e5] dark:border-[#262626] space-y-1.5">
                    <div className="font-headline font-bold text-[#0a0a0a] dark:text-white text-xs uppercase tracking-wider">{item.term}</div>
                    <p className="text-[#737373] text-xs leading-relaxed">{item.definition}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Worked Examples */}
          {content.workedExamples && content.workedExamples.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-xs font-headline font-bold text-[#0a0a0a] dark:text-white uppercase tracking-wider flex items-center gap-2">
                <Calculator className="w-4 h-4 text-crimson" />
                Worked Examples & Applications
              </h3>
              <div className="space-y-3">
                {content.workedExamples.map((ex, idx) => (
                  <div key={idx} className="p-5 sm:p-6 rounded-lg bg-white dark:bg-[#171717] border border-[#e5e5e5] dark:border-[#262626] space-y-3">
                    <div className="text-[10px] font-headline font-bold uppercase tracking-wider text-crimson">
                      Example {idx + 1}
                    </div>
                    <p className="font-headline font-bold text-[#0a0a0a] dark:text-white text-sm">{ex.problem}</p>
                    <div className="p-3.5 rounded-lg bg-[#fafafa] dark:bg-[#121212] font-mono text-xs text-[#0a0a0a] dark:text-white border border-[#e5e5e5] dark:border-[#262626]">
                      <span className="text-[#737373] font-sans font-semibold block mb-1">Solution:</span>
                      {ex.solution}
                    </div>
                    {ex.explanation && (
                      <p className="text-[#737373] text-xs leading-relaxed">
                        <span className="font-semibold text-[#0a0a0a] dark:text-white">Explanation:</span> {ex.explanation}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Equations & Formulas */}
          {content.equationsAndFormulas && content.equationsAndFormulas.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-xs font-headline font-bold text-[#0a0a0a] dark:text-white uppercase tracking-wider flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-crimson" />
                Key Formulas & Equations
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {content.equationsAndFormulas.map((eq, idx) => (
                  <div key={idx} className="p-4 rounded-lg bg-white dark:bg-[#171717] border border-[#e5e5e5] dark:border-[#262626] space-y-2">
                    <div className="font-mono text-xs sm:text-sm font-bold text-[#0a0a0a] dark:text-white bg-[#fafafa] dark:bg-[#121212] p-2.5 rounded border border-[#e5e5e5] dark:border-[#262626]">
                      {eq.formula}
                    </div>
                    <p className="text-[#737373] text-xs leading-relaxed">{eq.description}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Key Takeaways */}
          {content.keyPoints && content.keyPoints.length > 0 && (
            <div className="p-5 sm:p-6 rounded-lg bg-white dark:bg-[#171717] border border-[#e5e5e5] dark:border-[#262626] space-y-3">
              <h3 className="text-xs font-headline font-bold uppercase tracking-wider text-[#0a0a0a] dark:text-white flex items-center gap-2">
                <Flame className="w-4 h-4 text-crimson" />
                Core Deductions & Takeaways
              </h3>
              <ul className="space-y-2 text-xs sm:text-sm text-[#444748] dark:text-neutral-300">
                {content.keyPoints.map((pt, i) => (
                  <li key={i} className="flex items-start gap-2.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-crimson mt-2 shrink-0" />
                    <span>{pt}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Bottom Action: Launch Quiz */}
          <div className="p-5 sm:p-6 rounded-lg bg-[#fafafa] dark:bg-[#171717] border border-[#e5e5e5] dark:border-[#262626] flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <h4 className="font-headline font-bold text-[#0a0a0a] dark:text-white text-sm">Verify Comprehension</h4>
              <p className="text-xs text-[#737373] mt-0.5">
                Take the multiple-choice assessment to evaluate retention and record mastery metrics.
              </p>
            </div>
            <button
              onClick={() => setActiveTab('quiz')}
              className="px-6 py-2.5 rounded-lg bg-crimson hover:bg-crimson-hover text-white font-headline font-bold text-xs uppercase tracking-wider transition-colors shadow-xs flex items-center gap-2"
            >
              Start Practice Quiz
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* TAB 2: INTERACTIVE QUIZ PLAYER */}
      {activeTab === 'quiz' && (
        <div className="space-y-6">
          {!quizSubmitted ? (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base sm:text-lg font-headline font-bold text-[#0a0a0a] dark:text-white">Interactive Assessment</h3>
                  <p className="text-xs text-[#737373] mt-0.5">
                    Select the optimal option for each item. Scored deterministically.
                  </p>
                </div>
                <span className="text-[10px] font-headline font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-[#fef2f2] text-crimson border border-crimson/30">
                  {content.quizQuestions?.length || 0} Questions
                </span>
              </div>

              {(content.quizQuestions || []).map((q, qIdx) => (
                <div key={q.id || qIdx} className="p-5 sm:p-6 rounded-lg bg-white dark:bg-[#171717] border border-[#e5e5e5] dark:border-[#262626] space-y-3.5">
                  <div className="flex items-start gap-2.5">
                    <span className="w-6 h-6 rounded bg-[#f4f4f4] dark:bg-neutral-800 text-[#0a0a0a] dark:text-white border border-[#e5e5e5] dark:border-neutral-700 font-headline font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                      Q{qIdx + 1}
                    </span>
                    <p className="font-headline font-bold text-[#0a0a0a] dark:text-white text-sm leading-snug">{q.question}</p>
                  </div>

                  <div className="grid grid-cols-1 gap-2 pl-8">
                    {(q.options || []).map((opt, optIdx) => {
                      const isSelected = selectedAnswers[q.id || q.question] === opt;
                      return (
                        <button
                          key={optIdx}
                          type="button"
                          onClick={() => setSelectedAnswers({ ...selectedAnswers, [q.id || q.question]: opt })}
                          className={`p-3 rounded-lg text-left text-xs sm:text-sm font-medium border transition-all ${
                            isSelected
                              ? 'bg-[#f4f4f4] dark:bg-[#1f1f1f] border-[#0a0a0a] dark:border-white text-[#0a0a0a] dark:text-white font-bold'
                              : 'bg-white dark:bg-[#121212] border-[#e5e5e5] dark:border-[#262626] text-[#1b1c1c] dark:text-neutral-300 hover:border-[#0a0a0a] dark:hover:border-white'
                          }`}
                        >
                          <span className="font-mono text-[#737373] mr-2">
                            {String.fromCharCode(65 + optIdx)}.
                          </span>
                          {opt}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}

              <div className="flex justify-end pt-2">
                <button
                  type="button"
                  onClick={handleSubmitQuiz}
                  disabled={isSubmittingQuiz || Object.keys(selectedAnswers).length === 0}
                  className="px-8 py-3 rounded-lg bg-crimson hover:bg-crimson-hover disabled:opacity-40 text-white font-headline font-bold text-xs uppercase tracking-wider transition-colors shadow-xs flex items-center gap-2"
                >
                  {isSubmittingQuiz ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      Evaluating...
                    </>
                  ) : (
                    <>
                      Submit Answers
                      <ChevronRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </div>
          ) : (
            /* Quiz Results View */
            <div className="space-y-6">
              <div className="p-8 sm:p-10 rounded-lg bg-white dark:bg-[#171717] border border-[#e5e5e5] dark:border-[#262626] text-center space-y-4">
                <div className={`w-12 h-12 rounded-lg flex items-center justify-center mx-auto ${
                  quizResult?.passed ? 'bg-[#f4f4f4] text-[#0a0a0a] dark:bg-neutral-800 dark:text-white border border-[#e5e5e5]' : 'bg-[#fef2f2] text-crimson border border-crimson/30'
                }`}>
                  <Award className="w-6 h-6" />
                </div>
                <h3 className="text-xl sm:text-2xl font-headline font-bold text-[#0a0a0a] dark:text-white">
                  {quizResult?.passed ? 'Mastery Verified' : 'Needs Revision'}
                </h3>
                <div className="text-4xl font-headline font-bold text-[#0a0a0a] dark:text-white tabular-nums tracking-tight">
                  {quizResult?.score} / {quizResult?.totalQuestions} ({quizResult?.percentage}%)
                </div>
                <p className="text-xs sm:text-sm text-[#737373] max-w-md mx-auto">
                  {quizResult?.passed
                    ? 'Congratulations. Strong conceptual understanding of this material verified.'
                    : 'Review deduction explanations below and consult the condensed revision notes.'}
                </p>
                <button
                  onClick={handleRetryQuiz}
                  className="inline-flex items-center gap-2 px-6 py-2.5 rounded-lg bg-white dark:bg-[#171717] hover:bg-[#f4f4f4] dark:hover:bg-[#262626] text-[#0a0a0a] dark:text-white border border-[#0a0a0a] dark:border-white text-xs font-headline font-bold uppercase tracking-wider transition-colors"
                >
                  <RotateCcw className="w-4 h-4" /> Retry Quiz
                </button>
              </div>

              {/* Explanations */}
              <div className="space-y-3">
                <h4 className="text-xs font-headline font-bold uppercase tracking-wider text-[#0a0a0a] dark:text-white">Detailed Explanations</h4>
                {(quizResult?.evaluation || []).map((ev, idx) => (
                  <div
                    key={idx}
                    className={`p-5 rounded-lg border ${
                      ev.isCorrect
                        ? 'bg-white dark:bg-[#171717] border-[#e5e5e5] dark:border-[#262626]'
                        : 'bg-[#fef2f2]/40 dark:bg-crimson/10 border-crimson/30'
                    } space-y-2.5`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-headline font-bold uppercase tracking-wider text-[#737373]">
                        Question {idx + 1}
                      </span>
                      <span className={`text-[10px] font-headline font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                        ev.isCorrect ? 'bg-[#f4f4f4] text-[#171717] dark:bg-neutral-800 dark:text-neutral-200 border border-[#e5e5e5]' : 'bg-[#fef2f2] text-crimson border border-crimson/30'
                      }`}>
                        {ev.isCorrect ? 'Correct' : 'Incorrect'}
                      </span>
                    </div>
                    <p className="font-headline font-bold text-[#0a0a0a] dark:text-white text-sm">{ev.question}</p>
                    <div className="text-xs space-y-0.5">
                      <p className="text-[#737373]">
                        Your answer: <span className={ev.isCorrect ? 'text-[#0a0a0a] dark:text-white font-semibold' : 'text-crimson font-bold'}>{ev.studentAnswer || '(No answer)'}</span>
                      </p>
                      {!ev.isCorrect && (
                        <p className="text-[#737373]">
                          Correct answer: <span className="text-[#0a0a0a] dark:text-white font-bold">{ev.correctAnswer}</span>
                        </p>
                      )}
                    </div>
                    {ev.explanation && (
                      <p className="text-xs text-[#444748] dark:text-neutral-300 bg-[#fafafa] dark:bg-[#121212] p-3 rounded border border-[#e5e5e5] dark:border-[#262626] leading-relaxed">
                        <span className="font-bold text-[#0a0a0a] dark:text-white font-headline">Explanation:</span> {ev.explanation}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 3: VERIFIED YOUTUBE VIDEO LECTURES */}
      {activeTab === 'videos' && (
        <div className="space-y-6">
          <div>
            <h3 className="text-xs font-headline font-bold text-[#0a0a0a] dark:text-white uppercase tracking-wider">Curriculum Video Recommendations</h3>
            <p className="text-xs text-[#737373] mt-0.5">
              Verified educational lectures retrieved from YouTube Data API v3.
            </p>
          </div>

          {videosLoading ? (
            <div className="py-12 text-center text-[#737373]">
              <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-crimson" />
              <p className="text-xs font-headline font-bold uppercase tracking-wider">Searching verified YouTube tutorials...</p>
            </div>
          ) : videos.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {videos.map((vid, idx) => (
                <div key={idx} className="p-4 rounded-lg bg-white dark:bg-[#171717] border border-[#e5e5e5] dark:border-[#262626] flex flex-col justify-between space-y-3">
                  {vid.thumbnailUrl && (
                    <img
                      src={vid.thumbnailUrl}
                      alt={vid.title}
                      className="w-full h-40 object-cover rounded-md"
                    />
                  )}
                  <div className="space-y-1">
                    <h4 className="font-headline font-bold text-[#0a0a0a] dark:text-white text-sm line-clamp-2 leading-snug">{vid.title}</h4>
                    <p className="text-xs text-crimson font-medium">{vid.channelTitle}</p>
                    <p className="text-xs text-[#737373] line-clamp-2">{vid.relevanceExplanation}</p>
                  </div>
                  <a
                    href={vid.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-[#0a0a0a] text-white hover:bg-[#171717] dark:bg-white dark:text-[#0a0a0a] text-xs font-headline font-bold uppercase tracking-wider transition-colors"
                  >
                    Watch on YouTube
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 rounded-lg bg-white dark:bg-[#171717] border border-[#e5e5e5] dark:border-[#262626] text-center space-y-2">
              <Video className="w-6 h-6 text-[#737373] mx-auto" />
              <p className="text-xs font-headline font-bold text-[#0a0a0a] dark:text-white uppercase tracking-wider">No external videos discovered</p>
              <p className="text-xs text-[#737373] max-w-md mx-auto">
                {videoNotice || 'Set YOUTUBE_API_KEY in your Supabase Edge Function secrets to enable video search.'}
              </p>
            </div>
          )}
        </div>
      )}

      {/* TAB 4: AI DOUBT SOLVER */}
      {activeTab === 'doubts' && (
        <div className="space-y-6">
          <div>
            <h3 className="text-xs font-headline font-bold text-[#0a0a0a] dark:text-white uppercase tracking-wider">AI Research Doubt Solver</h3>
            <p className="text-xs text-[#737373] mt-0.5">
              Ask follow-up questions grounded directly in this lesson and your uploaded study material.
            </p>
          </div>

          {/* Doubt Conversation Feed */}
          <div className="space-y-4">
            {doubts.map((d) => (
              <div key={d.id} className="space-y-2">
                {/* Student Question */}
                <div className="flex justify-end">
                  <div className="max-w-xl p-3.5 rounded-lg bg-[#0a0a0a] text-white text-xs sm:text-sm">
                    {d.question}
                  </div>
                </div>

                {/* AI Answer */}
                <div className="flex justify-start">
                  <div className="max-w-xl p-4 rounded-lg bg-white dark:bg-[#171717] border border-[#e5e5e5] dark:border-[#262626] text-xs sm:text-sm text-[#1b1c1c] dark:text-neutral-200 space-y-2">
                    {d.loading ? (
                      <div className="flex items-center gap-2 text-crimson text-xs py-1 font-headline font-bold">
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        Analyzing lesson and source context...
                      </div>
                    ) : (
                      <>
                        <p className="leading-relaxed whitespace-pre-wrap">{d.answer}</p>
                        {d.suggestedFollowUps && d.suggestedFollowUps.length > 0 && (
                          <div className="pt-2 border-t border-[#f4f4f4] dark:border-neutral-800 space-y-1">
                            <span className="text-[10px] uppercase font-headline font-bold text-[#737373]">Related Inquiries:</span>
                            <div className="flex flex-wrap gap-1.5">
                              {d.suggestedFollowUps.map((q, qi) => (
                                <button
                                  key={qi}
                                  type="button"
                                  onClick={() => setDoubtInput(q)}
                                  className="text-[11px] text-crimson bg-[#fef2f2] dark:bg-crimson/20 border border-crimson/30 px-2 py-0.5 rounded hover:bg-crimson hover:text-white transition-colors"
                                >
                                  {q}
                                </button>
                              ))}
                            </div>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Input Box */}
          <form onSubmit={handleAskDoubt} className="flex gap-2 pt-2">
            <input
              type="text"
              value={doubtInput}
              onChange={(e) => setDoubtInput(e.target.value)}
              placeholder="Ask a question about this topic, an equation, or an example..."
              className="flex-1 px-4 py-2.5 rounded-lg bg-white dark:bg-[#121212] border border-[#e5e5e5] dark:border-[#262626] text-[#0a0a0a] dark:text-white placeholder-[#737373] text-xs sm:text-sm focus:outline-none focus:border-[#0a0a0a] dark:focus:border-white transition-colors"
              disabled={isAnsweringDoubt}
            />
            <button
              type="submit"
              disabled={!doubtInput.trim() || isAnsweringDoubt}
              className="px-5 py-2.5 rounded-lg bg-crimson hover:bg-crimson-hover disabled:opacity-40 text-white font-headline font-bold text-xs uppercase tracking-wider transition-colors flex items-center gap-1.5 shadow-xs"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Ask</span>
            </button>
          </form>
        </div>
      )}

      {/* TAB 5: REVISION NOTES */}
      {activeTab === 'revision' && (
        <div className="p-6 sm:p-8 rounded-lg bg-white dark:bg-[#171717] border border-[#e5e5e5] dark:border-[#262626] space-y-6">
          <div className="border-b border-[#e5e5e5] dark:border-[#262626] pb-4">
            <h3 className="text-base font-headline font-bold text-[#0a0a0a] dark:text-white uppercase tracking-wider flex items-center gap-2">
              <FileText className="w-4 h-4 text-crimson" />
              High-Density Revision Notes
            </h3>
            <p className="text-xs text-[#737373] mt-1">
              Condensed exam summary for fast revision before tests or evaluations.
            </p>
          </div>

          <div className="prose prose-invert max-w-none text-[#444748] dark:text-neutral-300 text-xs sm:text-sm leading-relaxed whitespace-pre-wrap font-sans">
            {content.revisionNotes}
          </div>

          {content.nextTopics && content.nextTopics.length > 0 && (
            <div className="pt-6 border-t border-[#f4f4f4] dark:border-neutral-800">
              <h4 className="text-[10px] font-headline font-bold uppercase tracking-wider text-[#737373] mb-3">
                Recommended Next Curriculum Nodes
              </h4>
              <div className="flex flex-wrap gap-2">
                {content.nextTopics.map((nt, idx) => (
                  <span
                    key={idx}
                    className="px-3 py-1 rounded bg-[#f4f4f4] dark:bg-neutral-800 border border-[#e5e5e5] dark:border-neutral-700 text-xs font-headline font-semibold text-[#171717] dark:text-neutral-200"
                  >
                    {nt}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
