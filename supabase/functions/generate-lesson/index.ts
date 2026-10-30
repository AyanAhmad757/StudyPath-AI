import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.8';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';

const SYSTEM_PROMPT = `You are a master academic educator and technical curriculum designer.
Your task is to generate an in-depth, structured, university-grade educational lesson.

CRITICAL INSTRUCTIONS:
1. Return ONLY valid JSON matching the exact schema below.
2. Do NOT use markdown code fences or conversational text outside the JSON.
3. If source material is provided, ground the factual explanations strictly in that material.
4. If the source material does not contain enough information to cover a topic, explicitly state the limitation in "uncertainties" and "sourceCoverage", and distinguish core facts from additional AI context.
5. Never invent or hallucinate missing formulas, equations, or experimental values.
6. Provide clear, step-by-step mathematical or logical derivations where appropriate.
7. Provide at least 3-5 multiple-choice questions with 4 options each, clearly indicating the correct answer and a pedagogical explanation.

REQUIRED JSON SCHEMA:
{
  "lessonTitle": "Precise Title of the Lesson",
  "learningObjectives": [
    "Master core definition and mathematical/logical formulations",
    "Analyze execution pipeline, constraints, and state transitions",
    "Evaluate real-world engineering trade-offs and edge cases"
  ],
  "prerequisites": ["Prerequisite 1", "Prerequisite 2"],
  "simpleIntroduction": "An intuitive, accessible introduction explaining why this topic matters and the fundamental intuition.",
  "detailedExplanation": [
    {
      "stepNumber": 1,
      "title": "First Fundamental Step",
      "content": "Comprehensive, rigorous breakdown of this subtopic."
    },
    {
      "stepNumber": 2,
      "title": "Mechanism and Dynamics",
      "content": "Deep technical analysis of internal operations."
    }
  ],
  "keyDefinitions": [
    {
      "term": "Essential Term 1",
      "definition": "Formal, standard academic definition."
    }
  ],
  "workedExamples": [
    {
      "problem": "Clear problem statement with concrete parameters",
      "solution": "Final numerical or analytical outcome",
      "explanation": "Step-by-step walkthrough explaining each calculation or deduction."
    }
  ],
  "equationsAndFormulas": [
    {
      "formula": "e.g. O(N log N) or E = mc^2",
      "description": "Variable breakdown and physical/computational meaning."
    }
  ],
  "keyPoints": [
    "Core takeaway 1",
    "Core takeaway 2",
    "Core takeaway 3"
  ],
  "revisionNotes": "A high-density summary for rapid exam revision.",
  "practiceQuestions": [
    "Analytical question 1",
    "Application-oriented problem 2"
  ],
  "quizQuestions": [
    {
      "id": "q1",
      "question": "Clear conceptual question testing understanding?",
      "options": ["Option A text", "Option B text", "Option C text", "Option D text"],
      "correctAnswer": "Option A text",
      "explanation": "Why Option A is correct and why other options are incorrect.",
      "difficulty": "intermediate"
    }
  ],
  "nextTopics": ["Logical Next Topic 1", "Advanced Extension 2"],
  "uncertainties": [],
  "sourceCoverage": {
    "groundedInSource": true,
    "coverageNotes": "Detailed explanation of which concepts derive from source materials.",
    "additionalAiContext": "Context provided to complete prerequisites."
  }
}`;

function cleanAndParseJson(text: string): any {
  let cleaned = text.trim();
  if (cleaned.startsWith('```json')) cleaned = cleaned.slice(7);
  else if (cleaned.startsWith('```')) cleaned = cleaned.slice(3);
  if (cleaned.endsWith('```')) cleaned = cleaned.slice(0, -3);
  cleaned = cleaned.trim();

  try {
    return JSON.parse(cleaned);
  } catch (_e) {
    // Basic repair: extract outermost braces
    const firstBrace = cleaned.indexOf('{');
    const lastBrace = cleaned.lastIndexOf('}');
    if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
      const sub = cleaned.substring(firstBrace, lastBrace + 1);
      // Remove trailing commas
      const repaired = sub.replace(/,\s*([\}\]])/g, '$1');
      return JSON.parse(repaired);
    }
    throw new Error('Unable to parse AI response as valid JSON.');
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // 1. Authenticate Request
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
        JSON.stringify({ success: false, error: { code: 'UNAUTHORIZED', message: 'Invalid or expired session.' } }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // 2. Read Secrets
    const groqApiKey = Deno.env.get('GROQ_API_KEY')?.trim();
    const configuredModel = (Deno.env.get('GROQ_MODEL') || 'openai/gpt-oss-120b').trim();

    if (!groqApiKey) {
      return new Response(
        JSON.stringify({
          success: false,
          error: {
            code: 'MISSING_API_KEY',
            message: 'GROQ_API_KEY is not configured in Supabase Edge Function secrets.',
          },
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // 3. Parse Body
    const { topicTitle, subjectName, sourceText, learningLevel, courseId, topicId, sourceFileId } = await req.json();

    if (!topicTitle || typeof topicTitle !== 'string' || !topicTitle.trim()) {
      return new Response(
        JSON.stringify({
          success: false,
          error: { code: 'INVALID_INPUT', message: 'A topic title is required to generate a lesson.' },
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const level = ['beginner', 'intermediate', 'advanced'].includes(learningLevel) ? learningLevel : 'intermediate';

    const userPrompt = `TOPIC: ${topicTitle}
${subjectName ? `SUBJECT / COURSE: ${subjectName}` : ''}
SELECTED LEARNING LEVEL: ${level}
${sourceText ? `\n--- SOURCE MATERIAL EXCERPT ---\n${sourceText.slice(0, 30000)}\n--- END SOURCE MATERIAL ---` : 'NO ATTACHED SOURCE MATERIAL. Generate lesson from academic standards.'}

Please generate the comprehensive 16-section lesson matching the required schema. Ensure clear step-by-step explanations, key definitions, worked examples, and at least 3-5 multiple choice questions.`;

    // 4. Request Groq API
    let activeModel = configuredModel;
    const groqRes = await fetch(GROQ_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${groqApiKey}`,
      },
      body: JSON.stringify({
        model: activeModel,
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: userPrompt },
        ],
        temperature: 0.2,
        max_tokens: 4096,
        response_format: { type: 'json_object' },
      }),
    });

    let rawContent = '';
    if (!groqRes.ok) {
      const errText = await groqRes.text();
      // Try to query available models to pick a working model or report accurately
      let availableModels: string[] = [];
      try {
        const mRes = await fetch('https://api.groq.com/openai/v1/models', {
          headers: { 'Authorization': `Bearer ${groqApiKey}` },
        });
        if (mRes.ok) {
          const mData = await mRes.json();
          availableModels = (mData.data || []).map((m: any) => m.id);
        }
      } catch (_) {}

      // If model not found and we have available models, prioritize general chat/instruction models
      if (errText.includes('model_not_found') && availableModels.length > 0) {
        const fallbackModel = availableModels.find((m) => m === 'openai/gpt-oss-120b')
          || availableModels.find((m) => m === 'openai/gpt-oss-20b')
          || availableModels.find((m) => m.includes('qwen') || m.includes('gpt-oss'))
          || availableModels.find((m) => !m.includes('whisper') && !m.includes('prompt-guard') && !m.includes('orpheus'))
          || availableModels[0];

        if (fallbackModel && fallbackModel !== activeModel) {
          activeModel = fallbackModel;
          const retryRes = await fetch(GROQ_API_URL, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${groqApiKey}`,
            },
            body: JSON.stringify({
              model: activeModel,
              messages: [
                { role: 'system', content: SYSTEM_PROMPT },
                { role: 'user', content: userPrompt },
              ],
              temperature: 0.2,
              max_tokens: 4096,
              response_format: { type: 'json_object' },
            }),
          });

          if (retryRes.ok) {
            const retryData = await retryRes.json();
            rawContent = retryData.choices?.[0]?.message?.content || '{}';
          } else {
            const retryErr = await retryRes.text();
            return new Response(
              JSON.stringify({
                success: false,
                error: {
                  code: 'AI_PROVIDER_ERROR',
                  message: `Groq API retry failed with model '${activeModel}': ${retryErr}`,
                  availableModels,
                },
              }),
              { status: 502, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
          }
        }
      }

      if (!rawContent) {
        return new Response(
          JSON.stringify({
            success: false,
            error: {
              code: 'AI_PROVIDER_ERROR',
              message: `Groq API returned status ${groqRes.status}. Details: ${errText}`,
              availableModels,
            },
          }),
          { status: 502, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    } else {
      const groqData = await groqRes.json();
      rawContent = groqData.choices?.[0]?.message?.content || '{}';
    }

    let lessonJson: any;
    try {
      lessonJson = cleanAndParseJson(rawContent);
    } catch (parseErr: any) {
      return new Response(
        JSON.stringify({
          success: false,
          error: { code: 'INVALID_AI_SCHEMA', message: 'Failed to parse lesson JSON: ' + parseErr.message },
        }),
        { status: 422, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // 5. Persist Lesson to Database (Both lessons table and quiz_questions)
    const supabaseDb = createClient(supabaseUrl, supabaseServiceKey);

    const { data: savedLesson, error: saveErr } = await supabaseDb
      .from('lessons')
      .insert({
        user_id: user.id,
        course_id: courseId || null,
        topic_id: topicId || null,
        source_file_id: sourceFileId || null,
        title: lessonJson.lessonTitle || topicTitle,
        content_json: lessonJson,
        learning_level: level,
      })
      .select()
      .single();

    if (saveErr) {
      console.warn('[EdgeFunction generate-lesson] Note saving error (non-fatal):', saveErr.message);
    }

    // Insert quiz questions into quiz_questions table if available
    if (savedLesson && Array.isArray(lessonJson.quizQuestions) && lessonJson.quizQuestions.length > 0) {
      const questionRows = lessonJson.quizQuestions.map((q: any, idx: number) => ({
        lesson_id: savedLesson.id,
        question_json: q,
        position: idx + 1,
      }));
      await supabaseDb.from('quiz_questions').insert(questionRows).select();
    }

    return new Response(
      JSON.stringify({
        success: true,
        data: {
          lessonId: savedLesson?.id || `temp-${Date.now()}`,
          title: lessonJson.lessonTitle || topicTitle,
          content: lessonJson,
          learningLevel: level,
        },
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (err: any) {
    console.error('[EdgeFunction generate-lesson] Unhandled error:', err);
    return new Response(
      JSON.stringify({
        success: false,
        error: { code: 'INTERNAL_ERROR', message: err.message || 'An unexpected error occurred.' },
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
