import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.8';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';

const SYSTEM_PROMPT = `You are a patient, brilliant academic tutor helping a student with a specific doubt.

CRITICAL RULES:
1. Ground your answer in the provided lesson and source material.
2. If the source material does not contain the answer, explicitly state: "The provided study material does not explicitly mention this, but conceptually..." and then provide the conceptual explanation.
3. Be concise, precise, and pedagogically clear.
4. If relevant, provide a concrete mini-example or mathematical illustration.
5. Provide 2-3 helpful follow-up questions the student might want to explore.
6. Return ONLY valid JSON matching this schema:
{
  "answer": "Clear, detailed response addressing the student's doubt directly.",
  "sourceGrounded": true,
  "uncertaintyNotes": "",
  "suggestedFollowUps": ["Follow-up question 1?", "Follow-up question 2?"]
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

    const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY') || '';
    const groqApiKey = Deno.env.get('GROQ_API_KEY')?.trim();
    const configuredModel = (Deno.env.get('GROQ_MODEL') || 'llama-3.3-70b-versatile').trim();

    if (!groqApiKey) {
      return new Response(
        JSON.stringify({
          success: false,
          error: { code: 'MISSING_API_KEY', message: 'GROQ_API_KEY is not configured in Supabase Edge Function secrets.' },
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { question, topicTitle, lessonContext, sourceExcerpt, learningLevel } = await req.json();

    if (!question || typeof question !== 'string' || !question.trim()) {
      return new Response(
        JSON.stringify({ success: false, error: { code: 'INVALID_INPUT', message: 'Question cannot be empty.' } }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const userPrompt = `TOPIC: ${topicTitle || 'General'}
STUDENT LEARNING LEVEL: ${learningLevel || 'intermediate'}
STUDENT'S DOUBT: "${question}"

--- CURRENT LESSON CONTEXT ---
${(lessonContext || '').slice(0, 15000)}
--- END LESSON CONTEXT ---

${sourceExcerpt ? `--- UPLOADED SOURCE MATERIAL EXCERPT ---\n${sourceExcerpt.slice(0, 10000)}\n--- END SOURCE MATERIAL ---` : ''}

Please answer the student's doubt directly, following all system instructions and returning strictly JSON.`;

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
        max_tokens: 1500,
        response_format: { type: 'json_object' },
      }),
    });

    if (!groqRes.ok) {
      const errText = await groqRes.text();
      return new Response(
        JSON.stringify({
          success: false,
          error: { code: 'AI_PROVIDER_ERROR', message: `Groq error (${groqRes.status}): ${errText}` },
        }),
        { status: 502, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const data = await groqRes.json();
    const content = data.choices?.[0]?.message?.content || '{}';
    const parsed = JSON.parse(content);

    return new Response(
      JSON.stringify({
        success: true,
        data: {
          answer: parsed.answer || 'No direct answer could be formulated.',
          sourceGrounded: Boolean(parsed.sourceGrounded),
          uncertaintyNotes: parsed.uncertaintyNotes || '',
          suggestedFollowUps: Array.isArray(parsed.suggestedFollowUps) ? parsed.suggestedFollowUps : [],
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
