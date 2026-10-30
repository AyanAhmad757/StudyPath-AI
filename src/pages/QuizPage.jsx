import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { lessonService } from '../services/api/lessonService';
import { quizEngineService } from '../services/api/quizEngineService';
import { aiTeachingEngine } from '../services/api/aiTeachingEngine';
import confetti from 'canvas-confetti';
import {
  Award,
  CheckCircle2,
  XCircle,
  RotateCcw,
  ArrowRight,
  ArrowLeft,
  RefreshCw,
  HelpCircle,
  Sparkles,
} from 'lucide-react';

export default function QuizPage() {
  const { lessonId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [lesson, setLesson] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    async function loadQuiz() {
      setLoading(true);
      try {
        if (lessonId) {
          const loadedLesson = await lessonService.getLessonById(lessonId, user?.id);
          if (loadedLesson) {
            setLesson(loadedLesson);
            const content = typeof loadedLesson.content_json === 'string'
              ? JSON.parse(loadedLesson.content_json)
              : loadedLesson.content_json;

            if (content?.quizQuestions && content.quizQuestions.length > 0) {
              setQuestions(content.quizQuestions);
            } else {
              // Generate fresh quiz questions
              const generated = await aiTeachingEngine.generateQuiz({
                topicTitle: loadedLesson.title,
                difficulty: loadedLesson.learning_level || 'intermediate',
              });
              setQuestions(generated);
            }
          }
        }
      } catch (err) {
        console.error('Failed to load quiz:', err);
      } finally {
        setLoading(false);
      }
    }

    loadQuiz();
  }, [lessonId, user?.id]);

  const handleSelectOption = (qKey, option) => {
    if (result) return;
    setSelectedAnswers((prev) => ({
      ...prev,
      [qKey]: option,
    }));
  };

  const handleSubmit = async () => {
    if (submitting || questions.length === 0) return;
    setSubmitting(true);
    try {
      const evaluation = await quizEngineService.submitQuizAttempt({
        lessonId: lessonId || 'temp',
        topicId: lesson?.topic_id || null,
        answers: selectedAnswers,
        quizQuestions: questions,
        userId: user?.id || null,
      });

      setResult(evaluation);
      if (evaluation.percentage >= 80) {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
        });
      }
    } catch (err) {
      console.error('Failed to submit quiz:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleRetry = () => {
    setSelectedAnswers({});
    setResult(null);
    setCurrentIndex(0);
  };

  if (loading) {
    return (
      <div className="max-w-xl mx-auto py-20 text-center space-y-4">
        <RefreshCw className="w-8 h-8 text-crimson animate-spin mx-auto" />
        <h2 className="text-xl font-headline font-bold text-[#0a0a0a] dark:text-white">Loading Quiz Questions...</h2>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="max-w-lg mx-auto py-20 text-center space-y-4">
        <HelpCircle className="w-10 h-10 text-[#737373] mx-auto" />
        <h2 className="text-xl font-headline font-bold text-[#0a0a0a] dark:text-white">No Questions Available</h2>
        <p className="text-sm text-[#737373]">
          This lesson does not currently have quiz questions.
        </p>
        <button
          onClick={() => navigate(-1)}
          className="px-4 py-2 rounded-lg bg-[#0a0a0a] text-white hover:bg-[#171717] dark:bg-white dark:text-[#0a0a0a] text-xs font-headline font-bold uppercase tracking-wider"
        >
          Go Back
        </button>
      </div>
    );
  }

  const currentQ = questions[currentIndex];
  const qKey = currentQ?.id || currentQ?.question;
  const isLastQuestion = currentIndex === questions.length - 1;

  return (
    <div className="max-w-3xl mx-auto py-6 sm:py-10 space-y-8 animate-fade-in">
      {/* Quiz Header */}
      <div className="flex items-center justify-between border-b border-[#e5e5e5] dark:border-[#262626] pb-4">
        <div>
          <span className="text-[10px] font-headline font-bold text-crimson uppercase tracking-wider">
            Practice Assessment
          </span>
          <h1 className="text-xl sm:text-2xl font-headline font-bold text-[#0a0a0a] dark:text-white tracking-tight mt-0.5">
            {lesson?.title || 'Mastery Evaluation'}
          </h1>
        </div>
        <button
          onClick={() => navigate(-1)}
          className="text-xs font-headline font-semibold text-[#737373] hover:text-[#0a0a0a] dark:hover:text-white px-3 py-1.5 rounded-lg bg-white dark:bg-[#171717] border border-[#e5e5e5] dark:border-[#262626] transition-colors"
        >
          Exit Quiz
        </button>
      </div>

      {!result ? (
        <div className="space-y-6">
          {/* Progress Tracker */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs text-[#737373] font-headline font-semibold">
              <span>Question {currentIndex + 1} of {questions.length}</span>
              <span className="tabular-nums font-bold text-[#0a0a0a] dark:text-white">{Math.round(((currentIndex + 1) / questions.length) * 100)}%</span>
            </div>
            <div className="h-1.5 w-full bg-[#f4f4f4] dark:bg-neutral-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-crimson transition-all duration-300 rounded-full"
                style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
              />
            </div>
          </div>

          {/* Current Question Card */}
          <div className="p-6 sm:p-8 rounded-lg bg-white dark:bg-[#171717] border border-[#e5e5e5] dark:border-[#262626] space-y-6">
            <div className="flex items-start gap-3">
              <span className="w-7 h-7 rounded-md bg-[#f4f4f4] dark:bg-neutral-800 text-[#0a0a0a] dark:text-white font-headline font-bold text-xs flex items-center justify-center shrink-0 border border-[#e5e5e5] dark:border-neutral-700">
                {currentIndex + 1}
              </span>
              <h2 className="text-base sm:text-lg font-headline font-bold text-[#0a0a0a] dark:text-white leading-relaxed">
                {currentQ.question}
              </h2>
            </div>

            {/* Answer Options */}
            <div className="grid grid-cols-1 gap-2.5 pt-2">
              {(currentQ.options || []).map((opt, optIdx) => {
                const isSelected = selectedAnswers[qKey] === opt;
                return (
                  <button
                    key={optIdx}
                    type="button"
                    onClick={() => handleSelectOption(qKey, opt)}
                    className={`p-3.5 sm:p-4 rounded-lg text-left text-xs sm:text-sm font-medium border transition-all flex items-center gap-3 ${
                      isSelected
                        ? 'bg-[#f4f4f4] dark:bg-[#1f1f1f] border-[#0a0a0a] dark:border-white text-[#0a0a0a] dark:text-white font-bold'
                        : 'bg-white dark:bg-[#121212] border-[#e5e5e5] dark:border-[#262626] text-[#1b1c1c] dark:text-neutral-300 hover:border-[#0a0a0a] dark:hover:border-white'
                    }`}
                  >
                    <span className="w-6 h-6 rounded bg-[#f4f4f4] dark:bg-neutral-800 font-mono text-[11px] font-bold flex items-center justify-center text-[#737373] shrink-0 border border-[#e5e5e5] dark:border-neutral-700">
                      {String.fromCharCode(65 + optIdx)}
                    </span>
                    <span>{opt}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Navigation Controls */}
          <div className="flex items-center justify-between pt-2">
            <button
              type="button"
              onClick={() => setCurrentIndex((prev) => Math.max(0, prev - 1))}
              disabled={currentIndex === 0}
              className="px-5 py-2.5 rounded-lg bg-white dark:bg-[#171717] hover:bg-[#f4f4f4] dark:hover:bg-[#262626] disabled:opacity-30 text-[#0a0a0a] dark:text-white text-xs font-headline font-semibold border border-[#0a0a0a] dark:border-white/80 flex items-center gap-1.5 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" /> Previous
            </button>

            {!isLastQuestion ? (
              <button
                type="button"
                onClick={() => setCurrentIndex((prev) => Math.min(questions.length - 1, prev + 1))}
                className="px-6 py-2.5 rounded-lg bg-crimson hover:bg-crimson-hover text-white text-xs font-headline font-bold uppercase tracking-wider flex items-center gap-1.5 transition-colors shadow-xs"
              >
                Next <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSubmit}
                disabled={submitting || Object.keys(selectedAnswers).length === 0}
                className="px-7 py-2.5 rounded-lg bg-crimson hover:bg-crimson-hover disabled:opacity-40 text-white text-xs font-headline font-bold uppercase tracking-wider flex items-center gap-1.5 transition-colors shadow-xs"
              >
                {submitting ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" /> Evaluating...
                  </>
                ) : (
                  <>
                    Submit Evaluation <CheckCircle2 className="w-4 h-4" />
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      ) : (
        /* Final Score & Evaluation View */
        <div className="space-y-8">
          <div className="p-8 sm:p-12 rounded-lg bg-white dark:bg-[#171717] border border-[#e5e5e5] dark:border-[#262626] text-center space-y-4">
            <div className={`w-14 h-14 rounded-lg flex items-center justify-center mx-auto ${
              result.passed ? 'bg-[#f4f4f4] dark:bg-neutral-800 text-[#0a0a0a] dark:text-white border border-[#e5e5e5]' : 'bg-[#fef2f2] dark:bg-crimson/20 text-crimson border border-crimson/30'
            }`}>
              <Award className="w-7 h-7" />
            </div>
            <h2 className="text-xl sm:text-2xl font-headline font-bold text-[#0a0a0a] dark:text-white">
              {result.passed ? 'Mastery Verified' : 'Revision Recommended'}
            </h2>
            <div className="text-5xl font-headline font-bold text-[#0a0a0a] dark:text-white tabular-nums tracking-tight">
              {result.score} / {result.totalQuestions}
            </div>
            <p className="text-xs sm:text-sm text-[#737373] max-w-md mx-auto">
              Score: <span className="font-bold text-[#0a0a0a] dark:text-white tabular-nums">{result.percentage}%</span> •{' '}
              {result.passed ? 'Solid conceptual comprehension demonstrated' : 'Review key deductions below'}
            </p>
            <div className="flex justify-center gap-3 pt-4">
              <button
                onClick={handleRetry}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-white dark:bg-[#171717] hover:bg-[#f4f4f4] dark:hover:bg-[#262626] text-[#0a0a0a] dark:text-white text-xs font-headline font-semibold border border-[#0a0a0a] dark:border-white/80 transition-colors"
              >
                <RotateCcw className="w-4 h-4" /> Retry Assessment
              </button>
              <button
                onClick={() => navigate(`/lessons/${lessonId}`)}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-crimson hover:bg-crimson-hover text-white text-xs font-headline font-bold uppercase tracking-wider transition-colors shadow-xs"
              >
                Review Lesson <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Explanation Feed */}
          <div className="space-y-3">
            <h3 className="text-xs uppercase font-headline font-bold tracking-wider text-[#0a0a0a] dark:text-white">Itemized Evaluation</h3>
            {(result.evaluation || []).map((ev, i) => (
              <div
                key={i}
                className={`p-5 rounded-lg border ${
                  ev.isCorrect ? 'bg-white dark:bg-[#171717] border-[#e5e5e5] dark:border-[#262626]' : 'bg-[#fef2f2]/40 dark:bg-crimson/10 border-crimson/30'
                } space-y-2.5`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-headline font-bold uppercase tracking-wider text-[#737373]">
                    Question {i + 1}
                  </span>
                  <span className={`text-[10px] font-headline font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                    ev.isCorrect ? 'bg-[#f4f4f4] text-[#171717] dark:bg-neutral-800 dark:text-neutral-200 border border-[#e5e5e5] dark:border-neutral-700' : 'bg-[#fef2f2] text-crimson border border-crimson/30'
                  }`}>
                    {ev.isCorrect ? 'Correct' : 'Incorrect'}
                  </span>
                </div>
                <p className="font-headline font-bold text-[#0a0a0a] dark:text-white text-sm">{ev.question}</p>
                <div className="text-xs space-y-0.5">
                  <p className="text-[#737373]">
                    Your answer: <span className={ev.isCorrect ? 'text-[#0a0a0a] dark:text-white font-semibold' : 'text-crimson font-bold'}>{ev.studentAnswer || '(None)'}</span>
                  </p>
                  {!ev.isCorrect && (
                    <p className="text-[#737373]">
                      Correct answer: <span className="text-[#0a0a0a] dark:text-white font-bold">{ev.correctAnswer}</span>
                    </p>
                  )}
                </div>
                {ev.explanation && (
                  <p className="text-xs text-[#444748] dark:text-neutral-300 bg-[#fafafa] dark:bg-[#121212] p-3 rounded border border-[#e5e5e5] dark:border-[#262626] leading-relaxed">
                    {ev.explanation}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
