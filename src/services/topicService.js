import { supabase, isSupabaseConfigured } from './supabase';
import { richTopicContents } from '../data/mockData';
import { syllabusService } from './syllabusService';

export const topicService = {
  /**
   * Fetch topic details, videos, and syllabus metadata from Supabase
   */
  async getTopicDetail(subjectId, topicId, userId) {
    if (!isSupabaseConfigured() || !userId) {
      return syllabusService.getTopicDetail(subjectId, topicId);
    }

    try {
      // 1. Fetch topic with unit & syllabus join
      const { data: topic, error } = await supabase
        .from('topics')
        .select(`
          id,
          name,
          description,
          difficulty,
          estimated_minutes,
          theory,
          completed,
          order_number,
          units (
            id,
            name,
            order_number,
            syllabi (
              id,
              title,
              code
            )
          ),
          videos (
            id,
            youtube_id,
            title,
            channel,
            thumbnail,
            duration,
            url
          )
        `)
        .eq('id', topicId)
        .single();

      if (error || !topic) {
        return syllabusService.getTopicDetail(subjectId, topicId);
      }

      const unit = topic.units;
      const syllabus = unit?.syllabi;

      return {
        id: topic.id,
        subjectId: syllabus?.id || subjectId,
        subjectName: syllabus?.title || 'Course Subject',
        unitNumber: unit?.order_number || 1,
        unitTitle: unit?.name || 'Unit 1',
        title: topic.name.replace(/^\d+\.\s*/, ''),
        difficulty: topic.difficulty || 'Intermediate',
        estimatedTime: `${topic.estimated_minutes || 25} min`,
        progress: topic.completed ? 100 : 30,
        completed: topic.completed,
        overview: topic.description || topic.theory || `${topic.name} is a key topic in ${syllabus?.title || 'the curriculum'}.`,
        learningObjectives: [
          `Master core theoretical and architectural foundations of ${topic.name}.`,
          'Analyze algorithms, data transformation pipelines, and state transitions.',
          'Review real-world industrial deployments and university viva questions.',
        ],
        keyConcepts: [
          { title: 'Core Principles', content: 'Underlying axioms and execution parameters governing system logic.' },
          { title: 'State Transitions', content: 'Input-to-output transformation sequences during active production runtime.' },
        ],
        layers: null,
        howItWorks: '1. Verifies input structures.\n2. Executes core algorithmic pipeline.\n3. Emits state change metrics to higher layers.',
        realWorldExample: {
          title: 'Production Architecture Impact',
          content: `In high-scale enterprise engineering, ${topic.name} ensures distributed reliability, low latency, and fault isolation.`
        },
        examTips: [
          '💡 Draw clean block diagrams for architecture questions.',
          '💡 State asymptotic time and space complexities explicitly.',
        ],
        keyTerms: [
          { term: 'Throughput', definition: 'Volume of work completed in a given time interval.' },
          { term: 'Fault Tolerance', definition: 'Capacity of a system to continue operating despite component failures.' },
        ],
        videos: (topic.videos && topic.videos.length > 0)
          ? topic.videos.map((v) => ({
              id: v.id,
              title: v.title,
              channel: v.channel || 'Gate Smashers',
              duration: v.duration || '20:00',
              views: '800K views',
              difficulty: 'Intermediate',
              thumbnail: v.thumbnail || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=600&auto=format&fit=crop&q=80',
              videoUrl: v.url || `https://www.youtube.com/watch?v=${v.youtube_id || '0BopgP-i5oU'}`,
              videoId: v.youtube_id || '0BopgP-i5oU',
            }))
          : [
              {
                id: `v-${topic.id}-1`,
                title: `${topic.name} - Concept Explanation & Solved Problems`,
                channel: 'Gate Smashers',
                duration: '18:45',
                views: '1.2M views',
                difficulty: 'Beginner',
                thumbnail: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=600&auto=format&fit=crop&q=80',
                videoUrl: 'https://www.youtube.com/watch?v=0BopgP-i5oU',
                videoId: '0BopgP-i5oU',
              },
            ],
      };
    } catch (error) {
      console.error('Error fetching topic from Supabase:', error.message);
      return syllabusService.getTopicDetail(subjectId, topicId);
    }
  },
};

export default topicService;
