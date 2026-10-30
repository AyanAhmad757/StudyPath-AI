/**
 * Course and Syllabus Curriculum Service
 * 
 * Manages courses, units, and topics in Supabase PostgreSQL (Section 12 schema)
 * with support for complete syllabus hierarchy review and editing.
 */

import { supabase, isSupabaseConfigured } from '../supabase';

export const courseService = {
  /**
   * Get all courses for the current user
   */
  async getCourses(userId) {
    if (!isSupabaseConfigured() || !supabase || !userId) {
      const local = localStorage.getItem('study_courses');
      return local ? JSON.parse(local) : [];
    }

    try {
      // Query courses (or fallback to syllabi)
      let courses = [];
      const { data: courseRows, error: courseErr } = await supabase
        .from('courses')
        .select(`
          id,
          title,
          code,
          description,
          created_at,
          updated_at,
          units (
            id,
            title,
            position,
            topics (
              id,
              title,
              position
            )
          )
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (!courseErr && courseRows && courseRows.length > 0) {
        courses = courseRows;
      } else {
        // Fallback to syllabi table if courses table is empty
        const { data: syllabiRows } = await supabase
          .from('syllabi')
          .select(`
            id,
            title,
            code,
            created_at,
            updated_at,
            units (
              id,
              name,
              order_number,
              topics (
                id,
                name,
                order_number
              )
            )
          `)
          .eq('user_id', userId)
          .order('created_at', { ascending: false });

        if (syllabiRows) {
          courses = syllabiRows.map((s) => ({
            id: s.id,
            title: s.title,
            code: s.code,
            description: s.title,
            created_at: s.created_at,
            updated_at: s.updated_at,
            units: (s.units || []).map((u) => ({
              id: u.id,
              title: u.name,
              position: u.order_number,
              topics: (u.topics || []).map((t) => ({
                id: t.id,
                title: t.name,
                position: t.order_number,
              })),
            })),
          }));
        }
      }

      // Fetch user topic progress to compute course percentage
      const { data: progressRows } = await supabase
        .from('topic_progress')
        .select('topic_id, status')
        .eq('user_id', userId);

      const progressMap = new Map();
      (progressRows || []).forEach((p) => progressMap.set(p.topic_id, p.status));

      const enrichedCourses = courses.map((course) => {
        let totalTopics = 0;
        let completedTopics = 0;

        (course.units || []).forEach((unit) => {
          (unit.topics || []).forEach((topic) => {
            totalTopics++;
            if (progressMap.get(topic.id) === 'completed') {
              completedTopics++;
            }
          });
        });

        const progressPercent = totalTopics > 0 ? Math.round((completedTopics / totalTopics) * 100) : 0;

        return {
          ...course,
          totalUnits: (course.units || []).length,
          totalTopics,
          completedTopics,
          progressPercent,
        };
      });

      return enrichedCourses;
    } catch (err) {
      console.error('[courseService.getCourses] Error:', err.message);
      const local = localStorage.getItem('study_courses');
      return local ? JSON.parse(local) : [];
    }
  },

  /**
   * Get single course details with full unit and topic tree
   */
  async getCourseById(courseId, userId) {
    if (!courseId) throw new Error('courseId is required.');

    if (!isSupabaseConfigured() || !supabase) {
      const local = localStorage.getItem('study_courses');
      const list = local ? JSON.parse(local) : [];
      return list.find((c) => c.id === courseId) || null;
    }

    try {
      // 1. Try querying courses table
      let course = null;
      const { data: courseRow } = await supabase
        .from('courses')
        .select(`
          id,
          title,
          code,
          description,
          created_at,
          updated_at,
          units (
            id,
            title,
            position,
            description,
            topics (
              id,
              title,
              position,
              difficulty,
              estimated_minutes,
              description,
              learning_objectives,
              prerequisites,
              subtopics
            )
          )
        `)
        .eq('id', courseId)
        .maybeSingle();

      if (courseRow) {
        course = courseRow;
      } else {
        // Fallback to syllabi
        const { data: syllabusRow } = await supabase
          .from('syllabi')
          .select(`
            id,
            title,
            code,
            created_at,
            updated_at,
            units (
              id,
              name,
              order_number,
              description,
              topics (
                id,
                name,
                order_number,
                difficulty,
                estimated_minutes,
                description,
                learning_objectives,
                prerequisites,
                subtopics
              )
            )
          `)
          .eq('id', courseId)
          .maybeSingle();

        if (syllabusRow) {
          course = {
            id: syllabusRow.id,
            title: syllabusRow.title,
            code: syllabusRow.code,
            description: syllabusRow.title,
            created_at: syllabusRow.created_at,
            updated_at: syllabusRow.updated_at,
            units: (syllabusRow.units || []).map((u) => ({
              id: u.id,
              title: u.name,
              position: u.order_number,
              description: u.description,
              topics: (u.topics || []).map((t) => ({
                id: t.id,
                title: t.name,
                position: t.order_number,
                difficulty: (t.difficulty || 'intermediate').toLowerCase(),
                estimated_minutes: t.estimated_minutes,
                description: t.description,
                learning_objectives: t.learning_objectives || [],
                prerequisites: t.prerequisites || [],
                subtopics: t.subtopics || [],
              })),
            })),
          };
        }
      }

      if (!course) return null;

      // Sort units and topics by position
      if (course.units) {
        course.units.sort((a, b) => (a.position || 0) - (b.position || 0));
        course.units.forEach((u) => {
          if (u.topics) {
            u.topics.sort((a, b) => (a.position || 0) - (b.position || 0));
          }
        });
      }

      // Attach topic progress if userId is available
      if (userId) {
        const { data: progressRows } = await supabase
          .from('topic_progress')
          .select('topic_id, status, last_studied_at')
          .eq('user_id', userId);

        const progressMap = new Map();
        (progressRows || []).forEach((p) => progressMap.set(p.topic_id, p));

        if (course.units) {
          course.units.forEach((u) => {
            (u.topics || []).forEach((t) => {
              const p = progressMap.get(t.id);
              t.status = p ? p.status : 'not_started';
              t.last_studied_at = p ? p.last_studied_at : null;
            });
          });
        }
      }

      return course;
    } catch (err) {
      console.error('[courseService.getCourseById] Error:', err.message);
      return null;
    }
  },

  /**
   * Add a new unit to course
   */
  async addUnit(courseId, unitData) {
    if (!isSupabaseConfigured() || !supabase) {
      return { id: `unit-${Date.now()}`, ...unitData };
    }

    const { data, error } = await supabase
      .from('units')
      .insert({
        course_id: courseId,
        syllabus_id: courseId,
        title: unitData.title,
        name: unitData.title,
        position: unitData.position || 1,
        order_number: unitData.position || 1,
        description: unitData.description || '',
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Update unit title or description
   */
  async updateUnit(unitId, data) {
    if (!isSupabaseConfigured() || !supabase) return data;

    const { error } = await supabase
      .from('units')
      .update({
        title: data.title,
        name: data.title,
        description: data.description,
      })
      .eq('id', unitId);

    if (error) throw error;
    return true;
  },

  /**
   * Delete unit (cascades to topics)
   */
  async deleteUnit(unitId) {
    if (!isSupabaseConfigured() || !supabase) return true;

    const { error } = await supabase.from('units').delete().eq('id', unitId);
    if (error) throw error;
    return true;
  },

  /**
   * Add a new topic to a unit
   */
  async addTopic(unitId, topicData) {
    if (!isSupabaseConfigured() || !supabase) {
      return { id: `topic-${Date.now()}`, ...topicData };
    }

    const { data, error } = await supabase
      .from('topics')
      .insert({
        unit_id: unitId,
        title: topicData.title,
        name: topicData.title,
        position: topicData.position || 1,
        order_number: topicData.position || 1,
        difficulty: (topicData.difficulty || 'intermediate').toLowerCase(),
        estimated_minutes: topicData.estimatedMinutes || 45,
        description: topicData.description || '',
        subtopics: topicData.subtopics || [],
        learning_objectives: topicData.learningObjectives || [],
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Update topic details
   */
  async updateTopic(topicId, data) {
    if (!isSupabaseConfigured() || !supabase) return data;

    const { error } = await supabase
      .from('topics')
      .update({
        title: data.title,
        name: data.title,
        difficulty: (data.difficulty || 'intermediate').toLowerCase(),
        estimated_minutes: data.estimatedMinutes,
        description: data.description,
        subtopics: data.subtopics,
      })
      .eq('id', topicId);

    if (error) throw error;
    return true;
  },

  /**
   * Delete topic
   */
  async deleteTopic(topicId) {
    if (!isSupabaseConfigured() || !supabase) return true;

    const { error } = await supabase.from('topics').delete().eq('id', topicId);
    if (error) throw error;
    return true;
  },
};

export default courseService;
