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

    const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY') || '';
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || supabaseAnonKey;

    const supabaseAuthClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const { data: { user }, error: authError } = await supabaseAuthClient.auth.getUser();
    if (authError || !user) {
      return new Response(
        JSON.stringify({ success: false, error: { code: 'UNAUTHORIZED', message: 'Invalid session.' } }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { topicId, status, courseId } = await req.json();

    if (!topicId) {
      return new Response(
        JSON.stringify({ success: false, error: { code: 'INVALID_INPUT', message: 'topicId is required.' } }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const validStatus = ['not_started', 'in_progress', 'completed', 'needs_revision'].includes(status)
      ? status
      : 'in_progress';

    const supabaseDb = createClient(supabaseUrl, supabaseServiceKey);

    // Upsert topic progress
    const { data: progress, error: progressErr } = await supabaseDb
      .from('topic_progress')
      .upsert(
        {
          user_id: user.id,
          topic_id: topicId,
          status: validStatus,
          last_studied_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'user_id,topic_id' }
      )
      .select()
      .single();

    if (progressErr) throw progressErr;

    // Calculate overall course progress if courseId is available
    let courseCompletionPercentage = 0;
    if (courseId) {
      const { data: topics } = await supabaseDb
        .from('topics')
        .select(`
          id,
          units!inner(course_id)
        `)
        .eq('units.course_id', courseId);

      const topicIds = (topics || []).map((t: any) => t.id);

      if (topicIds.length > 0) {
        const { data: completedProgress } = await supabaseDb
          .from('topic_progress')
          .select('id')
          .eq('user_id', user.id)
          .eq('status', 'completed')
          .in('topic_id', topicIds);

        const completedCount = completedProgress ? completedProgress.length : 0;
        courseCompletionPercentage = Math.round((completedCount / topicIds.length) * 100);
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        data: {
          progress,
          courseCompletionPercentage,
        },
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (err: any) {
    return new Response(
      JSON.stringify({ success: false, error: { code: 'INTERNAL_ERROR', message: err.message } }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
