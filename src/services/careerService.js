import { supabase, isSupabaseConfigured } from './supabase';
import { careerTracks, skillAssessmentCategories, initialFullStackRoadmap } from '../data/mockData';

const CAREER_ROADMAP_STORAGE_KEY = 'friday_career_roadmap';
const SKILL_RATINGS_STORAGE_KEY = 'friday_skill_ratings';

export const careerService = {
  /**
   * Fetch all career paths from Supabase
   */
  async getCareers() {
    if (!isSupabaseConfigured()) {
      return careerTracks;
    }

    try {
      const { data, error } = await supabase
        .from('career_paths')
        .select('*')
        .order('name');

      if (error || !data || data.length === 0) {
        return careerTracks;
      }

      return data.map((c) => ({
        id: c.id,
        name: c.name,
        slug: c.slug,
        description: c.description,
        iconName: c.icon || 'Code2',
        salaryRange: c.salary_range || '₹12 - 28 LPA',
        badge: c.badge || 'Popular Track',
        color: 'purple',
        skillsCount: 16,
        avgTimeToJob: '4-6 Months',
      }));
    } catch (error) {
      console.error('Error fetching career paths from Supabase:', error.message);
      return careerTracks;
    }
  },

  async getCareerById(careerId) {
    const careers = await this.getCareers();
    return careers.find((c) => c.id === careerId) || careers[0];
  },

  getSkillAssessmentCategories() {
    return skillAssessmentCategories;
  },

  getSkillRatings() {
    const saved = localStorage.getItem(SKILL_RATINGS_STORAGE_KEY);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return {};
      }
    }
    const defaults = {};
    skillAssessmentCategories.forEach((cat) => {
      cat.skills.forEach((s) => {
        defaults[s.id] = s.defaultLevel;
      });
    });
    return defaults;
  },

  saveSkillRatings(ratings) {
    localStorage.setItem(SKILL_RATINGS_STORAGE_KEY, JSON.stringify(ratings));
  },

  getRoadmap() {
    const saved = localStorage.getItem(CAREER_ROADMAP_STORAGE_KEY);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return initialFullStackRoadmap;
      }
    }
    return initialFullStackRoadmap;
  },

  saveRoadmap(roadmap) {
    localStorage.setItem(CAREER_ROADMAP_STORAGE_KEY, JSON.stringify(roadmap));
  },

  async updateRoadmapTopicStatus(phaseId, topicName, completed) {
    const roadmap = this.getRoadmap();
    const updatedPhases = roadmap.phases.map((phase) => {
      if (phase.id === phaseId) {
        let compCount = 0;
        const updatedTopics = phase.topics.map((t) => {
          if (t.name === topicName) {
            if (completed) compCount++;
            return { ...t, completed };
          }
          if (t.completed) compCount++;
          return t;
        });

        const phaseProgress = Math.round((compCount / (phase.topics.length || 1)) * 100);
        let status = phase.status;
        if (phaseProgress === 100) status = 'Completed';
        else if (phaseProgress > 0) status = 'In Progress';

        return {
          ...phase,
          topics: updatedTopics,
          progress: phaseProgress,
          status,
        };
      }
      return phase;
    });

    const updatedRoadmap = {
      ...roadmap,
      phases: updatedPhases,
    };

    this.saveRoadmap(updatedRoadmap);
    return updatedRoadmap;
  },
};

export default careerService;
