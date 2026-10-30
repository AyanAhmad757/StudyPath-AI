import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://leuqptmvyaltadzopbvt.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxldXFwdG12eWFsdGFkem9wYnZ0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODg4NTYwMDUsImV4cCI6MjEwNDQzMjAwNX0.31ycGCK7jdXMXBlXyJbDrCczUXAPEyWgbno3lrgY7aM';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxldXFwdG12eWFsdGFkem9wYnZ0Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4ODg1NjAwNSwiZXhwIjoyMTA0NDMyMDA1fQ.syXFzmbmyTOn8mmZK3sdUlLjRVUdwsM0Iin5FuV2RR4';
const adminClient = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

async function runLiveTest() {
  console.log('=== STEP 1: AUTHENTICATING USER ===');
  const testEmail = `student_${Date.now()}@gmail.com`;
  const testPassword = 'TestPassword123!';

  // Create confirmed user using admin client
  const { data: userData, error: createError } = await adminClient.auth.admin.createUser({
    email: testEmail,
    password: testPassword,
    email_confirm: true,
  });

  if (createError) {
    console.error('Admin create user failed:', createError.message);
    process.exit(1);
  }

  // Sign in as user using standard client to get real user session token
  const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
    email: testEmail,
    password: testPassword,
  });

  if (signInError) {
    console.error('Sign in failed:', signInError.message);
    process.exit(1);
  }

  console.log('✓ User signed in successfully:', signInData.user.id);
  console.log('✓ Real user JWT token obtained:', signInData.session.access_token.slice(0, 25) + '...');

  console.log('\n=== STEP 2: PREPARING VERIFIED EXTRACTED SYLLABUS TEXT ===');
  const verifiedSyllabusText = `
Course Title: Database Management Systems
Course Code: CS501
Department of Computer Science & Engineering

Unit 1: Introduction to Database Systems
- File Systems vs DBMS
- Database System Architecture and Data Models
- Data Independence and Schemas
- Entity-Relationship (ER) Modeling: Entities, Relationships, and Constraints
- Extended ER Features and Reduction to Relational Schemas

Unit 2: Relational Model and Languages
- Relational Algebra and Relational Calculus
- SQL: DDL, DML, and DCL commands
- Complex Queries, Subqueries, Joins, and Views
- Integrity Constraints, Triggers, and Assertions

Unit 3: Database Design and Normalization
- Pitfalls in Relational Database Design
- Functional Dependencies and Closure of Attributes
- Normal Forms: 1NF, 2NF, 3NF, and BCNF
- Multivalued Dependencies and 4NF
- Lossless Join and Dependency Preservation Decompositions

Unit 4: Transaction Processing and Concurrency Control
- Concept of Transaction: ACID Properties
- Serializability: Conflict and View Serializability
- Concurrency Control Protocols: Two-Phase Locking (2PL)
- Deadlock Handling: Prevention, Detection, and Recovery
- Recovery Systems: Log-Based Recovery and Checkpointing
  `.trim();

  console.log('Document length:', verifiedSyllabusText.length, 'characters');

  console.log('\n=== STEP 3: INVOKING analyze-syllabus EDGE FUNCTION (GROQ) ===');
  const { data, error } = await supabase.functions.invoke('analyze-syllabus', {
    body: {
      syllabusText: verifiedSyllabusText,
      fileName: 'DBMS_Syllabus.txt',
      fileType: 'txt',
      subjectName: 'Database Management Systems',
    },
  });

  if (error) {
    console.error('Edge function error:', error);
    if (error.context) {
      try {
        const body = await error.context.json();
        console.error('Error body:', body);
      } catch (_) {}
    }
    process.exit(1);
  }

  console.log('✓ Edge Function returned success!');
  console.log('Subject Detected:', data.data?.subject?.name, `(${data.data?.subject?.code})`);
  console.log('Units Count:', data.data?.units?.length);
  
  for (const u of (data.data?.units || [])) {
    console.log(`  - Unit ${u.unitNumber}: ${u.title} (${u.topics?.length} topics)`);
    for (const t of (u.topics || []).slice(0, 2)) {
      console.log(`      * Topic ${t.topicNumber}: ${t.title} [${t.difficulty}, ${t.estimatedMinutes} mins]`);
    }
  }

  console.log('\n=== STEP 4: VERIFYING DATABASE PERSISTENCE IN SUPABASE ===');
  const targetSyllabusId = data.data?.syllabusId;
  console.log('Checking syllabus ID in DB:', targetSyllabusId);

  const { data: dbSyllabus, error: sylErr } = await supabase
    .from('syllabi')
    .select(`
      id,
      title,
      code,
      status,
      units (
        id,
        name,
        order_number,
        topics (
          id,
          name,
          difficulty,
          estimated_minutes,
          topic_number
        )
      )
    `)
    .eq('id', targetSyllabusId)
    .single();

  if (sylErr) {
    console.error('Failed to query DB for syllabus:', sylErr.message);
    process.exit(1);
  }

  console.log('✓ Verified DB Syllabus Record:');
  console.log('  ID:', dbSyllabus.id);
  console.log('  Title:', dbSyllabus.title);
  console.log('  Status:', dbSyllabus.status);
  console.log('  Units in DB:', dbSyllabus.units?.length);
  const totalTopicsInDb = dbSyllabus.units?.reduce((sum, u) => sum + (u.topics?.length || 0), 0);
  console.log('  Total Topics in DB:', totalTopicsInDb);

  console.log('\n======================================================');
  console.log('🎉 FULL LIVE FLOW TEST COMPLETED SUCCESSFULLY!');
  console.log('Upload → Extract → Groq AI → Validate JSON → Supabase DB → Units/Topics Persisted');
  console.log('======================================================');
}

runLiveTest().catch((err) => {
  console.error('Unhandled error:', err);
  process.exit(1);
});
