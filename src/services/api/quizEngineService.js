/**
 * Quiz Engine Service for AI Study Platform
 * 
 * Strict compliance with Section 11:
 * - Deterministic score calculation (compares answers without asking AI to guess)
 * - Persists attempts in public.quiz_attempts
 * - Updates topic status to 'completed' or 'needs_revision'
 * - Offline/local fallback if Supabase is disconnected
 */

import { supabase, isSupabaseConfigured } from '../supabase';

export const quizEngineService = {
  /**
   * Deterministically evaluate quiz answers and record the attempt
   * 
   * @param {Object} params
   * @param {string} params.lessonId
   * @param {string} [params.topicId]
   * @param {Object} params.answers - Map of question ID or question text -> student selected option string
   * @param {Array} params.quizQuestions - Array of question objects from lesson
   * @param {string} [params.userId]
   * @returns {Promise<{ attemptId: string, score: number, totalQuestions: number, percentage: number, passed: boolean, needsRevision: boolean, evaluation: Array }>}
   */
  async submitQuizAttempt({ lessonId, topicId, answers, quizQuestions = [], userId = null }) {
    if (!answers || typeof answers !== 'object') {
      throw new Error('Submitted answers map is required.');
    }

    if (!Array.isArray(quizQuestions) || quizQuestions.length === 0) {
      throw new Error('No quiz questions provided for evaluation.');
    }

    // 1. Try server-side Edge Function first if Supabase is configured
    if (isSupabaseConfigured() && supabase) {
      try {
        const { data, error } = await supabase.functions.invoke('submit-quiz', {
          body: {
            lessonId,
            answers,
          },
        });

        if (!error && data?.success && data?.data) {
          return data.data;
        }
      } catch (edgeErr) {
        console.warn('[quizEngineService] Edge Function submission failed, calculating deterministically locally:', edgeErr.message);
      }
    }

    // 2. Deterministic Local Evaluation Fallback
    let score = 0;
    const totalQuestions = quizQuestions.length;
    const evaluation = [];

    for (const q of quizQuestions) {
      const studentAnswer = (answers[q.id] || answers[q.question] || '').trim();
      const correctAnswer = (q.correctAnswer || '').trim();
      const isCorrect = studentAnswer.toLowerCase() === correctAnswer.toLowerCase();

      if (isCorrect) {
        score++;
      }

      evaluation.push({
        questionId: q.id,
        question: q.question,
        studentAnswer,
        correctAnswer,
        isCorrect,
        explanation: q.explanation || '',
      });
    }

    const percentage = Math.round((score / totalQuestions) * 100);
    const passed = percentage >= 60;
    const needsRevision = !passed;

    const result = {
      attemptId: `att-${Date.now()}`,
      score,
      totalQuestions,
      percentage,
      passed,
      needsRevision,
      evaluation,
    };

    // 3. Persist Attempt to Supabase if connected
    if (isSupabaseConfigured() && supabase && userId) {
      try {
        const { data: savedAttempt } = await supabase
          .from('quiz_attempts')
          .insert({
            user_id: userId,
            lesson_id: lessonId,
            answers_json: {
              submittedAnswers: answers,
              evaluation,
              percentage,
            },
            score,
            total_questions: totalQuestions,
          })
          .select()
          .single();

        if (savedAttempt?.id) {
          result.attemptId = savedAttempt.id;
        }

        // Update topic progress
        if (topicId) {
          await supabase.from('topic_progress').upsert(
            {
              user_id: userId,
              topic_id: topicId,
              status: passed ? 'completed' : 'needs_revision',
              last_studied_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            },
            { onConflict: 'user_id,topic_id' }
          );
        }
      } catch (dbErr) {
        console.warn('[quizEngineService] Could not persist to Supabase:', dbErr.message);
      }
    }

    // Also persist to localStorage for offline review
    try {
      const localAttempts = JSON.parse(localStorage.getItem('study_quiz_attempts') || '[]');
      localAttempts.unshift({
        ...result,
        lessonId,
        topicId,
        submittedAt: new Date().toISOString(),
      });
      localStorage.setItem('study_quiz_attempts', JSON.stringify(localAttempts.slice(0, 50)));
    } catch (_) { }

    return result;
  },

  /**
   * Fetch previous attempts for a lesson
   */
  async getAttemptsByLesson(lessonId, userId = null) {
    if (isSupabaseConfigured() && supabase && userId) {
      try {
        const { data, error } = await supabase
          .from('quiz_attempts')
          .select('*')
          .eq('lesson_id', lessonId)
          .eq('user_id', userId)
          .order('created_at', { ascending: false });

        if (!error && data) return data;
      } catch (_) { }
    }

    try {
      const localAttempts = JSON.parse(localStorage.getItem('study_quiz_attempts') || '[]');
      return localAttempts.filter((a) => a.lessonId === lessonId);
    } catch (_) {
      return [];
    }
  },
};

export default quizEngineService;
