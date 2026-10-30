import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.8';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';

const SYSTEM_PROMPT = `You are an expert academic examiner.
Generate 5 challenging, educational multiple-choice quiz questions based on the provided topic and lesson text.

CRITICAL RULES:
1. Every question must have exactly 4 plausible options.
2. The correctAnswer must match one of the 4 options verbatim.
3. Provide a clear, educational explanation for why that answer is correct.
4. Set difficulty to "beginner", "intermediate", or "advanced".
5. Return ONLY valid JSON matching this schema:
{
  "questions": [
    {
      "id": "q1",
      "question": "Clear question text?",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correctAnswer": "Option A",
      "explanation": "Detailed explanation.",
      "difficulty": "intermediate"
    }
  ]
}`;

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

    const groqApiKey = Deno.env.get('GROQ_API_KEY')?.trim();
    const configuredModel = (Deno.env.get('GROQ_MODEL') || 'llama-3.3-70b-versatile').trim();

    if (!groqApiKey) {
      return new Response(
        JSON.stringify({ success: false, error: { code: 'MISSING_API_KEY', message: 'GROQ_API_KEY is not configured.' } }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { topicTitle, lessonText, difficulty } = await req.json();

    const userPrompt = `TOPIC: ${topicTitle || 'Curriculum Topic'}
REQUESTED DIFFICULTY: ${difficulty || 'intermediate'}
${lessonText ? `\n--- LESSON CONTENT ---\n${lessonText.slice(0, 20000)}\n--- END LESSON CONTENT ---` : ''}

Generate 5 high-quality conceptual and analytical multiple choice questions.`;

    const groqRes = await fetch(GROQ_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${groqApiKey}`,
      },
      body: JSON.stringify({
        model: configuredModel,
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: userPrompt },
        ],
        temperature: 0.2,
        max_tokens: 2048,
        response_format: { type: 'json_object' },
      }),
    });

    if (!groqRes.ok) {
      const errText = await groqRes.text();
      return new Response(
        JSON.stringify({ success: false, error: { code: 'GROQ_ERROR', message: errText } }),
        { status: 502, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const data = await groqRes.json();
    const parsed = JSON.parse(data.choices?.[0]?.message?.content || '{"questions":[]}');

    return new Response(
      JSON.stringify({ success: true, data: parsed.questions || [] }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (err: any) {
    return new Response(
      JSON.stringify({ success: false, error: { code: 'INTERNAL_ERROR', message: err.message } }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
