import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.8';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};
const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';

const SYSTEM_PROMPT = `You are an expert academic syllabus analyzer.

Your task is to analyze ONLY the syllabus text provided by the user.
Your job is to transform the syllabus into a clean, structured academic hierarchy.

CRITICAL RULES:
1. Analyze ONLY the supplied syllabus text.
2. NEVER invent syllabus topics, units, subtopics, concepts, technologies, or subjects not present in the syllabus.
3. NEVER add topics from general knowledge merely because they are typical or useful.
4. NEVER create missing units or fill in perceived gaps.
5. NEVER substitute an unrelated subject.
6. Preserve unit numbering and topic numbering whenever present.
7. Correct obvious formatting/extraction errors only when the intended meaning is clear.
8. Ignore repeated page headers, footers, institutional slogans, and page numbers.
9. Do not treat college/university administration or examination guidelines as syllabus content.
10. Determine the subject from the actual extracted syllabus content, NOT just hints or filenames. If the subject cannot be determined confidently, leave the name empty ("") and record an entry in analysisMetadata.uncertainSections.
11. If any section or topic is unclear due to document extraction issues, mark it as uncertain instead of guessing.
12. Return ONLY valid JSON.
13. Do NOT return Markdown.
14. Do NOT use \`\`\`json or code fences.
15. Do NOT add any explanatory text outside the JSON.
16. In the "units" array and "topics" array, every item MUST be a separate JSON object enclosed in curly braces { ... }, strictly separated by commas: [ { ... }, { ... } ].
17. Ensure strict JSON formatting: never omit commas between objects or array elements, and do NOT include trailing commas.

REQUIRED JSON SCHEMA:
{
  "subject": {
    "name": "Exact Subject Title from syllabus (or \"\" if uncertain)",
    "code": "Course Code (e.g. CS701 or as found in syllabus)",
    "description": "Concise summary of syllabus scope strictly based on the provided text"
  },
  "units": [
    {
      "unitNumber": 1,
      "title": "Unit 1 Title",
      "description": "Concise unit scope based strictly on syllabus topics",
      "topics": [
        {
          "topicNumber": "1.1",
          "title": "Topic Title",
          "description": "Topic description strictly based on syllabus content",
          "subtopics": ["Subtopic A", "Subtopic B"],
          "difficulty": "beginner",
          "prerequisites": [],
          "estimatedMinutes": 45,
          "learningObjectives": ["Objective 1", "Objective 2"],
          "recommendedOrder": 1
        }
      ]
    },
    {
      "unitNumber": 2,
      "title": "Unit 2 Title",
      "description": "Concise unit scope based strictly on syllabus topics",
      "topics": [
        {
          "topicNumber": "2.1",
          "title": "Topic Title",
          "description": "Topic description strictly based on syllabus content",
          "subtopics": [],
          "difficulty": "intermediate",
          "prerequisites": [],
          "estimatedMinutes": 45,
          "learningObjectives": [],
          "recommendedOrder": 1
        }
      ]
    }
  ],
  "analysisMetadata": {
    "confidence": "high",
    "uncertainSections": [],
    "notes": []
  }
}

VALIDATION CONSTRAINTS:
- For "difficulty", use ONLY one of: "beginner", "intermediate", "advanced".
- "estimatedMinutes" must be an integer (e.g. 45).
- "recommendedOrder" must be an integer starting from 1 for each unit.`;

function repairMalformedJson(text: string): string {
  let r = text.trim();
  // Strip markdown code fences if present
  r = r.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '').trim();
  // Extract JSON bounds if surrounded by conversational text
  const firstBrace = r.indexOf('{');
  const lastBrace = r.lastIndexOf('}');
  if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
    r = r.substring(firstBrace, lastBrace + 1);
  }
  // 1. Remove trailing commas before } or ]
  r = r.replace(/,\s*([\}\]])/g, '$1');
  // 2. Fix missing commas between objects: } { or }\n{ -> }, {
  r = r.replace(/\}\s*\{/g, '},{');
  // 3. Fix missing commas between array items: ] [ -> ], [
  r = r.replace(/\]\s*\[/g, '],[');
  // 4. Fix missing comma between key-value pairs where key follows a primitive/brace/bracket
  r = r.replace(/([0-9"\]\}])\s*\n+\s*("[\w]+"\s*:)/g, '$1,\n$2');
  // 5. Clean any newly created trailing commas
  r = r.replace(/,\s*([\}\]])/g, '$1');
  return r;
}

function cleanJsonText(rawText: string): string {
  let cleaned = rawText.trim();
  if (cleaned.startsWith('```json')) {
    cleaned = cleaned.slice(7);
  } else if (cleaned.startsWith('```')) {
    cleaned = cleaned.slice(3);
  }
  if (cleaned.endsWith('```')) {
    cleaned = cleaned.slice(0, -3);
  }
  return cleaned.trim();
}

function parseAndUnwrap(rawText: string): any {
  const cleaned = cleanJsonText(rawText);
  let parsed: any;
  try {
    parsed = JSON.parse(cleaned);
  } catch (_initialErr) {
    // Attempt automated repair
    const repaired = repairMalformedJson(cleaned);
    parsed = JSON.parse(repaired);
  }

  if (typeof parsed === 'string') {
    try {
      parsed = JSON.parse(parsed);
    } catch (_) {
      parsed = JSON.parse(repairMalformedJson(parsed));
    }
  }
  if (Array.isArray(parsed) && parsed.length > 0) {
    parsed = parsed[0];
  }
  if (parsed && typeof parsed === 'object') {
    if (parsed.syllabus && typeof parsed.syllabus === 'object' && !parsed.subject) {
      parsed = parsed.syllabus;
    }
  }
  return parsed;
}

function validateSyllabusStructure(data: any): { valid: boolean; error?: string } {
  if (!data || typeof data !== 'object' || Array.isArray(data)) {
    return { valid: false, error: 'Root must be a valid JSON object.' };
  }
  if (!data.subject || typeof data.subject !== 'object') {
    return { valid: false, error: 'Missing subject object in response.' };
  }
  if (!Array.isArray(data.units) || data.units.length === 0) {
    return { valid: false, error: 'Syllabus must contain at least one unit in "units" array.' };
  }

  for (let uIdx = 0; uIdx < data.units.length; uIdx++) {
    const unit = data.units[uIdx];
    if (typeof unit !== 'object' || !unit) {
      return { valid: false, error: `Unit at index ${uIdx} is not an object.` };
    }
    if (unit.unitNumber === undefined || unit.unitNumber === null) {
      unit.unitNumber = uIdx + 1;
    }
    if (!unit.title || typeof unit.title !== 'string') {
      return { valid: false, error: `Unit at index ${uIdx} is missing a title string.` };
    }
    if (!Array.isArray(unit.topics) || unit.topics.length === 0) {
      return { valid: false, error: `Unit "${unit.title}" must contain at least one topic.` };
    }

    for (let tIdx = 0; tIdx < unit.topics.length; tIdx++) {
      const topic = unit.topics[tIdx];
      if (typeof topic !== 'object' || !topic) {
        return { valid: false, error: `Topic at index ${tIdx} in unit "${unit.title}" is not an object.` };
      }
      if (!topic.title || typeof topic.title !== 'string') {
        return { valid: false, error: `Topic at index ${tIdx} in unit "${unit.title}" has invalid or missing title.` };
      }
      if (typeof topic.description !== 'string') {
        topic.description = `Curriculum study of ${topic.title}.`;
      }

      // Difficulty validation: only beginner, intermediate, advanced
      const diff = (topic.difficulty || 'intermediate').toString().toLowerCase();
      if (['beginner', 'intermediate', 'advanced'].includes(diff)) {
        topic.difficulty = diff;
      } else {
        topic.difficulty = 'intermediate';
      }

      // estimatedMinutes must be integer
      let est = parseInt(topic.estimatedMinutes, 10);
      if (isNaN(est) || est <= 0) est = 45;
      topic.estimatedMinutes = est;

      // recommendedOrder
      let ro = parseInt(topic.recommendedOrder, 10);
      if (isNaN(ro) || ro <= 0) ro = tIdx + 1;
      topic.recommendedOrder = ro;

      if (!Array.isArray(topic.subtopics)) topic.subtopics = [];
      if (!Array.isArray(topic.prerequisites)) topic.prerequisites = [];
      if (!Array.isArray(topic.learningObjectives)) topic.learningObjectives = [];
      if (!topic.topicNumber || typeof topic.topicNumber !== 'string') {
        topic.topicNumber = `${unit.unitNumber}.${tIdx + 1}`;
      }
    }
  }

  if (!data.analysisMetadata || typeof data.analysisMetadata !== 'object') {
    data.analysisMetadata = {
      confidence: 'high',
      uncertainSections: [],
      notes: [],
    };
  }

  return { valid: true };
}

serve(async (req) => {
  // Handle CORS Preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // 1. Authenticate the User
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({
          success: false,
          error: {
            code: 'UNAUTHORIZED',
            message: 'Authentication header is missing. Please log in to analyze your syllabus.',
          },
        }),
        {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
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
        JSON.stringify({
          success: false,
          error: {
            code: 'UNAUTHORIZED',
            message: 'Invalid or expired user session. Please re-authenticate.',
          },
        }),
        {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // 2. Validate Groq API Key Secret
    const groqApiKey = Deno.env.get('GROQ_API_KEY')?.trim();
    const groqModel = (Deno.env.get('GROQ_MODEL') || 'llama-3.3-70b-versatile').trim();

    if (!groqApiKey) {
      return new Response(
        JSON.stringify({
          success: false,
          error: {
            code: 'MISSING_API_KEY',
            message: 'GROQ_API_KEY is missing from Supabase Edge Function secrets.',
          },
        }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // 3. Receive & Validate Input
    const { syllabusText, fileName, fileType, subjectName, syllabusId } = await req.json();

    if (!syllabusText || typeof syllabusText !== 'string' || syllabusText.trim().length < 20) {
      return new Response(
        JSON.stringify({
          success: false,
          error: {
            code: 'INVALID_INPUT',
            message: 'Unable to analyze the syllabus because no readable syllabus text was provided.',
          },
        }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const userPrompt = `DOCUMENT NAME: ${fileName || 'Syllabus'}
DOCUMENT FORMAT: ${fileType || 'Text'}
${subjectName ? `PROVIDED SUBJECT HINT: ${subjectName}` : ''}

--- EXTRACTED SYLLABUS CONTENT ---
${syllabusText.slice(0, 50000)}
--- END OF SYLLABUS CONTENT ---`;

    // 4. Resolve Active Groq Model
    let activeModel = groqModel;
    try {
      const modelsRes = await fetch('https://api.groq.com/openai/v1/models', {
        headers: { 'Authorization': `Bearer ${groqApiKey}` },
      });
      if (modelsRes.ok) {
        const modelsData = await modelsRes.json();
        const availableIds: string[] = (modelsData.data || []).map((m: any) => m.id);
        console.log('[EdgeFunction analyze-syllabus] Available Groq models for account:', availableIds);

        const validModels = availableIds.filter(
          (id) =>
            !id.includes('specdec') &&
            !id.includes('guard') &&
            !id.includes('whisper') &&
            !id.includes('embedding') &&
            !id.includes('distil')
        );

        const preferredOrder = [
          'llama-3.3-70b-versatile',
          'llama-3.1-8b-instant',
          'mixtral-8x7b-32768',
          'gemma2-9b-it',
          'llama3-70b-8192',
          'llama3-8b-8192',
        ];

        const selected =
          preferredOrder.find((p) => validModels.includes(p)) ||
          validModels.find((id) => id.includes('llama')) ||
          validModels[0];

        if (selected) {
          activeModel = selected;
        }
      }
    } catch (modelErr: any) {
      console.warn('[EdgeFunction analyze-syllabus] Model check warning:', modelErr.message);
    }

    console.log(`[EdgeFunction analyze-syllabus] Calling Groq API with model: ${activeModel}`);

    let groqResponse: Response;
    try {
      groqResponse = await fetch(GROQ_API_URL, {
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
          temperature: 0.1,
          max_tokens: 4096,
          response_format: {
            type: 'json_object',
          },
        }),
      });
    } catch (fetchErr: any) {
      return new Response(
        JSON.stringify({
          success: false,
          error: {
            code: 'NETWORK_ERROR',
            message: `Failed to connect to Groq API: ${fetchErr.message}`,
          },
        }),
        {
          status: 502,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    let rawContent = '';
    if (groqResponse.ok) {
      const groqData = await groqResponse.json();
      rawContent = groqData.choices?.[0]?.message?.content || '';
    } else {
      const errText = await groqResponse.text();
      console.warn(`[EdgeFunction analyze-syllabus] Groq API response (${groqResponse.status}):`, errText);

      // If Groq returned json_validate_failed, capture failed_generation for repair retry
      try {
        const parsedErr = JSON.parse(errText);
        if (parsedErr?.error?.code === 'json_validate_failed' && parsedErr?.error?.failed_generation) {
          rawContent = parsedErr.error.failed_generation;
          console.log('[EdgeFunction analyze-syllabus] Captured failed_generation from Groq to run repair retry.');
        }
      } catch (_) { }

      if (!rawContent) {
        let friendlyMsg = `Groq API request failed (${groqResponse.status}).`;
        if (groqResponse.status === 401) {
          friendlyMsg = 'Invalid Groq API key configured in Supabase Edge Function secrets.';
        } else if (groqResponse.status === 429) {
          friendlyMsg = 'Groq API rate limit reached. Please wait a moment and retry.';
        }

        return new Response(
          JSON.stringify({
            success: false,
            error: {
              code: 'GROQ_API_ERROR',
              message: `${friendlyMsg} Details: ${errText}`,
            },
          }),
          {
            status: groqResponse.status === 429 ? 429 : 502,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          }
        );
      }
    }

    // 5. Parse & Validate Output
    let parsedData: any = null;
    let validationResult = { valid: false, error: 'Empty AI response' };

    try {
      parsedData = parseAndUnwrap(rawContent);
      validationResult = validateSyllabusStructure(parsedData);
    } catch (parseErr: any) {
      console.warn('[EdgeFunction analyze-syllabus] Initial JSON parse failed:', parseErr.message);
      validationResult = { valid: false, error: parseErr.message };
    }

    // 6. ONE Controlled Retry if initial response is malformed
    if (!validationResult.valid || !parsedData) {
      console.log(`[EdgeFunction analyze-syllabus] Attempting 1 controlled JSON repair retry with Groq... Error was: ${validationResult.error}`);
      try {
        const retryResponse = await fetch(GROQ_API_URL, {
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
              { role: 'assistant', content: rawContent },
              {
                role: 'user',
                content:
                  `Your previous response failed JSON validation with error: "${validationResult.error}". Please correct the JSON syntax and hierarchy. Ensure all array elements and objects are strictly separated by commas. Return ONLY the corrected raw JSON matching the required schema.`,
              },
            ],
            temperature: 0.0,
            max_tokens: 4096,
            response_format: {
              type: 'json_object',
            },
          }),
        });

        if (retryResponse.ok) {
          const retryData = await retryResponse.json();
          const retryContent = retryData.choices?.[0]?.message?.content || '';
          try {
            parsedData = parseAndUnwrap(retryContent);
            validationResult = validateSyllabusStructure(parsedData);
          } catch (retryParseErr: any) {
            console.warn('[EdgeFunction analyze-syllabus] Retry JSON parse failed:', retryParseErr.message);
            validationResult = { valid: false, error: retryParseErr.message };
          }
        } else {
          const retryErrText = await retryResponse.text();
          console.warn('[EdgeFunction analyze-syllabus] Retry request failed:', retryResponse.status, retryErrText);
        }
      } catch (retryErr: any) {
        console.error('[EdgeFunction analyze-syllabus] Retry failed:', retryErr.message);
      }
    }

    if (!validationResult.valid || !parsedData) {
      return new Response(
        JSON.stringify({
          success: false,
          error: {
            code: 'INVALID_AI_SCHEMA',
            message: 'Groq returned an invalid syllabus structure. Please retry the analysis.',
            details: validationResult.error,
          },
        }),
        {
          status: 422,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // 7. Fallback subject title if empty
    if (!parsedData.subject.name || parsedData.subject.name.trim() === '') {
      parsedData.subject.name = subjectName || fileName?.replace(/\.[^/.]+$/, '') || 'Curriculum Syllabus';
    }

    // 8. Save the Structured Result to Supabase (User -> Syllabus -> Units -> Topics)
    const supabaseDb = createClient(supabaseUrl, supabaseServiceKey);

    let targetSyllabusId = syllabusId;

    if (targetSyllabusId) {
      const { data: existingSyllabus } = await supabaseDb
        .from('syllabi')
        .select('id, user_id, title')
        .eq('id', targetSyllabusId)
        .eq('user_id', user.id)
        .maybeSingle();

      if (existingSyllabus) {
        await supabaseDb
          .from('syllabi')
          .update({
            title: parsedData.subject.name || existingSyllabus.title,
            code: parsedData.subject.code || 'CS701',
            status: 'analyzed',
            updated_at: new Date().toISOString(),
          })
          .eq('id', targetSyllabusId);
      } else {
        targetSyllabusId = null;
      }
    }

    if (!targetSyllabusId) {
      const { data: newSyllabus, error: createErr } = await supabaseDb
        .from('syllabi')
        .insert({
          user_id: user.id,
          title: parsedData.subject.name || subjectName || fileName || 'Curriculum Syllabus',
          code: parsedData.subject.code || 'CS701',
          university: 'Engineering Curriculum',
          file_name: fileName,
          raw_text: syllabusText,
          file_type: fileType,
          status: 'analyzed',
        })
        .select()
        .single();

      if (createErr) throw createErr;
      targetSyllabusId = newSyllabus.id;
    }

    // PREVENT DUPLICATES: Safely delete existing units for this syllabus before inserting (cascades to topics)
    await supabaseDb.from('units').delete().eq('syllabus_id', targetSyllabusId);

    // Insert structured units & topics
    for (let uIdx = 0; uIdx < parsedData.units.length; uIdx++) {
      const unit = parsedData.units[uIdx];
      const { data: unitRow, error: unitErr } = await supabaseDb
        .from('units')
        .insert({
          syllabus_id: targetSyllabusId,
          name: unit.title,
          description: unit.description || '',
          order_number: typeof unit.unitNumber === 'number' ? unit.unitNumber : uIdx + 1,
        })
        .select()
        .single();

      if (unitErr) throw unitErr;

      if (unit.topics && unit.topics.length > 0) {
        const topicRows = unit.topics.map((t: any, tIdx: number) => ({
          unit_id: unitRow.id,
          name: t.title,
          description: t.description || '',
          difficulty: t.difficulty ? t.difficulty.charAt(0).toUpperCase() + t.difficulty.slice(1).toLowerCase() : 'Intermediate',
          estimated_minutes: t.estimatedMinutes || 45,
          order_number: t.recommendedOrder || tIdx + 1,
          completed: false,
          topic_number: t.topicNumber || `${unit.unitNumber || uIdx + 1}.${tIdx + 1}`,
          subtopics: Array.isArray(t.subtopics) ? t.subtopics : [],
          prerequisites: Array.isArray(t.prerequisites) ? t.prerequisites : [],
          learning_objectives: Array.isArray(t.learningObjectives) ? t.learningObjectives : [],
          recommended_order: t.recommendedOrder || tIdx + 1,
        }));

        const { error: topicErr } = await supabaseDb.from('topics').insert(topicRows);
        if (topicErr) throw topicErr;
      }
    }

    // 9. Return Result to Frontend
    return new Response(
      JSON.stringify({
        success: true,
        data: {
          syllabusId: targetSyllabusId,
          subject: parsedData.subject,
          units: parsedData.units,
          analysisMetadata: parsedData.analysisMetadata,
        },
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error: any) {
    console.error('[EdgeFunction analyze-syllabus] Unhandled error:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: error.message || 'An unexpected error occurred during syllabus analysis.',
        },
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
