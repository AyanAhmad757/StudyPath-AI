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

    const supabaseDb = createClient(supabaseUrl, supabaseServiceKey);
    const body = await req.json();
    const { action, jobId, fileName, storagePath, fileType, fileSize, extractedText, metadata } = body;

    // Action A: Create new background processing job
    if (action === 'create_job') {
      const { data: job, error: jobErr } = await supabaseDb
        .from('learning_jobs')
        .insert({
          user_id: user.id,
          job_type: 'document_processing',
          status: 'pending',
          metadata_json: {
            fileName,
            fileType,
            fileSize,
            storagePath,
          },
        })
        .select()
        .single();

      if (jobErr) throw jobErr;

      return new Response(
        JSON.stringify({ success: true, data: { jobId: job.id, status: job.status } }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Action B: Check job status
    if (action === 'check_status' && jobId) {
      const { data: job, error: checkErr } = await supabaseDb
        .from('learning_jobs')
        .select('*')
        .eq('id', jobId)
        .eq('user_id', user.id)
        .single();

      if (checkErr || !job) {
        return new Response(
          JSON.stringify({ success: false, error: { code: 'NOT_FOUND', message: 'Job not found.' } }),
          { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      return new Response(
        JSON.stringify({ success: true, data: job }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Action C: Register extracted source file
    if (action === 'register_source') {
      const { data: sourceFile, error: fileErr } = await supabaseDb
        .from('source_files')
        .insert({
          user_id: user.id,
          original_filename: fileName || 'Uploaded Document',
          storage_path: storagePath || `uploads/${user.id}/${Date.now()}`,
          file_type: fileType || 'txt',
          file_size: fileSize || 0,
          extraction_status: 'extracted',
          extracted_text: extractedText || '',
          metadata_json: metadata || {},
        })
        .select()
        .single();

      if (fileErr) throw fileErr;

      return new Response(
        JSON.stringify({ success: true, data: sourceFile }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ success: false, error: { code: 'INVALID_ACTION', message: 'Unknown action specified.' } }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (err: any) {
    return new Response(
      JSON.stringify({ success: false, error: { code: 'INTERNAL_ERROR', message: err.message } }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
