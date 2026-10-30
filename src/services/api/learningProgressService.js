/**
 * Learning Progress Service
 * 
 * Tracks topic statuses ('not_started', 'in_progress', 'completed', 'needs_revision'),
 * calculates completion percentages, and collects performance metrics for the Progress page.
 */

import { supabase, isSupabaseConfigured } from '../supabase';

export const learningProgressService = {
  /**
   * Update progress status of a specific topic
   */
  async updateTopicProgress(topicId, status, courseId = null, userId = null) {
    if (!topicId) return null;

    const validStatus = ['not_started', 'in_progress', 'completed', 'needs_revision'].includes(status)
      ? status
      : 'in_progress';

    if (isSupabaseConfigured() && supabase && userId) {
      try {
        const { data, error } = await supabase
          .from('topic_progress')
          .upsert(
            {
              user_id: userId,
              topic_id: topicId,
              status: validStatus,
              last_studied_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            },
            { onConflict: 'user_id,topic_id' }
          )
          .select()
          .single();

        if (!error && data) return data;
      } catch (err) {
        console.warn('[learningProgressService] DB update warning:', err.message);
      }
    }

    // Local storage update
    try {
      const local = JSON.parse(localStorage.getItem('study_topic_progress') || '{}');
      local[topicId] = {
        topic_id: topicId,
        status: validStatus,
        last_studied_at: new Date().toISOString(),
      };
      localStorage.setItem('study_topic_progress', JSON.stringify(local));
      return local[topicId];
    } catch (_) {
      return null;
    }
  },

  /**
   * Get all progress entries for current student
   */
  async getUserProgress(userId) {
    if (isSupabaseConfigured() && supabase && userId) {
      try {
        const { data: progressData } = await supabase
          .from('topic_progress')
          .select('*')
          .eq('user_id', userId);

        const { data: quizAttempts } = await supabase
          .from('quiz_attempts')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: false });

        return {
          topicProgress: progressData || [],
          quizAttempts: quizAttempts || [],
        };
      } catch (err) {
        console.warn('[learningProgressService] Falling back to local progress:', err.message);
      }
    }

    try {
      const localProgress = JSON.parse(localStorage.getItem('study_topic_progress') || '{}');
      const localAttempts = JSON.parse(localStorage.getItem('study_quiz_attempts') || '[]');
      return {
        topicProgress: Object.values(localProgress),
        quizAttempts: localAttempts,
      };
    } catch (_) {
      return { topicProgress: [], quizAttempts: [] };
    }
  },
};

export default learningProgressService;
