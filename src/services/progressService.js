import { weeklyActivityData, initialStats } from '../data/mockData';

const PROGRESS_STATS_KEY = 'friday_progress_stats';

export const progressService = {
  getStats() {
    const saved = localStorage.getItem(PROGRESS_STATS_KEY);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return initialStats;
      }
    }
    return initialStats;
  },

  saveStats(stats) {
    localStorage.setItem(PROGRESS_STATS_KEY, JSON.stringify(stats));
  },

  getWeeklyActivity() {
    return weeklyActivityData;
  },

  /**
   * Dynamically calculate real academic progress from syllabus/topic state
   */
  recalculateStatsFromSubjects(subjects = []) {
    let totalTopics = 0;
    let completedTopics = 0;

    subjects.forEach((s) => {
      (s.units || []).forEach((u) => {
        totalTopics += (u.topics || []).length;
        completedTopics += (u.topics || []).filter((t) => t.completed).length;
      });
    });

    const current = this.getStats();
    const updated = {
      ...current,
      totalSubjects: subjects.length,
      topicsCompleted: completedTopics,
      totalTopics: totalTopics,
      overallProgress: totalTopics > 0 ? Math.round((completedTopics / totalTopics) * 100) : 0,
      learningStreak: completedTopics > 0 ? Math.max(1, current.learningStreak || 1) : 0,
    };

    this.saveStats(updated);
    return updated;
  },

  getSubjectProgress(subject) {
    if (!subject || !subject.units) return 0;
    let total = 0;
    let comp = 0;
    subject.units.forEach((u) => {
      total += (u.topics || []).length;
      comp += (u.topics || []).filter((t) => t.completed).length;
    });
    return total > 0 ? Math.round((comp / total) * 100) : 0;
  },

  getOverallProgress(subjects = []) {
    let total = 0;
    let comp = 0;
    subjects.forEach((s) => {
      (s.units || []).forEach((u) => {
        total += (u.topics || []).length;
        comp += (u.topics || []).filter((t) => t.completed).length;
      });
    });
    return total > 0 ? Math.round((comp / total) * 100) : 0;
  },
};

export default progressService;
