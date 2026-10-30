import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { Search, X, BookOpen, Compass, ArrowRight, Sparkles } from 'lucide-react';

export default function SearchModal() {
  const { isSearchOpen, setIsSearchOpen, subjects, careerRoadmap } = useApp();
  const [query, setQuery] = useState('');
  const navigate = useNavigate();
  const inputRef = useRef(null);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsSearchOpen((prev) => !prev);
      }
      if (e.key === 'Escape' && isSearchOpen) {
        setIsSearchOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isSearchOpen, setIsSearchOpen]);

  useEffect(() => {
    if (isSearchOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery('');
    }
  }, [isSearchOpen]);

  if (!isSearchOpen) return null;

  // Search through subjects, topics, career roadmaps, and skills
  const results = [];
  const q = query.trim().toLowerCase();

  if (q.length > 0) {
    // 1. Search Subjects
    subjects.forEach((subj) => {
      if (subj.name.toLowerCase().includes(q) || subj.code.toLowerCase().includes(q)) {
        results.push({
          type: 'subject',
          title: subj.name,
          subtitle: `${subj.code} • ${subj.unitsCount} Units • ${subj.progress}% Completed`,
          link: `/study/${subj.id}`,
          icon: BookOpen,
          badge: 'Subject'
        });
      }

      // Search Topics
      subj.units.forEach((unit) => {
        unit.topics.forEach((topic) => {
          if (topic.name.toLowerCase().includes(q)) {
            results.push({
              type: 'topic',
              title: topic.name.replace(/^\d+\.\s*/, ''),
              subtitle: `${subj.name} • Unit ${unit.unitNumber} • ${topic.difficulty}`,
              link: `/study/${subj.id}/topic/${topic.id}`,
              icon: Sparkles,
              badge: topic.completed ? 'Completed Topic' : 'Topic'
            });
          }
        });
      });
    });

    // 2. Search Roadmap topics
    if (careerRoadmap?.phases) {
      careerRoadmap.phases.forEach((phase) => {
        phase.topics.forEach((t) => {
          if (t.name.toLowerCase().includes(q)) {
            results.push({
              type: 'roadmap',
              title: t.name,
              subtitle: `${careerRoadmap.careerName} • ${phase.title}`,
              link: '/career/roadmap',
              icon: Compass,
              badge: 'Career Roadmap'
            });
          }
        });
      });
    }

    // 3. Search Career paths
    if ('full stack developer'.includes(q) || 'react'.includes(q) || 'node'.includes(q) || 'frontend'.includes(q) || 'backend'.includes(q)) {
      results.push({
        type: 'career',
        title: 'Full Stack Developer Roadmap',
        subtitle: 'Personalized Career Guidance & Skill Gap Analysis',
        link: '/career/roadmap',
        icon: Compass,
        badge: 'Career Track'
      });
    }
  }

  const handleSelect = (link) => {
    setIsSearchOpen(false);
    navigate(link);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 sm:px-6">
      {/* Backdrop: rgba(10, 10, 10, 0.4) mask */}
      <div
        className="fixed inset-0 bg-[#0a0a0a]/40 backdrop-blur-xs transition-opacity"
        onClick={() => setIsSearchOpen(false)}
      />

      {/* Search Modal Box: 1px border (#0a0a0a), hard edge */}
      <div className="relative w-full max-w-2xl bg-white dark:bg-[#171717] rounded-lg shadow-[0_4px_0_rgba(0,0,0,0.08)] border border-[#0a0a0a] dark:border-neutral-700 overflow-hidden z-10 animate-slide-down">
        {/* Search Input Bar */}
        <div className="flex items-center px-5 py-4 border-b border-[#e5e5e5] dark:border-neutral-800">
          <Search className="w-4 h-4 text-[#737373] mr-3 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search subjects, topics (e.g., 'OSI Model', 'React'), career skills..."
            className="w-full bg-transparent text-[#0a0a0a] dark:text-white placeholder-[#737373] focus:outline-none text-sm font-medium"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="text-[#737373] hover:text-[#0a0a0a] dark:hover:text-white p-1 rounded"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <div className="hidden sm:flex items-center gap-1 pl-3 border-l border-[#e5e5e5] dark:border-neutral-800 ml-2">
            <kbd className="px-2 py-0.5 text-[10px] font-bold text-[#737373] bg-[#f4f4f4] dark:bg-neutral-800 rounded border border-[#e5e5e5] dark:border-neutral-700 font-mono">ESC</kbd>
          </div>
        </div>

        {/* Results List */}
        <div className="max-h-96 overflow-y-auto p-3">
          {query.trim().length === 0 ? (
            <div className="p-6 text-center">
              <p className="text-[11px] font-headline font-bold uppercase text-[#737373] tracking-wider mb-3">Popular Searches</p>
              <div className="flex flex-wrap justify-center gap-2">
                {['OSI Model', 'Computer Networks', 'React Hooks', 'Full Stack Developer', 'Compiler Design', 'Docker'].map((term) => (
                  <button
                    key={term}
                    onClick={() => setQuery(term)}
                    className="text-xs font-semibold px-3 py-1.5 rounded-md bg-[#f4f4f4] dark:bg-neutral-800 text-[#0a0a0a] dark:text-neutral-200 hover:bg-[#0a0a0a] hover:text-white dark:hover:bg-white dark:hover:text-[#0a0a0a] transition-colors border border-[#e5e5e5] dark:border-neutral-700"
                  >
                    {term}
                  </button>
                ))}
              </div>
            </div>
          ) : results.length > 0 ? (
            <div className="space-y-1">
              <p className="px-3 py-1.5 text-[10px] font-headline font-bold uppercase tracking-wider text-[#737373]">
                {results.length} result{results.length > 1 ? 's' : ''} found
              </p>
              {results.map((res, idx) => {
                const Icon = res.icon;
                return (
                  <div
                    key={idx}
                    onClick={() => handleSelect(res.link)}
                    className="flex items-center justify-between p-3 rounded-md hover:bg-[#f4f4f4] dark:hover:bg-neutral-800 cursor-pointer transition-colors group"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-8 h-8 rounded-md bg-[#f4f4f4] dark:bg-neutral-800 text-[#0a0a0a] dark:text-white flex items-center justify-center shrink-0 border border-[#e5e5e5] dark:border-neutral-700">
                        <Icon className="w-4 h-4 text-crimson" />
                      </div>
                      <div className="truncate">
                        <p className="text-xs sm:text-sm font-headline font-bold text-[#0a0a0a] dark:text-white group-hover:text-crimson transition-colors truncate">
                          {res.title}
                        </p>
                        <p className="text-xs text-[#737373] truncate">
                          {res.subtitle}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 pl-3 shrink-0">
                      <span className="text-[10px] px-2 py-0.5 font-bold uppercase tracking-wider rounded bg-[#f4f4f4] dark:bg-neutral-800 text-[#171717] dark:text-neutral-300 border border-[#e5e5e5] dark:border-neutral-700">
                        {res.badge}
                      </span>
                      <ArrowRight className="w-3.5 h-3.5 text-[#737373] group-hover:text-crimson group-hover:translate-x-0.5 transition-all" />
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="p-8 text-center">
              <p className="text-sm font-bold text-[#0a0a0a] dark:text-white font-headline">No results found for "{query}"</p>
              <p className="text-xs text-[#737373] mt-1">Try searching for "Computer Networks", "OSI Model", or "React"</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
