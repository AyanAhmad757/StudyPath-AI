import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { courseService } from '../services/api/courseService';
import { lessonService } from '../services/api/lessonService';
import { learningProgressService } from '../services/api/learningProgressService';
import {
  Sparkles,
  BookOpen,
  FileText,
  CheckCircle2,
  Play,
  ArrowRight,
  Award,
  Upload,
  Search,
} from 'lucide-react';

export default function DashboardPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [courses, setCourses] = useState([]);
  const [lessons, setLessons] = useState([]);
  const [progressData, setProgressData] = useState({ topicProgress: [], quizAttempts: [] });
  const [loading, setLoading] = useState(true);
  const [quickTopic, setQuickTopic] = useState('');

  const displayName = user?.name ? user.name.split(' ')[0] : 'Student';

  useEffect(() => {
    async function loadDashboardData() {
      setLoading(true);
      try {
        const [cList, lList, pData] = await Promise.all([
          courseService.getCourses(user?.id),
          lessonService.getLessons(user?.id),
          learningProgressService.getUserProgress(user?.id),
        ]);
        setCourses(cList || []);
        setLessons(lList || []);
        setProgressData(pData || { topicProgress: [], quizAttempts: [] });
      } catch (err) {
        console.error('Error loading dashboard:', err);
      } finally {
        setLoading(false);
      }
    }

    loadDashboardData();
  }, [user?.id]);

  const handleQuickLearn = (e) => {
    e.preventDefault();
    if (!quickTopic.trim()) return;
    navigate(`/learn?topic=${encodeURIComponent(quickTopic.trim())}`);
  };

  const lastLesson = lessons[0] || null;

  // Compute metrics
  const totalCourses = courses.length;
  const totalLessons = lessons.length;
  const completedTopicsCount = (progressData.topicProgress || []).filter(
    (p) => p.status === 'completed'
  ).length;

  const quizAttempts = progressData.quizAttempts || [];
  const averageScore = quizAttempts.length > 0
    ? Math.round(
        quizAttempts.reduce((acc, a) => acc + (a.score / (a.total_questions || 1)) * 100, 0) /
          quizAttempts.length
      )
    : 0;

  return (
    <div className="max-w-6xl mx-auto py-4 sm:py-8 space-y-8 animate-fade-in">
      {/* Welcome Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#e5e5e5] dark:border-[#262626] pb-6">
        <div>
          <span className="text-[10px] uppercase font-headline font-bold tracking-wider text-crimson">
            Academic Research & Learning Dashboard
          </span>
          <h1 className="text-2xl sm:text-3xl font-headline font-bold text-[#0a0a0a] dark:text-white tracking-tight mt-1">
            Welcome, {displayName}
          </h1>
          <p className="text-xs sm:text-sm text-[#737373] mt-1">
            Track syllabus mastery, research syntheses, and continuous learning telemetry.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Link
            to="/study/upload"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-white dark:bg-[#171717] hover:bg-[#f4f4f4] dark:hover:bg-[#262626] text-[#0a0a0a] dark:text-white border border-[#0a0a0a] dark:border-white/80 font-headline font-semibold text-xs transition-colors"
          >
            <Upload className="w-3.5 h-3.5" />
            Upload Syllabus
          </Link>
          <Link
            to="/learn"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-crimson hover:bg-crimson-hover text-white font-headline font-bold text-xs uppercase tracking-wider transition-colors shadow-xs"
          >
            <Sparkles className="w-3.5 h-3.5" />
            Learn Anything
          </Link>
        </div>
      </div>

      {/* Prominent Instant Learning Entry Bar */}
      <div className="p-5 sm:p-6 rounded-lg bg-white dark:bg-[#171717] border border-[#e5e5e5] dark:border-[#262626] space-y-3">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded bg-[#fef2f2] dark:bg-crimson/20 text-crimson border border-crimson/30 flex items-center justify-center">
            <Sparkles className="w-3.5 h-3.5" />
          </div>
          <h3 className="font-headline font-bold text-[#0a0a0a] dark:text-white text-xs uppercase tracking-wider">
            Mode B • Instant Academic Learning
          </h3>
        </div>
        <form onSubmit={handleQuickLearn} className="flex flex-col sm:flex-row gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-[#737373] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={quickTopic}
              onChange={(e) => setQuickTopic(e.target.value)}
              placeholder="Enter any research concept or topic (e.g. Paxos Consensus, B-Trees, Backpropagation)..."
              className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-[#fafafa] dark:bg-[#121212] border border-[#e5e5e5] dark:border-[#262626] text-[#0a0a0a] dark:text-white placeholder-[#737373] text-sm focus:outline-none focus:border-[#0a0a0a] dark:focus:border-white transition-colors"
            />
          </div>
          <button
            type="submit"
            disabled={!quickTopic.trim()}
            className="px-5 py-2.5 rounded-lg bg-crimson hover:bg-crimson-hover disabled:opacity-40 text-white text-xs font-headline font-bold uppercase tracking-wider transition-colors shrink-0 flex items-center justify-center gap-2"
          >
            <span>Generate Lesson</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </form>
      </div>

      {/* Analytical Metric Tiles */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-lg bg-white dark:bg-[#171717] border border-[#e5e5e5] dark:border-[#262626] space-y-1">
          <div className="flex items-center justify-between text-[#737373] text-xs font-headline uppercase tracking-wider">
            <span>Enrolled Courses</span>
            <BookOpen className="w-4 h-4 text-[#737373]" />
          </div>
          <div className="text-2xl sm:text-3xl font-headline font-bold text-[#0a0a0a] dark:text-white tabular-nums tracking-tight">
            {totalCourses}
          </div>
          <p className="text-[11px] text-[#737373]">Syllabus curriculums</p>
        </div>

        <div className="p-5 rounded-lg bg-white dark:bg-[#171717] border border-[#e5e5e5] dark:border-[#262626] space-y-1">
          <div className="flex items-center justify-between text-[#737373] text-xs font-headline uppercase tracking-wider">
            <span>Saved Lessons</span>
            <FileText className="w-4 h-4 text-[#737373]" />
          </div>
          <div className="text-2xl sm:text-3xl font-headline font-bold text-[#0a0a0a] dark:text-white tabular-nums tracking-tight">
            {totalLessons}
          </div>
          <p className="text-[11px] text-[#737373]">Interactive syntheses</p>
        </div>

        <div className="p-5 rounded-lg bg-white dark:bg-[#171717] border border-[#e5e5e5] dark:border-[#262626] space-y-1">
          <div className="flex items-center justify-between text-[#737373] text-xs font-headline uppercase tracking-wider">
            <span>Topics Completed</span>
            <CheckCircle2 className="w-4 h-4 text-crimson" />
          </div>
          <div className="text-2xl sm:text-3xl font-headline font-bold text-[#0a0a0a] dark:text-white tabular-nums tracking-tight">
            {completedTopicsCount}
          </div>
          <p className="text-[11px] text-[#737373]">Curriculum goals mastered</p>
        </div>

        <div className="p-5 rounded-lg bg-white dark:bg-[#171717] border border-[#e5e5e5] dark:border-[#262626] space-y-1">
          <div className="flex items-center justify-between text-[#737373] text-xs font-headline uppercase tracking-wider">
            <span>Average Score</span>
            <Award className="w-4 h-4 text-crimson" />
          </div>
          <div className="text-2xl sm:text-3xl font-headline font-bold text-[#0a0a0a] dark:text-white tabular-nums tracking-tight">
            {quizAttempts.length > 0 ? `${averageScore}%` : 'N/A'}
          </div>
          <p className="text-[11px] text-[#737373]">{quizAttempts.length} evaluations recorded</p>
        </div>
      </div>

      {/* Continue Learning Priority Banner */}
      {lastLesson && (
        <div className="p-5 sm:p-6 rounded-lg bg-white dark:bg-[#171717] border border-[#e5e5e5] dark:border-[#262626] flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="space-y-1 text-center sm:text-left">
            <span className="text-[10px] uppercase font-headline font-bold tracking-wider text-crimson">
              Priority Resume
            </span>
            <h3 className="text-base sm:text-lg font-headline font-bold text-[#0a0a0a] dark:text-white">
              {lastLesson.title}
            </h3>
            <p className="text-xs text-[#737373]">
              {lastLesson.courses?.title
                ? `Course: ${lastLesson.courses.title}`
                : 'Standalone interactive lesson'}
            </p>
          </div>
          <Link
            to={`/lessons/${lastLesson.id}`}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-crimson hover:bg-crimson-hover text-white font-headline font-bold text-xs uppercase tracking-wider transition-colors shrink-0"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            Resume Study
          </Link>
        </div>
      )}

      {/* Two Column Section: Courses vs Lessons */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column: Courses */}
        <div className="space-y-3">
          <div className="flex items-center justify-between pb-1">
            <h2 className="text-sm font-headline font-bold text-[#0a0a0a] dark:text-white uppercase tracking-wider flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-crimson" />
              Syllabus Courses
            </h2>
            <Link to="/study" className="text-xs font-semibold text-[#737373] hover:text-[#0a0a0a] dark:hover:text-white">
              View All ({courses.length})
            </Link>
          </div>

          {courses.length > 0 ? (
            <div className="space-y-2.5">
              {courses.slice(0, 4).map((c) => (
                <Link
                  key={c.id}
                  to={`/study/${c.id}`}
                  className="p-4 rounded-lg bg-white dark:bg-[#171717] border border-[#e5e5e5] dark:border-[#262626] hover:border-[#0a0a0a] dark:hover:border-white transition-all flex items-center justify-between group"
                >
                  <div className="space-y-1 min-w-0 pr-3">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono font-bold px-1.5 py-0.2 rounded bg-[#f4f4f4] dark:bg-neutral-800 text-[#171717] dark:text-neutral-200">
                        {c.code || 'CS'}
                      </span>
                      <span className="text-[11px] text-[#737373]">
                        {c.totalUnits || 0} Units • {c.totalTopics || 0} Topics
                      </span>
                    </div>
                    <h4 className="font-headline font-bold text-[#0a0a0a] dark:text-white text-sm truncate group-hover:text-crimson transition-colors">
                      {c.title}
                    </h4>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="text-xs font-bold text-[#0a0a0a] dark:text-white tabular-nums">{c.progressPercent || 0}%</span>
                    <ArrowRight className="w-3.5 h-3.5 text-[#737373] group-hover:text-crimson group-hover:translate-x-0.5 transition-transform ml-auto mt-1" />
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="p-8 rounded-lg bg-white dark:bg-[#171717] border border-[#e5e5e5] dark:border-[#262626] text-center space-y-3">
              <p className="text-xs text-[#737373]">No courses uploaded yet.</p>
              <Link
                to="/study/upload"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#f4f4f4] hover:bg-[#e5e5e5] dark:bg-neutral-800 dark:hover:bg-neutral-700 text-[#0a0a0a] dark:text-white text-xs font-semibold"
              >
                <Upload className="w-3.5 h-3.5" /> Upload a Syllabus
              </Link>
            </div>
          )}
        </div>

        {/* Right Column: Recent Lessons */}
        <div className="space-y-3">
          <div className="flex items-center justify-between pb-1">
            <h2 className="text-sm font-headline font-bold text-[#0a0a0a] dark:text-white uppercase tracking-wider flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-crimson" />
              Recent Interactive Lessons
            </h2>
            <Link to="/library" className="text-xs font-semibold text-[#737373] hover:text-[#0a0a0a] dark:hover:text-white">
              View All ({lessons.length})
            </Link>
          </div>

          {lessons.length > 0 ? (
            <div className="space-y-2.5">
              {lessons.slice(0, 4).map((l) => (
                <Link
                  key={l.id}
                  to={`/lessons/${l.id}`}
                  className="p-4 rounded-lg bg-white dark:bg-[#171717] border border-[#e5e5e5] dark:border-[#262626] hover:border-[#0a0a0a] dark:hover:border-white transition-all flex items-center justify-between group"
                >
                  <div className="space-y-1 min-w-0 pr-3">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-[#fef2f2] text-crimson border border-crimson/30">
                        {l.learning_level || 'Intermediate'}
                      </span>
                      <span className="text-[11px] text-[#737373] tabular-nums">
                        {new Date(l.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    <h4 className="font-headline font-bold text-[#0a0a0a] dark:text-white text-sm truncate group-hover:text-crimson transition-colors">
                      {l.title}
                    </h4>
                  </div>
                  <ArrowRight className="w-3.5 h-3.5 text-[#737373] group-hover:text-crimson group-hover:translate-x-0.5 transition-transform shrink-0" />
                </Link>
              ))}
            </div>
          ) : (
            <div className="p-8 rounded-lg bg-white dark:bg-[#171717] border border-[#e5e5e5] dark:border-[#262626] text-center space-y-3">
              <p className="text-xs text-[#737373]">No standalone lessons generated yet.</p>
              <Link
                to="/learn"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#f4f4f4] hover:bg-[#e5e5e5] dark:bg-neutral-800 dark:hover:bg-neutral-700 text-[#0a0a0a] dark:text-white text-xs font-semibold"
              >
                <Sparkles className="w-3.5 h-3.5" /> Launch Learn Anything
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
