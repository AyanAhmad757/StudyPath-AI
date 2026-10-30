import { supabase, isSupabaseConfigured } from './supabase';

export const videoService = {
  /**
   * Query videos associated with a given topic
   */
  async getVideosByTopic(topicId) {
    if (!isSupabaseConfigured() || !topicId) {
      return [];
    }

    try {
      const { data, error } = await supabase
        .from('videos')
        .select('*')
        .eq('topic_id', topicId);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching topic videos from Supabase:', error.message);
      return [];
    }
  },
};

export default videoService;
