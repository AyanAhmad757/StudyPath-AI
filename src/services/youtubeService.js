// YouTube Service (Prepared for YouTube Data API v3 integration)

export const youtubeService = {
  /**
   * Search recommended educational videos for a topic
   */
  async searchYouTubeVideos(topicTitle, subjectName) {
    await new Promise((resolve) => setTimeout(resolve, 300));

    return [
      {
        id: `yt-${Date.now()}-1`,
        title: `${topicTitle} - Complete Guide & Animations`,
        channel: 'ByteByteGo',
        duration: '15:20',
        views: '1.4M views',
        difficulty: 'Beginner',
        thumbnail: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=600&auto=format&fit=crop&q=80',
        videoUrl: 'https://www.youtube.com/watch?v=0BopgP-i5oU',
        videoId: '0BopgP-i5oU',
        description: `Visual walkthrough of ${topicTitle} covering theoretical foundations and practical examples.`
      },
      {
        id: `yt-${Date.now()}-2`,
        title: `${topicTitle} Explained in 20 Minutes`,
        channel: 'Gate Smashers',
        duration: '21:45',
        views: '890K views',
        difficulty: 'Intermediate',
        thumbnail: 'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=600&auto=format&fit=crop&q=80',
        videoUrl: 'https://www.youtube.com/watch?v=vv4y_uOneC0',
        videoId: 'vv4y_uOneC0',
        description: `University examination prep and core definitions for ${topicTitle}.`
      }
    ];
  }
};
