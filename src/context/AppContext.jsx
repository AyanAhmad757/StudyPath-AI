import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { syllabusService } from '../services/syllabusService';
import { careerService } from '../services/careerService';
import { skillService } from '../services/skillService';
import { roadmapService } from '../services/roadmapService';
import { progressService } from '../services/progressService';
import { notificationsList, todayGoalsList } from '../data/mockData';

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const { user } = useAuth();

  // Theme state
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem('friday_theme');
    if (saved) return saved === 'dark';
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  // Subjects & Syllabi state
  const [subjects, setSubjects] = useState(() => syllabusService.getSubjects());
  const [loadingSubjects, setLoadingSubjects] = useState(false);

  // Today's Goals state
  const [todayGoals, setTodayGoals] = useState(() => {
    const saved = localStorage.getItem('friday_today_goals');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { return todayGoalsList; }
    }
    return todayGoalsList;
  });

  // Career and Roadmap state
  const [careerRoadmap, setCareerRoadmap] = useState(() => careerService.getRoadmap());
  const [skillRatings, setSkillRatings] = useState(() => careerService.getSkillRatings());

  // Stats
  const [stats, setStats] = useState(() => progressService.getStats());

  // Notifications
  const [notifications, setNotifications] = useState(() => {
    const saved = localStorage.getItem('friday_notifications');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { return notificationsList; }
    }
    return notificationsList;
  });

  // Global Search Modal state
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  // Video Modal state (global video player modal)
  const [activeVideo, setActiveVideo] = useState(null);

  // Toasts
  const [toasts, setToasts] = useState([]);

  // Sync dark mode class with DOM
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('friday_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('friday_theme', 'light');
    }
  }, [isDarkMode]);

  // Load user-specific syllabi and skills when authenticated user changes
  const loadUserData = useCallback(async () => {
    if (!user?.id) return;
    setLoadingSubjects(true);
    try {
      const [userSyllabi, userSkills, userRoadmap] = await Promise.all([
        syllabusService.getUserSyllabi(user.id),
        skillService.getUserSkills(user.id),
        roadmapService.getUserRoadmap(user.id),
      ]);

      if (userSyllabi && userSyllabi.length > 0) {
        setSubjects(userSyllabi);
        const updatedStats = progressService.recalculateStatsFromSubjects(userSyllabi);
        setStats(updatedStats);
      }

      if (userSkills && Object.keys(userSkills).length > 0) {
        setSkillRatings(userSkills);
      }

      if (userRoadmap) {
        setCareerRoadmap(userRoadmap);
      }
    } catch (err) {
      console.error('Error loading user data:', err);
    } finally {
      setLoadingSubjects(false);
    }
  }, [user?.id]);

  useEffect(() => {
    loadUserData();
  }, [loadUserData]);

  // Toast dispatch helper
  const showToast = (message, type = 'success', duration = 3500) => {
    const id = `toast_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, duration);
  };

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Toggle dark mode
  const toggleDarkMode = () => {
    setIsDarkMode((prev) => !prev);
  };

  // Subject and Topic Actions
  const toggleTopicCompletion = async (subjectId, topicId) => {
    const res = await syllabusService.toggleTopicCompletion(subjectId, topicId, user?.id);
    if (res.success) {
      setSubjects(res.subjects);
      const updatedStats = progressService.recalculateStatsFromSubjects(res.subjects);
      setStats(updatedStats);
      showToast(
        res.completed ? '🎉 Topic marked as completed!' : 'Topic marked as in-progress',
        res.completed ? 'success' : 'info'
      );
    }
    return res;
  };

  const addNewSubject = async (newSubject) => {
    const savedSubject = await syllabusService.createSyllabus(newSubject, user?.id);
    const updated = [savedSubject, ...subjects.filter((s) => s.id !== savedSubject.id)];
    setSubjects(updated);
    const updatedStats = progressService.recalculateStatsFromSubjects(updated);
    setStats(updatedStats);
    showToast(`✅ "${newSubject.name}" syllabus successfully uploaded and organized!`, 'success');
  };

  // Today's goals actions
  const toggleGoalCompletion = (goalId) => {
    const updated = todayGoals.map((g) => {
      if (g.id === goalId) {
        const nextState = !g.completed;
        if (nextState) showToast('🎯 Goal completed for today!', 'success');
        return { ...g, completed: nextState };
      }
      return g;
    });
    setTodayGoals(updated);
    localStorage.setItem('friday_today_goals', JSON.stringify(updated));
  };

  // Notifications actions
  const markNotificationAsRead = (notifId) => {
    const updated = notifications.map((n) => (n.id === notifId ? { ...n, read: true } : n));
    setNotifications(updated);
    localStorage.setItem('friday_notifications', JSON.stringify(updated));
  };

  const markAllNotificationsAsRead = () => {
    const updated = notifications.map((n) => ({ ...n, read: true }));
    setNotifications(updated);
    localStorage.setItem('friday_notifications', JSON.stringify(updated));
    showToast('All notifications marked as read', 'info');
  };

  // Skill Ratings & Roadmap updates
  const updateSkillRatings = async (newRatings) => {
    setSkillRatings(newRatings);
    careerService.saveSkillRatings(newRatings);
    if (user?.id) {
      await skillService.saveBulkUserSkills(user.id, newRatings);
    }
  };

  const updateRoadmap = async (newRoadmap) => {
    setCareerRoadmap(newRoadmap);
    careerService.saveRoadmap(newRoadmap);
    if (user?.id) {
      await roadmapService.saveUserRoadmap(user.id, null, newRoadmap);
    }
  };

  const toggleRoadmapTopic = async (phaseId, topicName, completed) => {
    const updated = await careerService.updateRoadmapTopicStatus(phaseId, topicName, completed);
    setCareerRoadmap(updated);
    showToast(completed ? 'Skill marked as completed in roadmap!' : 'Skill marked as in progress', 'success');
  };

  return (
    <AppContext.Provider
      value={{
        isDarkMode,
        toggleDarkMode,
        subjects,
        loadingSubjects,
        addNewSubject,
        toggleTopicCompletion,
        todayGoals,
        toggleGoalCompletion,
        careerRoadmap,
        updateRoadmap,
        toggleRoadmapTopic,
        skillRatings,
        updateSkillRatings,
        stats,
        notifications,
        markNotificationAsRead,
        markAllNotificationsAsRead,
        isSearchOpen,
        setIsSearchOpen,
        activeVideo,
        setActiveVideo,
        toasts,
        showToast,
        removeToast,
        refreshUserData: loadUserData,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}

export default AppContext;
