import { supabase, isSupabaseConfigured } from './supabase';

export const quizService = {
  /**
   * Fetch quiz questions for a given topic from Supabase
   */
  async getQuizzesByTopic(topicId) {
    if (!isSupabaseConfigured() || !topicId) {
      return [];
    }

    try {
      const { data, error } = await supabase
        .from('quizzes')
        .select('*')
        .eq('topic_id', topicId);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching topic quizzes:', error.message);
      return [];
    }
  },

  /**
   * Submit quiz attempt results to public.quiz_attempts
   */
  async submitQuizAttempt(userId, topicId, score, totalQuestions) {
    if (!isSupabaseConfigured() || !userId) {
      // Local storage fallback
      const attempts = JSON.parse(localStorage.getItem('friday_quiz_attempts') || '[]');
      const newAttempt = {
        id: `att-${Date.now()}`,
        user_id: userId || 'local-user',
        topic_id: topicId,
        score,
        total_questions: totalQuestions,
        created_at: new Date().toISOString(),
      };
      attempts.push(newAttempt);
      localStorage.setItem('friday_quiz_attempts', JSON.stringify(attempts));
      return { data: newAttempt, error: null };
    }

    try {
      const { data, error } = await supabase
        .from('quiz_attempts')
        .insert({
          user_id: userId,
          topic_id: topicId,
          score,
          total_questions: totalQuestions,
        })
        .select()
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error submitting quiz attempt:', error.message);
      return { data: null, error };
    }
  },

  /**
   * Get all quiz attempts for the authenticated student
   */
  async getUserQuizAttempts(userId) {
    if (!isSupabaseConfigured() || !userId) {
      return JSON.parse(localStorage.getItem('friday_quiz_attempts') || '[]');
    }

    try {
      const { data, error } = await supabase
        .from('quiz_attempts')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching quiz attempts:', error.message);
      return [];
    }
  },
};

export default quizService;
