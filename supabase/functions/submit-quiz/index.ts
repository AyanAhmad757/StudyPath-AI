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

    const { lessonId, answers } = await req.json();

    if (!lessonId || !answers || typeof answers !== 'object') {
      return new Response(
        JSON.stringify({ success: false, error: { code: 'INVALID_INPUT', message: 'lessonId and answers map are required.' } }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseDb = createClient(supabaseUrl, supabaseServiceKey);

    // 1. Fetch Lesson & Quiz Questions
    const { data: lesson, error: lessonErr } = await supabaseDb
      .from('lessons')
      .select('id, user_id, topic_id, content_json')
      .eq('id', lessonId)
      .single();

    if (lessonErr || !lesson) {
      return new Response(
        JSON.stringify({ success: false, error: { code: 'NOT_FOUND', message: 'Lesson not found.' } }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Extract questions from lesson content_json or quiz_questions table
    const quizQuestions = lesson.content_json?.quizQuestions || [];

    if (!Array.isArray(quizQuestions) || quizQuestions.length === 0) {
      return new Response(
        JSON.stringify({ success: false, error: { code: 'NO_QUESTIONS', message: 'No quiz questions available for this lesson.' } }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // 2. Deterministic Score Calculation
    let score = 0;
    const totalQuestions = quizQuestions.length;
    const evaluationResults = [];

    for (const q of quizQuestions) {
      const studentAnswer = answers[q.id] || answers[q.question] || '';
      const isCorrect =
        studentAnswer.trim().toLowerCase() === (q.correctAnswer || '').trim().toLowerCase();

      if (isCorrect) {
        score++;
      }

      evaluationResults.push({
        questionId: q.id,
        question: q.question,
        studentAnswer,
        correctAnswer: q.correctAnswer,
        isCorrect,
        explanation: q.explanation || '',
      });
    }

    const percentage = Math.round((score / totalQuestions) * 100);
    const passed = percentage >= 60;

    // 3. Persist Quiz Attempt
    const { data: attempt, error: attemptErr } = await supabaseDb
      .from('quiz_attempts')
      .insert({
        user_id: user.id,
        lesson_id: lesson.id,
        answers_json: {
          submittedAnswers: answers,
          evaluation: evaluationResults,
          percentage,
        },
        score,
        total_questions: totalQuestions,
      })
      .select()
      .single();

    if (attemptErr) {
      console.warn('[submit-quiz] Failed to save attempt:', attemptErr.message);
    }

    // 4. Update Topic Progress (if lesson is tied to a topic)
    if (lesson.topic_id) {
      const topicStatus = passed ? 'completed' : 'needs_revision';
      await supabaseDb.from('topic_progress').upsert(
        {
          user_id: user.id,
          topic_id: lesson.topic_id,
          status: topicStatus,
          last_studied_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'user_id,topic_id' }
      );
    }

    return new Response(
      JSON.stringify({
        success: true,
        data: {
          attemptId: attempt?.id || `att-${Date.now()}`,
          score,
          totalQuestions,
          percentage,
          passed,
          needsRevision: !passed,
          evaluation: evaluationResults,
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
