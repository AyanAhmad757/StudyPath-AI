import { supabase, isSupabaseConfigured } from './supabase';
import { initialFullStackRoadmap } from '../data/mockData';

export const roadmapService = {
  /**
   * Fetch personalized roadmap for user from Supabase or structured fallback
   */
  async getUserRoadmap(userId, careerId) {
    if (!isSupabaseConfigured() || !userId) {
      const saved = localStorage.getItem('friday_career_roadmap');
      return saved ? JSON.parse(saved) : initialFullStackRoadmap;
    }

    try {
      const query = supabase
        .from('roadmaps')
        .select(`
          id,
          title,
          description,
          overall_progress,
          career_id,
          career_paths (
            id,
            name
          ),
          roadmap_steps (
            id,
            title,
            description,
            order_number,
            status,
            progress,
            completed
          )
        `)
        .eq('user_id', userId);

      if (careerId) {
        query.eq('career_id', careerId);
      }

      const { data, error } = await query.order('created_at', { ascending: false }).limit(1);

      if (error || !data || data.length === 0) {
        return initialFullStackRoadmap;
      }

      const row = data[0];
      const phases = (row.roadmap_steps || [])
        .sort((a, b) => a.order_number - b.order_number)
        .map((step) => ({
          id: step.id,
          title: step.title,
          status: step.status === 'completed' ? 'Completed' : step.status === 'in_progress' ? 'In Progress' : 'Upcoming',
          progress: step.progress,
          description: step.description,
          topics: [
            { name: `${step.title} Core Concepts`, completed: step.completed },
            { name: `${step.title} Practical Implementation`, completed: step.completed },
          ],
        }));

      return {
        id: row.id,
        careerName: row.career_paths?.name || row.title || 'Full Stack Developer',
        summary: row.description || initialFullStackRoadmap.summary,
        overallProgress: row.overall_progress || initialFullStackRoadmap.overallProgress,
        currentLevel: initialFullStackRoadmap.currentLevel,
        recommendedNextStep: initialFullStackRoadmap.recommendedNextStep,
        phases: phases.length > 0 ? phases : initialFullStackRoadmap.phases,
        skillGaps: initialFullStackRoadmap.skillGaps,
        prioritySkills: initialFullStackRoadmap.prioritySkills,
        projectRecommendations: initialFullStackRoadmap.projectRecommendations,
      };
    } catch (error) {
      console.error('Error fetching user roadmap from Supabase:', error.message);
      return initialFullStackRoadmap;
    }
  },

  /**
   * Save or persist generated roadmap
   */
  async saveUserRoadmap(userId, careerId, roadmapData) {
    if (!isSupabaseConfigured() || !userId) {
      localStorage.setItem('friday_career_roadmap', JSON.stringify(roadmapData));
      return roadmapData;
    }

    try {
      const { data: roadmapRow, error: rError } = await supabase
        .from('roadmaps')
        .insert({
          user_id: userId,
          career_id: careerId,
          title: roadmapData.careerName || 'Career Roadmap',
          description: roadmapData.summary,
          overall_progress: roadmapData.overallProgress || 0,
        })
        .select()
        .single();

      if (rError) throw rError;

      if (roadmapData.phases && roadmapData.phases.length > 0) {
        const stepRows = roadmapData.phases.map((p, idx) => ({
          roadmap_id: roadmapRow.id,
          title: p.title,
          description: p.description || '',
          order_number: idx + 1,
          status: p.status === 'Completed' ? 'completed' : p.status === 'In Progress' ? 'in_progress' : 'locked',
          progress: p.progress || 0,
          completed: p.status === 'Completed',
        }));

        await supabase.from('roadmap_steps').insert(stepRows);
      }

      return { ...roadmapData, id: roadmapRow.id };
    } catch (error) {
      console.error('Error saving roadmap in Supabase:', error.message);
      localStorage.setItem('friday_career_roadmap', JSON.stringify(roadmapData));
      return roadmapData;
    }
  },
};

export default roadmapService;
