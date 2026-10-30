import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

const envText = fs.readFileSync('.env', 'utf-8');
const env = {};
envText.split('\n').forEach(line => {
  const [k, ...v] = line.trim().split('=');
  if (k && v.length) env[k.trim()] = v.join('=').trim();
});

const supabase = createClient(env.VITE_SUPABASE_URL, env.VITE_SUPABASE_ANON_KEY);

async function run() {
  console.log('Connecting to:', env.VITE_SUPABASE_URL);
  const { data: syllabi, error: sErr } = await supabase.from('syllabi').select('id, title').limit(3);
  console.log('syllabi:', { syllabi, sErr });

  const { data: courses, error: cErr } = await supabase.from('courses').select('id, title').limit(3);
  console.log('courses:', { courses, cErr });

  const { data: lessons, error: lErr } = await supabase.from('lessons').select('id, title').limit(3);
  console.log('lessons:', { lessons, lErr });
}

run().catch(console.error);
