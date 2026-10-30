/**
 * Verified YouTube Video Discovery Service
 * 
 * Communicates with server-side Edge Function 'search-videos' which queries
 * the YouTube Data API v3 and caches verified results in Supabase.
 * 
 * Strict compliance with Section 10:
 * - Never fabricates fake video IDs, titles, or URLs
 * - Caches real results in video_resources table
 * - If YouTube Data API key is missing or quota is exceeded, gracefully reports
 *   a clear configuration state instead of fake placeholders.
 */

import { supabase, isSupabaseConfigured } from '../supabase';

export const videoDiscoveryService = {
  /**
   * Search verified educational videos for a topic or lesson
   * 
   * @param {Object} params
   * @param {string} params.topicTitle
   * @param {string} [params.subjectName]
   * @param {string} [params.lessonId]
   * @returns {Promise<{ videos: Array, error?: string, isConfigured: boolean }>}
   */
  async searchVideos({ topicTitle, subjectName, lessonId }) {
    if (!topicTitle || !topicTitle.trim()) {
      return { videos: [], isConfigured: true };
    }

    // 1. If Supabase is configured, check Edge Function
    if (isSupabaseConfigured() && supabase) {
      try {
        const { data, error } = await supabase.functions.invoke('search-videos', {
          body: {
            topicTitle: topicTitle.trim(),
            subjectName: subjectName || '',
            lessonId: lessonId || null,
          },
        });

        if (error) {
          console.warn('[videoDiscoveryService] Edge Function error:', error.message);
          return {
            videos: [],
            isConfigured: false,
            error:
              'YouTube Data API service returned an error. Please verify Edge Function secrets or check quotas.',
          };
        }

        if (data?.error?.code === 'MISSING_API_KEY') {
          return {
            videos: [],
            isConfigured: false,
            error: data.error.message,
          };
        }

        return {
          videos: Array.isArray(data?.data) ? data.data : [],
          isConfigured: true,
          error: data?.error?.message || null,
        };
      } catch (err) {
        console.warn('[videoDiscoveryService] Failed to invoke search-videos:', err.message);
        return {
          videos: [],
          isConfigured: false,
          error: 'Unable to reach video search service: ' + err.message,
        };
      }
    }

    // Supabase not configured
    return {
      videos: [],
      isConfigured: false,
      error: 'Backend is not configured. Configure Supabase and YOUTUBE_API_KEY to view verified video resources.',
    };
  },
};

export default videoDiscoveryService;
