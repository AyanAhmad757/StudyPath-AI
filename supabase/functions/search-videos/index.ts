import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.8';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ success: false, error: { code: 'UNAUTHORIZED', message: 'Missing Authorization header.' } }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { query, topicTitle, subjectName, lessonId } = await req.json();
    const searchQuery = query || `${topicTitle || ''} ${subjectName || ''} tutorial explanation`.trim();

    if (!searchQuery) {
      return new Response(
        JSON.stringify({ success: false, error: { code: 'INVALID_INPUT', message: 'Search query is required.' } }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || Deno.env.get('SUPABASE_ANON_KEY') || '';
    const supabaseDb = createClient(supabaseUrl, supabaseServiceKey);

    // 1. Check if we already cached verified videos for this lesson
    if (lessonId) {
      const { data: cachedVideos } = await supabaseDb
        .from('video_resources')
        .select('*')
        .eq('lesson_id', lessonId);

      if (cachedVideos && cachedVideos.length > 0) {
        return new Response(
          JSON.stringify({
            success: true,
            cached: true,
            data: cachedVideos.map((v) => ({
              videoId: v.video_id,
              title: v.title,
              channelTitle: v.channel_title,
              thumbnailUrl: v.thumbnail_url,
              url: v.url,
              relevanceExplanation: v.relevance_explanation || 'Curriculum relevant video resource.',
            })),
          }),
          { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    // 2. Read YOUTUBE_API_KEY from Supabase secrets
    const youtubeApiKey = Deno.env.get('YOUTUBE_API_KEY')?.trim();

    if (!youtubeApiKey) {
      // Return clear configuration warning instead of fake recommendations
      return new Response(
        JSON.stringify({
          success: false,
          error: {
            code: 'MISSING_API_KEY',
            message:
              'YouTube Data API key is not configured. Please set YOUTUBE_API_KEY in Supabase Edge Function secrets to enable video discovery.',
          },
          data: [],
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // 3. Call YouTube Data API v3
    const encodedQuery = encodeURIComponent(searchQuery);
    const ytUrl = `https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=5&q=${encodedQuery}&type=video&videoEmbeddable=true&relevanceLanguage=en&safeSearch=strict&key=${youtubeApiKey}`;

    const ytRes = await fetch(ytUrl);
    if (!ytRes.ok) {
      const errText = await ytRes.text();
      let friendlyMsg = `YouTube API responded with status ${ytRes.status}.`;
      if (ytRes.status === 403) {
        friendlyMsg = 'YouTube Data API quota exceeded or key invalid. Check Google Cloud Console.';
      }
      return new Response(
        JSON.stringify({
          success: false,
          error: { code: 'YOUTUBE_API_ERROR', message: friendlyMsg, details: errText },
          data: [],
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const ytData = await ytRes.json();
    const items = ytData.items || [];

    const verifiedVideos = items
      .filter((item: any) => item.id?.videoId && item.snippet?.title)
      .map((item: any) => ({
        videoId: item.id.videoId,
        title: item.snippet.title,
        channelTitle: item.snippet.channelTitle || 'Educational Channel',
        thumbnailUrl: item.snippet.thumbnails?.medium?.url || item.snippet.thumbnails?.default?.url || '',
        url: `https://www.youtube.com/watch?v=${item.id.videoId}`,
        relevanceExplanation: `Verified educational video discussing ${topicTitle || searchQuery}.`,
      }));

    // 4. Cache into video_resources if lessonId is provided
    if (lessonId && verifiedVideos.length > 0) {
      const rows = verifiedVideos.map((v: any) => ({
        lesson_id: lessonId,
        video_id: v.videoId,
        title: v.title,
        channel_title: v.channelTitle,
        thumbnail_url: v.thumbnailUrl,
        url: v.url,
        relevance_explanation: v.relevanceExplanation,
      }));
      await supabaseDb.from('video_resources').insert(rows).select();
    }

    return new Response(
      JSON.stringify({
        success: true,
        data: verifiedVideos,
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (err: any) {
    return new Response(
      JSON.stringify({ success: false, error: { code: 'INTERNAL_ERROR', message: err.message }, data: [] }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
