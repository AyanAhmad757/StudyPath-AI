import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { learningProgressService } from '../services/api/learningProgressService';
import { courseService } from '../services/api/courseService';
import {
  TrendingUp,
  Award,
  BookOpen,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
} from 'lucide-react';

export default function ProgressPage() {
  const { user } = useAuth();

  const [courses, setCourses] = useState([]);
  const [progressData, setProgressData] = useState({ topicProgress: [], quizAttempts: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const [cList, pData] = await Promise.all([
          courseService.getCourses(user?.id),
          learningProgressService.getUserProgress(user?.id),
        ]);
        setCourses(cList || []);
        setProgressData(pData || { topicProgress: [], quizAttempts: [] });
      } catch (err) {
        console.error('Error loading progress:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [user?.id]);

  const topicProgress = progressData.topicProgress || [];
  const quizAttempts = progressData.quizAttempts || [];

  const completedTopics = topicProgress.filter((p) => p.status === 'completed');
  const needsRevisionTopics = topicProgress.filter((p) => p.needs_revision);

  const averageScore = quizAttempts.length > 0
    ? Math.round(
        quizAttempts.reduce((acc, a) => acc + (a.score / (a.total_questions || 1)) * 100, 0) /
          quizAttempts.length
      )
    : 0;

  return (
    <div className="max-w-6xl mx-auto py-4 sm:py-8 space-y-8 animate-fade-in">
      {/* Page Header */}
      <div className="border-b border-[#e5e5e5] dark:border-[#262626] pb-6">
        <span className="text-[10px] uppercase font-headline font-bold tracking-wider text-crimson">
          Analytics & Mastery Telemetry
        </span>
        <h1 className="text-2xl sm:text-3xl font-headline font-bold text-[#0a0a0a] dark:text-white tracking-tight mt-1">
          Curriculum Progress & Revision
        </h1>
        <p className="text-xs sm:text-sm text-[#737373] mt-1">
          Detailed telemetry across syllabus completion, evaluations, and topics requiring revision.
        </p>
      </div>

      {/* Analytical Metric Tiles */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-lg bg-white dark:bg-[#171717] border border-[#e5e5e5] dark:border-[#262626] space-y-1">
          <div className="flex items-center justify-between text-[#737373] text-[10px] font-headline uppercase tracking-wider font-bold">
            <span>Completed Topics</span>
            <CheckCircle2 className="w-4 h-4 text-crimson" />
          </div>
          <div className="text-2xl sm:text-3xl font-headline font-bold text-[#0a0a0a] dark:text-white tabular-nums tracking-tight">
            {completedTopics.length}
          </div>
          <p className="text-[11px] text-[#737373]">Verified through mastery</p>
        </div>

        <div className="p-5 rounded-lg bg-white dark:bg-[#171717] border border-[#e5e5e5] dark:border-[#262626] space-y-1">
          <div className="flex items-center justify-between text-[#737373] text-[10px] font-headline uppercase tracking-wider font-bold">
            <span>Needs Revision</span>
            <AlertTriangle className="w-4 h-4 text-crimson" />
          </div>
          <div className="text-2xl sm:text-3xl font-headline font-bold text-crimson tabular-nums tracking-tight">
            {needsRevisionTopics.length}
          </div>
          <p className="text-[11px] text-[#737373]">Flagged by evaluations</p>
        </div>

        <div className="p-5 rounded-lg bg-white dark:bg-[#171717] border border-[#e5e5e5] dark:border-[#262626] space-y-1">
          <div className="flex items-center justify-between text-[#737373] text-[10px] font-headline uppercase tracking-wider font-bold">
            <span>Quiz Attempts</span>
            <Award className="w-4 h-4 text-[#737373]" />
          </div>
          <div className="text-2xl sm:text-3xl font-headline font-bold text-[#0a0a0a] dark:text-white tabular-nums tracking-tight">
            {quizAttempts.length}
          </div>
          <p className="text-[11px] text-[#737373]">Total assessments taken</p>
        </div>

        <div className="p-5 rounded-lg bg-white dark:bg-[#171717] border border-[#e5e5e5] dark:border-[#262626] space-y-1">
          <div className="flex items-center justify-between text-[#737373] text-[10px] font-headline uppercase tracking-wider font-bold">
            <span>Average Score</span>
            <TrendingUp className="w-4 h-4 text-crimson" />
          </div>
          <div className="text-2xl sm:text-3xl font-headline font-bold text-[#0a0a0a] dark:text-white tabular-nums tracking-tight">
            {quizAttempts.length > 0 ? `${averageScore}%` : 'N/A'}
          </div>
          <p className="text-[11px] text-[#737373]">Overall retention rate</p>
        </div>
      </div>

      {/* Two Column Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column: Course Completion Rates */}
        <div className="p-5 sm:p-6 rounded-lg bg-white dark:bg-[#171717] border border-[#e5e5e5] dark:border-[#262626] space-y-5">
          <h2 className="text-xs font-headline font-bold text-[#0a0a0a] dark:text-white uppercase tracking-wider flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-crimson" />
            Curriculum Completion by Course
          </h2>

          {courses.length > 0 ? (
            <div className="space-y-3">
              {courses.map((course) => (
                <div key={course.id} className="p-4 rounded-lg bg-[#fafafa] dark:bg-[#121212] border border-[#e5e5e5] dark:border-[#262626] space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-mono font-bold text-crimson uppercase">
                        {course.code || 'CS'}
                      </span>
                      <h4 className="font-headline font-bold text-[#0a0a0a] dark:text-white text-sm line-clamp-1">{course.title}</h4>
                    </div>
                    <span className="text-sm font-headline font-bold text-[#0a0a0a] dark:text-white tabular-nums">{course.progressPercent || 0}%</span>
                  </div>
                  <div className="h-1.5 w-full bg-[#f4f4f4] dark:bg-neutral-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-crimson rounded-full transition-all duration-300"
                      style={{ width: `${course.progressPercent || 0}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-[11px] text-[#737373]">
                    <span className="tabular-nums">{course.completedTopics || 0} of {course.totalTopics || 0} topics completed</span>
                    <Link to={`/study/${course.id}`} className="text-[#0a0a0a] dark:text-white font-semibold hover:text-crimson">
                      View syllabus
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-8 text-center text-xs text-[#737373]">
              No courses tracked yet. Upload a syllabus to track progress.
            </div>
          )}
        </div>

        {/* Right Column: Topics Flagged for Revision */}
        <div className="p-5 sm:p-6 rounded-lg bg-white dark:bg-[#171717] border border-[#e5e5e5] dark:border-[#262626] space-y-5">
          <h2 className="text-xs font-headline font-bold text-[#0a0a0a] dark:text-white uppercase tracking-wider flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-crimson" />
            Topics Requiring Revision ({needsRevisionTopics.length})
          </h2>

          {needsRevisionTopics.length > 0 ? (
            <div className="space-y-2.5">
              {needsRevisionTopics.map((item, idx) => (
                <div
                  key={idx}
                  className="p-3.5 rounded-lg bg-[#fafafa] dark:bg-[#121212] border border-crimson/30 flex items-center justify-between"
                >
                  <div className="space-y-0.5">
                    <span className="text-[10px] font-headline font-bold text-crimson uppercase tracking-wider">
                      Needs Review
                    </span>
                    <p className="font-headline font-bold text-[#0a0a0a] dark:text-white text-xs">Topic #{item.topic_id?.slice(0, 8)}</p>
                    <p className="text-[11px] text-[#737373] tabular-nums">
                      Last studied: {new Date(item.last_studied_at).toLocaleDateString()}
                    </p>
                  </div>
                  <Link
                    to={`/study`}
                    className="px-3 py-1.5 rounded bg-crimson hover:bg-crimson-hover text-white text-[10px] font-headline font-bold uppercase tracking-wider transition-colors"
                  >
                    Revise
                  </Link>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 rounded-lg bg-[#fafafa] dark:bg-[#121212] border border-[#e5e5e5] dark:border-[#262626] text-center space-y-2">
              <CheckCircle2 className="w-6 h-6 text-crimson mx-auto" />
              <p className="text-xs font-headline font-bold text-[#0a0a0a] dark:text-white uppercase tracking-wider">All Topics in Good Standing</p>
              <p className="text-xs text-[#737373]">
                Zero topics flagged for revision. Keep up the high retention rate!
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Quiz Attempt History Table: strict 1px rules, uppercase label-sm header, right-aligned tabular nums */}
      <div className="p-5 sm:p-6 rounded-lg bg-white dark:bg-[#171717] border border-[#e5e5e5] dark:border-[#262626] space-y-4">
        <h2 className="text-xs font-headline font-bold text-[#0a0a0a] dark:text-white uppercase tracking-wider flex items-center gap-2">
          <Award className="w-4 h-4 text-crimson" />
          Recent Evaluation Telemetry
        </h2>

        {quizAttempts.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs tabular-nums border-collapse">
              <thead>
                <tr className="border-b border-[#e5e5e5] dark:border-[#262626] text-[#737373] uppercase text-[10px] font-headline font-bold tracking-wider">
                  <th className="py-3 px-4">Evaluation Date</th>
                  <th className="py-3 px-4 text-right">Score</th>
                  <th className="py-3 px-4 text-right">Accuracy</th>
                  <th className="py-3 px-4 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#f4f4f4] dark:divide-neutral-800 text-[#171717] dark:text-neutral-300">
                {quizAttempts.map((att, idx) => {
                  const pct = Math.round((att.score / (att.total_questions || 1)) * 100);
                  const isPass = pct >= 60;
                  return (
                    <tr key={att.id || idx} className="hover:bg-[#fafafa] dark:hover:bg-[#1f1f1f] transition-colors">
                      <td className="py-3.5 px-4 font-mono text-[#737373]">
                        {new Date(att.created_at || Date.now()).toLocaleDateString()}
                      </td>
                      <td className="py-3.5 px-4 font-semibold text-[#0a0a0a] dark:text-white text-right tabular-nums">
                        {att.score} / {att.total_questions}
                      </td>
                      <td className="py-3.5 px-4 font-headline font-bold text-[#0a0a0a] dark:text-white text-right tabular-nums">{pct}%</td>
                      <td className="py-3.5 px-4 text-right">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-headline font-bold uppercase tracking-wider ${
                            isPass
                              ? 'bg-[#f4f4f4] text-[#171717] dark:bg-neutral-800 dark:text-neutral-200 border border-[#e5e5e5] dark:border-neutral-700'
                              : 'bg-[#fef2f2] text-crimson border border-crimson/30'
                          }`}
                        >
                          {isPass ? 'Passed' : 'Needs Revision'}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-6 text-center text-xs text-[#737373]">
            No quiz attempts recorded yet. Take an interactive quiz inside any lesson.
          </div>
        )}
      </div>
    </div>
  );
}
