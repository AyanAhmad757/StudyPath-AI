/**
 * Lesson Service for AI Study Platform
 * 
 * Manages structured lessons (Mode A syllabus topics & Mode B standalone "Learn Anything" lessons)
 * stored in public.lessons.
 */

import { supabase, isSupabaseConfigured } from '../supabase';

export const lessonService = {
  /**
   * Get all lessons for the authenticated student (Syllabus & Standalone)
   */
  async getLessons(userId) {
    if (!isSupabaseConfigured() || !supabase || !userId) {
      const local = localStorage.getItem('study_saved_lessons');
      return local ? JSON.parse(local) : [];
    }

    try {
      const { data, error } = await supabase
        .from('lessons')
        .select(`
          id,
          user_id,
          course_id,
          topic_id,
          title,
          learning_level,
          created_at,
          updated_at,
          courses (
            id,
            title
          ),
          topics (
            id,
            title
          )
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (err) {
      console.warn('[lessonService.getLessons] Fallback to local storage:', err.message);
      const local = localStorage.getItem('study_saved_lessons');
      return local ? JSON.parse(local) : [];
    }
  },

  /**
   * Get complete lesson by ID with content_json and associated quizzes/videos
   */
  async getLessonById(lessonId, userId = null) {
    if (!lessonId) return null;

    if (!isSupabaseConfigured() || !supabase) {
      const local = localStorage.getItem('study_saved_lessons');
      const list = local ? JSON.parse(local) : [];
      return list.find((l) => l.id === lessonId) || null;
    }

    try {
      const { data, error } = await supabase
        .from('lessons')
        .select(`
          id,
          user_id,
          course_id,
          topic_id,
          source_file_id,
          title,
          content_json,
          learning_level,
          created_at,
          updated_at,
          courses (
            id,
            title
          ),
          topics (
            id,
            title,
            description
          ),
          video_resources (
            id,
            video_id,
            title,
            channel_title,
            thumbnail_url,
            url,
            relevance_explanation
          ),
          quiz_attempts (
            id,
            score,
            total_questions,
            created_at
          )
        `)
        .eq('id', lessonId)
        .maybeSingle();

      if (error) throw error;
      return data;
    } catch (err) {
      console.error('[lessonService.getLessonById] Error:', err.message);
      const local = localStorage.getItem('study_saved_lessons');
      const list = local ? JSON.parse(local) : [];
      return list.find((l) => l.id === lessonId) || null;
    }
  },

  /**
   * Save a newly generated lesson locally and to Supabase
   */
  async saveLesson({ title, content, learningLevel, courseId, topicId, sourceFileId, userId }) {
    const lessonData = {
      id: `lesson-${Date.now()}`,
      title,
      content_json: content,
      learning_level: learningLevel || 'intermediate',
      course_id: courseId || null,
      topic_id: topicId || null,
      source_file_id: sourceFileId || null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    if (isSupabaseConfigured() && supabase && userId) {
      try {
        const { data, error } = await supabase
          .from('lessons')
          .insert({
            user_id: userId,
            title,
            content_json: content,
            learning_level: learningLevel || 'intermediate',
            course_id: courseId || null,
            topic_id: topicId || null,
            source_file_id: sourceFileId || null,
          })
          .select()
          .single();

        if (!error && data) {
          lessonData.id = data.id;
        }
      } catch (dbErr) {
        console.warn('[lessonService.saveLesson] Database write error:', dbErr.message);
      }
    }

    // Always update local cache
    try {
      const local = JSON.parse(localStorage.getItem('study_saved_lessons') || '[]');
      const filtered = local.filter((l) => l.id !== lessonData.id);
      filtered.unshift(lessonData);
      localStorage.setItem('study_saved_lessons', JSON.stringify(filtered.slice(0, 50)));
    } catch (_) { }

    return lessonData;
  },

  /**
   * Delete a lesson
   */
  async deleteLesson(lessonId, userId) {
    if (isSupabaseConfigured() && supabase && userId) {
      try {
        await supabase.from('lessons').delete().eq('id', lessonId).eq('user_id', userId);
      } catch (err) {
        console.warn('[lessonService.deleteLesson] Error:', err.message);
      }
    }

    try {
      const local = JSON.parse(localStorage.getItem('study_saved_lessons') || '[]');
      const filtered = local.filter((l) => l.id !== lessonId);
      localStorage.setItem('study_saved_lessons', JSON.stringify(filtered));
    } catch (_) { }

    return true;
  },
};

export default lessonService;
