import { supabase, isSupabaseConfigured } from './supabase';
import { skillAssessmentCategories } from '../data/mockData';

export const skillService = {
  /**
   * Fetch standard catalog of skills from Supabase
   */
  async getAllSkills() {
    if (!isSupabaseConfigured()) {
      return skillAssessmentCategories;
    }

    try {
      const { data, error } = await supabase
        .from('skills')
        .select('*')
        .order('category');

      if (error || !data || data.length === 0) {
        return skillAssessmentCategories;
      }

      // Group by category
      const categoriesMap = {};
      data.forEach((skill) => {
        const cat = skill.category || 'Core Skills';
        if (!categoriesMap[cat]) {
          categoriesMap[cat] = [];
        }
        categoriesMap[cat].push({
          id: skill.id,
          name: skill.name,
          category: cat,
          defaultLevel: 0,
        });
      });

      return Object.keys(categoriesMap).map((catName) => ({
        name: catName,
        skills: categoriesMap[catName],
      }));
    } catch (error) {
      console.error('Error fetching skills catalog from Supabase:', error.message);
      return skillAssessmentCategories;
    }
  },

  /**
   * Fetch current user's skill ratings from public.user_skills
   */
  async getUserSkills(userId) {
    if (!isSupabaseConfigured() || !userId) {
      return JSON.parse(localStorage.getItem('friday_skill_ratings') || '{}');
    }

    try {
      const { data, error } = await supabase
        .from('user_skills')
        .select('skill_id, level, skills(name, category)')
        .eq('user_id', userId);

      if (error) throw error;

      const ratingsMap = {};
      (data || []).forEach((row) => {
        ratingsMap[row.skill_id] = row.level;
        if (row.skills?.name) {
          ratingsMap[row.skills.name] = row.level;
        }
      });

      return ratingsMap;
    } catch (error) {
      console.error('Error fetching user skills from Supabase:', error.message);
      return JSON.parse(localStorage.getItem('friday_skill_ratings') || '{}');
    }
  },

  /**
   * Upsert a user skill rating
   */
  async saveUserSkill(userId, skillId, level) {
    if (!isSupabaseConfigured() || !userId) {
      const saved = JSON.parse(localStorage.getItem('friday_skill_ratings') || '{}');
      saved[skillId] = level;
      localStorage.setItem('friday_skill_ratings', JSON.stringify(saved));
      return { success: true };
    }

    try {
      const { error } = await supabase
        .from('user_skills')
        .upsert(
          {
            user_id: userId,
            skill_id: skillId,
            level: level,
            updated_at: new Date().toISOString(),
          },
          { onConflict: 'user_id,skill_id' }
        );

      if (error) throw error;
      return { success: true };
    } catch (error) {
      console.error('Error saving user skill:', error.message);
      return { success: false, error };
    }
  },

  /**
   * Save multiple skill ratings at once
   */
  async saveBulkUserSkills(userId, ratingsMap) {
    if (!isSupabaseConfigured() || !userId) {
      localStorage.setItem('friday_skill_ratings', JSON.stringify(ratingsMap));
      return { success: true };
    }

    try {
      // Look up skill IDs if names are passed
      const { data: skills } = await supabase.from('skills').select('id, name');
      const skillNameToId = {};
      (skills || []).forEach((s) => {
        skillNameToId[s.name] = s.id;
      });

      const upsertRows = [];
      Object.entries(ratingsMap).forEach(([key, level]) => {
        const skillId = skillNameToId[key] || key;
        // Verify skillId is a valid UUID or existing skill
        if (skillId) {
          upsertRows.push({
            user_id: userId,
            skill_id: skillId,
            level: Number(level) || 0,
            updated_at: new Date().toISOString(),
          });
        }
      });

      if (upsertRows.length > 0) {
        const { error } = await supabase
          .from('user_skills')
          .upsert(upsertRows, { onConflict: 'user_id,skill_id' });

        if (error) throw error;
      }

      return { success: true };
    } catch (error) {
      console.error('Error saving bulk user skills:', error.message);
      localStorage.setItem('friday_skill_ratings', JSON.stringify(ratingsMap));
      return { success: true };
    }
  },
};

export default skillService;
