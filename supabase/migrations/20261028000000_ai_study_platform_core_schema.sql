-- ==============================================================================
-- AI STUDY PLATFORM - CORE POSTGRESQL SCHEMA MIGRATION
-- Migration: 20261028000000_ai_study_platform_core_schema.sql
-- Description: Complete schema according to Section 12 & 13 of Master Specification:
--   profiles, source_files, courses, units, topics, lessons, quiz_questions,
--   quiz_attempts, topic_progress, video_resources, learning_jobs,
--   Row Level Security policies, indexes, and storage configuration.
-- ==============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ==============================================================================
-- 1. PROFILES TABLE
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    display_name TEXT,
    full_name TEXT,
    college TEXT,
    course TEXT,
    semester TEXT,
    avatar_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- 2. SOURCE FILES TABLE
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.source_files (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    original_filename TEXT NOT NULL,
    storage_path TEXT NOT NULL,
    file_type TEXT NOT NULL, -- 'pdf', 'docx', 'txt', 'png', 'jpg', 'jpeg', 'webp'
    file_size BIGINT NOT NULL,
    extraction_status TEXT DEFAULT 'pending' CHECK (extraction_status IN ('pending', 'processing', 'extracted', 'ocr_processed', 'failed', 'uncertain')),
    extracted_text TEXT,
    metadata_json JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- 3. COURSES TABLE
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.courses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    code TEXT,
    description TEXT,
    source_file_id UUID REFERENCES public.source_files(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- 4. UNITS TABLE
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.units (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE,
    title TEXT,
    position INTEGER NOT NULL DEFAULT 1,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE public.units ADD COLUMN IF NOT EXISTS course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE;
ALTER TABLE public.units ADD COLUMN IF NOT EXISTS title TEXT;
ALTER TABLE public.units ADD COLUMN IF NOT EXISTS position INTEGER NOT NULL DEFAULT 1;

-- ==============================================================================
-- 5. TOPICS TABLE
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.topics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    unit_id UUID REFERENCES public.units(id) ON DELETE CASCADE, -- Nullable for standalone topics
    parent_topic_id UUID REFERENCES public.topics(id) ON DELETE SET NULL, -- Nested subtopics
    title TEXT,
    position INTEGER NOT NULL DEFAULT 1,
    difficulty TEXT DEFAULT 'intermediate',
    estimated_minutes INTEGER DEFAULT 45,
    description TEXT,
    learning_objectives TEXT[] DEFAULT '{}',
    prerequisites TEXT[] DEFAULT '{}',
    subtopics TEXT[] DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE public.topics ADD COLUMN IF NOT EXISTS parent_topic_id UUID REFERENCES public.topics(id) ON DELETE SET NULL;
ALTER TABLE public.topics ADD COLUMN IF NOT EXISTS title TEXT;
ALTER TABLE public.topics ADD COLUMN IF NOT EXISTS position INTEGER NOT NULL DEFAULT 1;

-- ==============================================================================
-- 6. LESSONS TABLE
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.lessons (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE, -- Nullable for standalone lessons
    topic_id UUID REFERENCES public.topics(id) ON DELETE CASCADE, -- Nullable for topic-less standalone lessons
    source_file_id UUID REFERENCES public.source_files(id) ON DELETE SET NULL,
    title TEXT NOT NULL,
    content_json JSONB NOT NULL,
    learning_level TEXT DEFAULT 'intermediate' CHECK (learning_level IN ('beginner', 'intermediate', 'advanced')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- 7. QUIZ QUESTIONS TABLE
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.quiz_questions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lesson_id UUID NOT NULL REFERENCES public.lessons(id) ON DELETE CASCADE,
    question_json JSONB NOT NULL,
    position INTEGER NOT NULL DEFAULT 1,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- 8. QUIZ ATTEMPTS TABLE
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.quiz_attempts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    lesson_id UUID REFERENCES public.lessons(id) ON DELETE CASCADE,
    answers_json JSONB DEFAULT '{}'::jsonb,
    score INTEGER NOT NULL DEFAULT 0,
    total_questions INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE public.quiz_attempts ADD COLUMN IF NOT EXISTS lesson_id UUID REFERENCES public.lessons(id) ON DELETE CASCADE;
ALTER TABLE public.quiz_attempts ADD COLUMN IF NOT EXISTS answers_json JSONB DEFAULT '{}'::jsonb;

-- ==============================================================================
-- 9. TOPIC PROGRESS TABLE
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.topic_progress (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    topic_id UUID NOT NULL REFERENCES public.topics(id) ON DELETE CASCADE,
    status TEXT NOT NULL DEFAULT 'not_started' CHECK (status IN ('not_started', 'in_progress', 'completed', 'needs_revision')),
    last_studied_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT unique_user_topic_progress UNIQUE (user_id, topic_id)
);

-- ==============================================================================
-- 10. VIDEO RESOURCES TABLE
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.video_resources (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lesson_id UUID NOT NULL REFERENCES public.lessons(id) ON DELETE CASCADE,
    video_id TEXT NOT NULL,
    title TEXT NOT NULL,
    channel_title TEXT NOT NULL,
    thumbnail_url TEXT,
    url TEXT NOT NULL,
    relevance_explanation TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- 11. LEARNING JOBS TABLE (Async Document & AI Processing)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.learning_jobs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    job_type TEXT NOT NULL CHECK (job_type IN ('document_processing', 'syllabus_analysis', 'lesson_generation', 'quiz_generation')),
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
    metadata_json JSONB DEFAULT '{}'::jsonb,
    error_message TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- INDEXES FOR MAXIMUM QUERY PERFORMANCE
-- ==============================================================================
CREATE INDEX IF NOT EXISTS idx_source_files_user_id ON public.source_files(user_id);
CREATE INDEX IF NOT EXISTS idx_courses_user_id ON public.courses(user_id);
CREATE INDEX IF NOT EXISTS idx_units_course_id ON public.units(course_id);
CREATE INDEX IF NOT EXISTS idx_units_position ON public.units(course_id, position);
CREATE INDEX IF NOT EXISTS idx_topics_unit_id ON public.topics(unit_id);
CREATE INDEX IF NOT EXISTS idx_topics_parent_topic_id ON public.topics(parent_topic_id);
CREATE INDEX IF NOT EXISTS idx_topics_position ON public.topics(unit_id, position);
CREATE INDEX IF NOT EXISTS idx_lessons_user_id ON public.lessons(user_id);
CREATE INDEX IF NOT EXISTS idx_lessons_course_id ON public.lessons(course_id);
CREATE INDEX IF NOT EXISTS idx_lessons_topic_id ON public.lessons(topic_id);
CREATE INDEX IF NOT EXISTS idx_quiz_questions_lesson_id ON public.quiz_questions(lesson_id);
CREATE INDEX IF NOT EXISTS idx_quiz_attempts_user_id ON public.quiz_attempts(user_id);
CREATE INDEX IF NOT EXISTS idx_quiz_attempts_lesson_id ON public.quiz_attempts(lesson_id);
CREATE INDEX IF NOT EXISTS idx_topic_progress_user_id ON public.topic_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_topic_progress_topic_id ON public.topic_progress(topic_id);
CREATE INDEX IF NOT EXISTS idx_video_resources_lesson_id ON public.video_resources(lesson_id);
CREATE INDEX IF NOT EXISTS idx_learning_jobs_user_id ON public.learning_jobs(user_id);
CREATE INDEX IF NOT EXISTS idx_learning_jobs_status ON public.learning_jobs(status);

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.source_files ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.units ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.topics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.topic_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.video_resources ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.learning_jobs ENABLE ROW LEVEL SECURITY;

-- 1. PROFILES POLICIES
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
CREATE POLICY "Users can view their own profile"
    ON public.profiles FOR SELECT
    USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
CREATE POLICY "Users can update their own profile"
    ON public.profiles FOR UPDATE
    USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
CREATE POLICY "Users can insert their own profile"
    ON public.profiles FOR INSERT
    WITH CHECK (auth.uid() = id);

-- 2. SOURCE FILES POLICIES
DROP POLICY IF EXISTS "Users can manage their own source files" ON public.source_files;
CREATE POLICY "Users can manage their own source files"
    ON public.source_files FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- 3. COURSES POLICIES
DROP POLICY IF EXISTS "Users can manage their own courses" ON public.courses;
CREATE POLICY "Users can manage their own courses"
    ON public.courses FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- 4. UNITS POLICIES (Enforce course ownership)
DROP POLICY IF EXISTS "Users can view units of their own courses" ON public.units;
CREATE POLICY "Users can view units of their own courses"
    ON public.units FOR SELECT
    USING (
        course_id IS NULL OR
        EXISTS (
            SELECT 1 FROM public.courses
            WHERE courses.id = units.course_id
              AND courses.user_id = auth.uid()
        )
    );

DROP POLICY IF EXISTS "Users can modify units of their own courses" ON public.units;
CREATE POLICY "Users can modify units of their own courses"
    ON public.units FOR INSERT
    WITH CHECK (
        course_id IS NULL OR
        EXISTS (
            SELECT 1 FROM public.courses
            WHERE courses.id = units.course_id
              AND courses.user_id = auth.uid()
        )
    );

DROP POLICY IF EXISTS "Users can update units of their own courses" ON public.units;
CREATE POLICY "Users can update units of their own courses"
    ON public.units FOR UPDATE
    USING (
        course_id IS NULL OR
        EXISTS (
            SELECT 1 FROM public.courses
            WHERE courses.id = units.course_id
              AND courses.user_id = auth.uid()
        )
    );

DROP POLICY IF EXISTS "Users can delete units of their own courses" ON public.units;
CREATE POLICY "Users can delete units of their own courses"
    ON public.units FOR DELETE
    USING (
        course_id IS NULL OR
        EXISTS (
            SELECT 1 FROM public.courses
            WHERE courses.id = units.course_id
              AND courses.user_id = auth.uid()
        )
    );

-- 5. TOPICS POLICIES (Enforce course ownership via unit OR standalone)
DROP POLICY IF EXISTS "Users can view topics of their own courses" ON public.topics;
CREATE POLICY "Users can view topics of their own courses"
    ON public.topics FOR SELECT
    USING (
        unit_id IS NULL OR
        EXISTS (
            SELECT 1 FROM public.units
            JOIN public.courses ON courses.id = units.course_id
            WHERE units.id = topics.unit_id
              AND courses.user_id = auth.uid()
        )
    );

DROP POLICY IF EXISTS "Users can insert topics in their own courses" ON public.topics;
CREATE POLICY "Users can insert topics in their own courses"
    ON public.topics FOR INSERT
    WITH CHECK (
        unit_id IS NULL OR
        EXISTS (
            SELECT 1 FROM public.units
            JOIN public.courses ON courses.id = units.course_id
            WHERE units.id = topics.unit_id
              AND courses.user_id = auth.uid()
        )
    );

DROP POLICY IF EXISTS "Users can update topics in their own courses" ON public.topics;
CREATE POLICY "Users can update topics in their own courses"
    ON public.topics FOR UPDATE
    USING (
        unit_id IS NULL OR
        EXISTS (
            SELECT 1 FROM public.units
            JOIN public.courses ON courses.id = units.course_id
            WHERE units.id = topics.unit_id
              AND courses.user_id = auth.uid()
        )
    );

DROP POLICY IF EXISTS "Users can delete topics in their own courses" ON public.topics;
CREATE POLICY "Users can delete topics in their own courses"
    ON public.topics FOR DELETE
    USING (
        unit_id IS NULL OR
        EXISTS (
            SELECT 1 FROM public.units
            JOIN public.courses ON courses.id = units.course_id
            WHERE units.id = topics.unit_id
              AND courses.user_id = auth.uid()
        )
    );

-- 6. LESSONS POLICIES
DROP POLICY IF EXISTS "Users can manage their own lessons" ON public.lessons;
CREATE POLICY "Users can manage their own lessons"
    ON public.lessons FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- 7. QUIZ QUESTIONS POLICIES (Enforce lesson ownership)
DROP POLICY IF EXISTS "Users can view quiz questions for their lessons" ON public.quiz_questions;
CREATE POLICY "Users can view quiz questions for their lessons"
    ON public.quiz_questions FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.lessons
            WHERE lessons.id = quiz_questions.lesson_id
              AND lessons.user_id = auth.uid()
        )
    );

DROP POLICY IF EXISTS "Users can manage quiz questions for their lessons" ON public.quiz_questions;
CREATE POLICY "Users can manage quiz questions for their lessons"
    ON public.quiz_questions FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.lessons
            WHERE lessons.id = quiz_questions.lesson_id
              AND lessons.user_id = auth.uid()
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.lessons
            WHERE lessons.id = quiz_questions.lesson_id
              AND lessons.user_id = auth.uid()
        )
    );

-- 8. QUIZ ATTEMPTS POLICIES
DROP POLICY IF EXISTS "Users can manage their own quiz attempts" ON public.quiz_attempts;
CREATE POLICY "Users can manage their own quiz attempts"
    ON public.quiz_attempts FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- 9. TOPIC PROGRESS POLICIES
DROP POLICY IF EXISTS "Users can manage their own topic progress" ON public.topic_progress;
CREATE POLICY "Users can manage their own topic progress"
    ON public.topic_progress FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- 10. VIDEO RESOURCES POLICIES
DROP POLICY IF EXISTS "Users can view video resources for their lessons" ON public.video_resources;
CREATE POLICY "Users can view video resources for their lessons"
    ON public.video_resources FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.lessons
            WHERE lessons.id = video_resources.lesson_id
              AND lessons.user_id = auth.uid()
        )
    );

DROP POLICY IF EXISTS "Users can insert video resources for their lessons" ON public.video_resources;
CREATE POLICY "Users can insert video resources for their lessons"
    ON public.video_resources FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.lessons
            WHERE lessons.id = video_resources.lesson_id
              AND lessons.user_id = auth.uid()
        )
    );

-- 11. LEARNING JOBS POLICIES
DROP POLICY IF EXISTS "Users can manage their own learning jobs" ON public.learning_jobs;
CREATE POLICY "Users can manage their own learning jobs"
    ON public.learning_jobs FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- ==============================================================================
-- STORAGE CONFIGURATION (Supabase Storage: study-materials private bucket)
-- ==============================================================================
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'study-materials',
    'study-materials',
    false,
    10485760, -- 10 MB limit
    ARRAY[
        'application/pdf',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/msword',
        'text/plain',
        'image/png',
        'image/jpeg',
        'image/jpg',
        'image/webp'
    ]
)
ON CONFLICT (id) DO UPDATE SET
    public = false,
    file_size_limit = 10485760,
    allowed_mime_types = ARRAY[
        'application/pdf',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/msword',
        'text/plain',
        'image/png',
        'image/jpeg',
        'image/jpg',
        'image/webp'
    ];

-- Storage Policies: authenticated user can only access folder matching auth.uid()
DROP POLICY IF EXISTS "Students can upload their own study materials" ON storage.objects;
CREATE POLICY "Students can upload their own study materials"
    ON storage.objects FOR INSERT
    TO authenticated
    WITH CHECK (
        bucket_id = 'study-materials' AND
        (storage.foldername(name))[1] = auth.uid()::text
    );

DROP POLICY IF EXISTS "Students can view their own study materials" ON storage.objects;
CREATE POLICY "Students can view their own study materials"
    ON storage.objects FOR SELECT
    TO authenticated
    USING (
        bucket_id = 'study-materials' AND
        (storage.foldername(name))[1] = auth.uid()::text
    );

DROP POLICY IF EXISTS "Students can update their own study materials" ON storage.objects;
CREATE POLICY "Students can update their own study materials"
    ON storage.objects FOR UPDATE
    TO authenticated
    USING (
        bucket_id = 'study-materials' AND
        (storage.foldername(name))[1] = auth.uid()::text
    );

DROP POLICY IF EXISTS "Students can delete their own study materials" ON storage.objects;
CREATE POLICY "Students can delete their own study materials"
    ON storage.objects FOR DELETE
    TO authenticated
    USING (
        bucket_id = 'study-materials' AND
        (storage.foldername(name))[1] = auth.uid()::text
    );
