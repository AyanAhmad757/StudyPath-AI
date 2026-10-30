import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { courseService } from '../services/api/courseService';
import { lessonService } from '../services/api/lessonService';
import {
  BookOpen,
  FileText,
  Sparkles,
  PlusCircle,
  Search,
  Calendar,
  ChevronRight,
  Trash2,
} from 'lucide-react';

export default function LibraryPage() {
  const { user } = useAuth();
  const [courses, setCourses] = useState([]);
  const [lessons, setLessons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('all'); // all, courses, lessons

  useEffect(() => {
    async function loadLibrary() {
      setLoading(true);
      try {
        const [cList, lList] = await Promise.all([
          courseService.getCourses(user?.id),
          lessonService.getLessons(user?.id),
        ]);
        setCourses(cList || []);
        setLessons(lList || []);
      } catch (err) {
        console.error('Error loading library:', err);
      } finally {
        setLoading(false);
      }
    }

    loadLibrary();
  }, [user?.id]);

  const handleDeleteLesson = async (id, e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!window.confirm('Are you sure you want to delete this saved lesson?')) return;
    try {
      await lessonService.deleteLesson(id);
      setLessons((prev) => prev.filter((l) => l.id !== id));
    } catch (err) {
      console.error('Delete lesson error:', err);
    }
  };

  const filteredCourses = courses.filter((c) =>
    (c.title || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (c.code || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredLessons = lessons.filter((l) =>
    (l.title || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="max-w-6xl mx-auto py-4 sm:py-8 space-y-8 animate-fade-in">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#e5e5e5] dark:border-[#262626] pb-6">
        <div>
          <span className="text-[10px] font-headline font-bold text-crimson uppercase tracking-wider">
            Curriculum & Lesson Archive
          </span>
          <h1 className="text-2xl sm:text-3xl font-headline font-bold text-[#0a0a0a] dark:text-white tracking-tight mt-1">
            Learning Library
          </h1>
          <p className="mt-1 text-[#737373] text-xs sm:text-sm">
            Search and resume your uploaded curriculums, courses, and individual saved syntheses.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Link
            to="/learn"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-crimson hover:bg-crimson-hover text-white font-headline font-bold text-xs uppercase tracking-wider transition-colors shadow-xs"
          >
            <Sparkles className="w-3.5 h-3.5" />
            Learn Anything
          </Link>
          <Link
            to="/study/upload"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-white dark:bg-[#171717] hover:bg-[#f4f4f4] dark:hover:bg-[#262626] text-[#0a0a0a] dark:text-white border border-[#0a0a0a] dark:border-white/80 font-headline font-semibold text-xs transition-colors"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            Upload Syllabus
          </Link>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Search Input */}
        <div className="relative w-full sm:w-96">
          <Search className="w-4 h-4 text-[#737373] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search courses or lessons by title..."
            className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-white dark:bg-[#121212] border border-[#e5e5e5] dark:border-[#262626] text-[#0a0a0a] dark:text-white placeholder-[#737373] text-xs sm:text-sm focus:outline-none focus:border-[#0a0a0a] dark:focus:border-white transition-colors"
          />
        </div>

        {/* Tabs */}
        <div className="inline-flex p-1 rounded-lg bg-[#fafafa] dark:bg-[#1a1a1a] border border-[#e5e5e5] dark:border-[#262626] self-start sm:self-auto">
          {[
            { id: 'all', label: `All Items (${courses.length + lessons.length})` },
            { id: 'courses', label: `Courses (${courses.length})` },
            { id: 'lessons', label: `Lessons (${lessons.length})` },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-3 py-1.5 rounded-md text-xs font-headline font-bold uppercase tracking-wider transition-all ${
                activeTab === tab.id
                  ? 'bg-[#0a0a0a] text-white dark:bg-white dark:text-[#0a0a0a]'
                  : 'text-[#737373] hover:text-[#0a0a0a] dark:hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="py-16 text-center text-[#737373] text-xs font-headline font-bold uppercase tracking-wider">Loading archive...</div>
      ) : (
        <div className="space-y-10">
          {/* Courses Section */}
          {(activeTab === 'all' || activeTab === 'courses') && (
            <div className="space-y-4">
              <h2 className="text-xs font-headline font-bold text-[#0a0a0a] dark:text-white uppercase tracking-wider flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-crimson" />
                Syllabus Courses ({filteredCourses.length})
              </h2>

              {filteredCourses.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredCourses.map((c) => (
                    <Link
                      key={c.id}
                      to={`/study/${c.id}`}
                      className="p-5 rounded-lg bg-white dark:bg-[#171717] border border-[#e5e5e5] dark:border-[#262626] hover:border-[#0a0a0a] dark:hover:border-white transition-all flex flex-col justify-between space-y-4 group"
                    >
                      <div>
                        <div className="flex items-center justify-between text-xs text-[#737373] mb-2">
                          <span className="font-mono text-crimson font-bold text-[10px] px-1.5 py-0.2 rounded bg-[#fef2f2] dark:bg-crimson/20 border border-crimson/30 uppercase">{c.code || 'CS'}</span>
                          <span className="text-[11px] tabular-nums">{c.totalUnits || 0} Units • {c.totalTopics || 0} Topics</span>
                        </div>
                        <h3 className="font-headline font-bold text-[#0a0a0a] dark:text-white text-base group-hover:text-crimson transition-colors line-clamp-2">
                          {c.title}
                        </h3>
                      </div>

                      {/* Progress Bar */}
                      <div className="space-y-1.5 pt-3 border-t border-[#f4f4f4] dark:border-neutral-800">
                        <div className="flex justify-between text-xs text-[#737373] font-headline">
                          <span>Curriculum Progress</span>
                          <span className="font-bold text-[#0a0a0a] dark:text-white tabular-nums">{c.progressPercent || 0}%</span>
                        </div>
                        <div className="h-1.5 w-full bg-[#f4f4f4] dark:bg-neutral-800 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-crimson rounded-full transition-all duration-300"
                            style={{ width: `${c.progressPercent || 0}%` }}
                          />
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                activeTab === 'courses' && (
                  <div className="p-8 rounded-lg bg-white dark:bg-[#171717] border border-[#e5e5e5] dark:border-[#262626] text-center text-[#737373] text-xs">
                    No courses found. Upload a syllabus to generate a course.
                  </div>
                )
              )}
            </div>
          )}

          {/* Lessons Section */}
          {(activeTab === 'all' || activeTab === 'lessons') && (
            <div className="space-y-4">
              <h2 className="text-xs font-headline font-bold text-[#0a0a0a] dark:text-white uppercase tracking-wider flex items-center gap-2">
                <FileText className="w-4 h-4 text-crimson" />
                Saved Interactive Lessons ({filteredLessons.length})
              </h2>

              {filteredLessons.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredLessons.map((l) => (
                    <Link
                      key={l.id}
                      to={`/lessons/${l.id}`}
                      className="p-5 rounded-lg bg-white dark:bg-[#171717] border border-[#e5e5e5] dark:border-[#262626] hover:border-[#0a0a0a] dark:hover:border-white transition-all flex flex-col justify-between space-y-4 group"
                    >
                      <div>
                        <div className="flex items-center justify-between text-xs text-[#737373] mb-2">
                          <span className="px-2 py-0.5 rounded text-crimson text-[10px] font-headline font-bold uppercase tracking-wider bg-[#fef2f2] dark:bg-crimson/20 border border-crimson/30">
                            {l.learning_level || 'Intermediate'}
                          </span>
                          <button
                            type="button"
                            onClick={(e) => handleDeleteLesson(l.id, e)}
                            className="text-[#737373] hover:text-crimson transition-colors p-1"
                            title="Delete lesson"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        <h3 className="font-headline font-bold text-[#0a0a0a] dark:text-white text-base group-hover:text-crimson transition-colors line-clamp-2">
                          {l.title}
                        </h3>
                        {l.courses?.title && (
                          <p className="text-xs text-[#737373] mt-1 line-clamp-1">
                            Course: {l.courses.title}
                          </p>
                        )}
                      </div>

                      <div className="flex items-center justify-between text-xs text-[#737373] pt-3 border-t border-[#f4f4f4] dark:border-neutral-800">
                        <span className="flex items-center gap-1 tabular-nums text-[11px]">
                          <Calendar className="w-3 h-3" />
                          {new Date(l.created_at).toLocaleDateString()}
                        </span>
                        <span className="text-[#0a0a0a] dark:text-white font-headline font-semibold text-xs group-hover:text-crimson group-hover:translate-x-0.5 transition-all flex items-center gap-1">
                          Resume Study <ChevronRight className="w-3.5 h-3.5" />
                        </span>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                activeTab === 'lessons' && (
                  <div className="p-8 rounded-lg bg-white dark:bg-[#171717] border border-[#e5e5e5] dark:border-[#262626] text-center text-[#737373] text-xs">
                    No individual lessons saved. Use "Learn Anything" to create a lesson.
                  </div>
                )
              )}
            </div>
          )}

          {/* Zero Items Empty State */}
          {filteredCourses.length === 0 && filteredLessons.length === 0 && (
            <div className="p-12 rounded-lg bg-white dark:bg-[#171717] border border-[#e5e5e5] dark:border-[#262626] text-center space-y-4 max-w-md mx-auto">
              <div className="w-10 h-10 rounded-md bg-[#f4f4f4] dark:bg-neutral-800 text-[#0a0a0a] dark:text-white flex items-center justify-center mx-auto border border-[#e5e5e5] dark:border-neutral-700">
                <BookOpen className="w-5 h-5 text-crimson" />
              </div>
              <h3 className="font-headline font-bold text-[#0a0a0a] dark:text-white text-base">Your Library is Empty</h3>
              <p className="text-xs text-[#737373] leading-relaxed">
                Start by uploading a syllabus to create a course or type any topic into "Learn Anything".
              </p>
              <div className="flex justify-center gap-2.5 pt-2">
                <Link
                  to="/learn"
                  className="px-4 py-2 rounded-lg bg-crimson hover:bg-crimson-hover text-white font-headline font-bold text-xs uppercase tracking-wider transition-colors"
                >
                  Learn Anything
                </Link>
                <Link
                  to="/study/upload"
                  className="px-4 py-2 rounded-lg bg-white dark:bg-[#171717] hover:bg-[#f4f4f4] dark:hover:bg-[#262626] text-[#0a0a0a] dark:text-white border border-[#0a0a0a] dark:border-white/80 font-headline font-semibold text-xs transition-colors"
                >
                  Upload Syllabus
                </Link>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
