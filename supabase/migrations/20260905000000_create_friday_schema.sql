-- ==============================================================================
-- FRIDAY AI - SUPABASE DATABASE SCHEMA MIGRATION
-- Migration: 20260905000000_create_friday_schema.sql
-- Description: Complete schema for Friday AI (Auth Profiles, Syllabi, Units,
--              Topics, Videos, Quizzes, Skills, Career Paths, and Roadmaps).
-- ==============================================================================

-- Enable UUID extension if not already present
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ==============================================================================
-- 1. PROFILES TABLE
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT,
    college TEXT DEFAULT 'National Institute of Technology',
    course TEXT DEFAULT 'B.Tech CSE',
    semester TEXT DEFAULT '6th Semester',
    career_goal TEXT DEFAULT 'Full Stack Developer',
    avatar_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- 2. SYLLABI TABLE
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.syllabi (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    code TEXT,
    university TEXT,
    file_name TEXT,
    file_url TEXT,
    raw_text TEXT,
    status TEXT DEFAULT 'uploaded', -- 'uploaded', 'processing', 'analyzed', 'failed'
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- 3. UNITS TABLE
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.units (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    syllabus_id UUID NOT NULL REFERENCES public.syllabi(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    order_number INTEGER DEFAULT 1,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- 4. TOPICS TABLE
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.topics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    unit_id UUID NOT NULL REFERENCES public.units(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    difficulty TEXT DEFAULT 'Intermediate', -- 'Beginner', 'Intermediate', 'Advanced'
    estimated_minutes INTEGER DEFAULT 45,
    theory TEXT,
    order_number INTEGER DEFAULT 1,
    completed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- 5. VIDEOS TABLE
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.videos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    topic_id UUID NOT NULL REFERENCES public.topics(id) ON DELETE CASCADE,
    youtube_id TEXT,
    title TEXT NOT NULL,
    channel TEXT,
    thumbnail TEXT,
    duration TEXT,
    url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- 6. QUIZZES TABLE
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.quizzes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    topic_id UUID NOT NULL REFERENCES public.topics(id) ON DELETE CASCADE,
    question TEXT NOT NULL,
    option_a TEXT NOT NULL,
    option_b TEXT NOT NULL,
    option_c TEXT NOT NULL,
    option_d TEXT NOT NULL,
    correct_answer TEXT NOT NULL, -- 'A', 'B', 'C', 'D'
    explanation TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- 7. QUIZ ATTEMPTS TABLE
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.quiz_attempts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    topic_id UUID NOT NULL REFERENCES public.topics(id) ON DELETE CASCADE,
    score INTEGER NOT NULL DEFAULT 0,
    total_questions INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- 8. SKILLS TABLE (Shared / Standard Catalog)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.skills (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT UNIQUE NOT NULL,
    category TEXT NOT NULL, -- 'Frontend Core', 'Backend & Runtime', 'Databases & Cloud', 'CS Foundations'
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- 9. USER SKILLS TABLE (Student Proficiency Ratings)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.user_skills (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    skill_id UUID NOT NULL REFERENCES public.skills(id) ON DELETE CASCADE,
    level INTEGER DEFAULT 0 CHECK (level >= 0 AND level <= 3), -- 0: Never Used, 1: Beginner, 2: Intermediate, 3: Advanced
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT user_skill_unique UNIQUE (user_id, skill_id)
);

-- ==============================================================================
-- 10. CAREER PATHS TABLE (Shared Catalog)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.career_paths (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    slug TEXT UNIQUE,
    description TEXT,
    icon TEXT,
    salary_range TEXT,
    badge TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- 11. ROADMAPS TABLE
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.roadmaps (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    career_id UUID REFERENCES public.career_paths(id) ON DELETE SET NULL,
    title TEXT NOT NULL,
    description TEXT,
    overall_progress INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- 12. ROADMAP STEPS TABLE
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.roadmap_steps (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    roadmap_id UUID NOT NULL REFERENCES public.roadmaps(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    order_number INTEGER DEFAULT 1,
    status TEXT DEFAULT 'locked', -- 'completed', 'in_progress', 'locked'
    progress INTEGER DEFAULT 0,
    completed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- INDEXES FOR HIGH-PERFORMANCE QUERYING
-- ==============================================================================
CREATE INDEX IF NOT EXISTS idx_syllabi_user_id ON public.syllabi(user_id);
CREATE INDEX IF NOT EXISTS idx_syllabi_created_at ON public.syllabi(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_units_syllabus_id ON public.units(syllabus_id);
CREATE INDEX IF NOT EXISTS idx_topics_unit_id ON public.topics(unit_id);
CREATE INDEX IF NOT EXISTS idx_topics_completed ON public.topics(completed);
CREATE INDEX IF NOT EXISTS idx_videos_topic_id ON public.videos(topic_id);
CREATE INDEX IF NOT EXISTS idx_quizzes_topic_id ON public.quizzes(topic_id);
CREATE INDEX IF NOT EXISTS idx_quiz_attempts_user_id ON public.quiz_attempts(user_id);
CREATE INDEX IF NOT EXISTS idx_quiz_attempts_topic_id ON public.quiz_attempts(topic_id);
CREATE INDEX IF NOT EXISTS idx_user_skills_user_id ON public.user_skills(user_id);
CREATE INDEX IF NOT EXISTS idx_user_skills_skill_id ON public.user_skills(skill_id);
CREATE INDEX IF NOT EXISTS idx_roadmaps_user_id ON public.roadmaps(user_id);
CREATE INDEX IF NOT EXISTS idx_roadmaps_career_id ON public.roadmaps(career_id);
CREATE INDEX IF NOT EXISTS idx_roadmap_steps_roadmap_id ON public.roadmap_steps(roadmap_id);

-- ==============================================================================
-- AUTOMATIC PROFILE CREATION TRIGGER ON AUTH SIGNUP
-- ==============================================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (
        id,
        full_name,
        college,
        course,
        semester,
        career_goal,
        avatar_url,
        created_at,
        updated_at
    )
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', 'Student User'),
        COALESCE(NEW.raw_user_meta_data->>'college', 'National Institute of Technology'),
        COALESCE(NEW.raw_user_meta_data->>'course', 'B.Tech CSE'),
        COALESCE(NEW.raw_user_meta_data->>'semester', '6th Semester'),
        COALESCE(NEW.raw_user_meta_data->>'career_goal', 'Full Stack Developer'),
        COALESCE(NEW.raw_user_meta_data->>'avatar_url', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80'),
        NOW(),
        NOW()
    )
    ON CONFLICT (id) DO NOTHING;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.syllabi ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.units ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.topics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.videos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quizzes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.career_paths ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.roadmaps ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.roadmap_steps ENABLE ROW LEVEL SECURITY;

-- 1. Profiles Policies
CREATE POLICY "Users can view their own profile"
    ON public.profiles FOR SELECT
    USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
    ON public.profiles FOR UPDATE
    USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile"
    ON public.profiles FOR INSERT
    WITH CHECK (auth.uid() = id);

-- 2. Syllabi Policies
CREATE POLICY "Users can view their own syllabi"
    ON public.syllabi FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own syllabi"
    ON public.syllabi FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own syllabi"
    ON public.syllabi FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own syllabi"
    ON public.syllabi FOR DELETE
    USING (auth.uid() = user_id);

-- 3. Units Policies (Checked via syllabus ownership)
CREATE POLICY "Users can view units from their own syllabi"
    ON public.units FOR SELECT
    USING (EXISTS (
        SELECT 1 FROM public.syllabi s
        WHERE s.id = public.units.syllabus_id AND s.user_id = auth.uid()
    ));

CREATE POLICY "Users can insert units to their own syllabi"
    ON public.units FOR INSERT
    WITH CHECK (EXISTS (
        SELECT 1 FROM public.syllabi s
        WHERE s.id = public.units.syllabus_id AND s.user_id = auth.uid()
    ));

CREATE POLICY "Users can update units in their own syllabi"
    ON public.units FOR UPDATE
    USING (EXISTS (
        SELECT 1 FROM public.syllabi s
        WHERE s.id = public.units.syllabus_id AND s.user_id = auth.uid()
    ));

CREATE POLICY "Users can delete units from their own syllabi"
    ON public.units FOR DELETE
    USING (EXISTS (
        SELECT 1 FROM public.syllabi s
        WHERE s.id = public.units.syllabus_id AND s.user_id = auth.uid()
    ));

-- 4. Topics Policies (Checked via unit -> syllabus ownership)
CREATE POLICY "Users can view topics from their own units"
    ON public.topics FOR SELECT
    USING (EXISTS (
        SELECT 1 FROM public.units u
        JOIN public.syllabi s ON s.id = u.syllabus_id
        WHERE u.id = public.topics.unit_id AND s.user_id = auth.uid()
    ));

CREATE POLICY "Users can insert topics to their own units"
    ON public.topics FOR INSERT
    WITH CHECK (EXISTS (
        SELECT 1 FROM public.units u
        JOIN public.syllabi s ON s.id = u.syllabus_id
        WHERE u.id = public.topics.unit_id AND s.user_id = auth.uid()
    ));

CREATE POLICY "Users can update topics in their own units"
    ON public.topics FOR UPDATE
    USING (EXISTS (
        SELECT 1 FROM public.units u
        JOIN public.syllabi s ON s.id = u.syllabus_id
        WHERE u.id = public.topics.unit_id AND s.user_id = auth.uid()
    ));

CREATE POLICY "Users can delete topics from their own units"
    ON public.topics FOR DELETE
    USING (EXISTS (
        SELECT 1 FROM public.units u
        JOIN public.syllabi s ON s.id = u.syllabus_id
        WHERE u.id = public.topics.unit_id AND s.user_id = auth.uid()
    ));

-- 5. Videos Policies (Checked via topic ownership)
CREATE POLICY "Users can view videos from their own topics"
    ON public.videos FOR SELECT
    USING (EXISTS (
        SELECT 1 FROM public.topics t
        JOIN public.units u ON u.id = t.unit_id
        JOIN public.syllabi s ON s.id = u.syllabus_id
        WHERE t.id = public.videos.topic_id AND s.user_id = auth.uid()
    ));

CREATE POLICY "Users can manage videos for their own topics"
    ON public.videos FOR ALL
    USING (EXISTS (
        SELECT 1 FROM public.topics t
        JOIN public.units u ON u.id = t.unit_id
        JOIN public.syllabi s ON s.id = u.syllabus_id
        WHERE t.id = public.videos.topic_id AND s.user_id = auth.uid()
    ));

-- 6. Quizzes Policies
CREATE POLICY "Users can view quizzes for their topics"
    ON public.quizzes FOR SELECT
    USING (EXISTS (
        SELECT 1 FROM public.topics t
        JOIN public.units u ON u.id = t.unit_id
        JOIN public.syllabi s ON s.id = u.syllabus_id
        WHERE t.id = public.quizzes.topic_id AND s.user_id = auth.uid()
    ));

-- 7. Quiz Attempts Policies
CREATE POLICY "Users can view their own quiz attempts"
    ON public.quiz_attempts FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can submit their own quiz attempts"
    ON public.quiz_attempts FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- 8. Skills Policies (Public catalog)
CREATE POLICY "Anyone can view skills catalog"
    ON public.skills FOR SELECT
    USING (true);

-- 9. User Skills Policies
CREATE POLICY "Users can view their own skills"
    ON public.user_skills FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own skills"
    ON public.user_skills FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own skills"
    ON public.user_skills FOR UPDATE
    USING (auth.uid() = user_id);

-- 10. Career Paths Policies (Public catalog)
CREATE POLICY "Anyone can view career paths"
    ON public.career_paths FOR SELECT
    USING (true);

-- 11. Roadmaps Policies
CREATE POLICY "Users can view their own roadmaps"
    ON public.roadmaps FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own roadmaps"
    ON public.roadmaps FOR ALL
    USING (auth.uid() = user_id);

-- 12. Roadmap Steps Policies
CREATE POLICY "Users can view steps from their own roadmaps"
    ON public.roadmap_steps FOR SELECT
    USING (EXISTS (
        SELECT 1 FROM public.roadmaps r
        WHERE r.id = public.roadmap_steps.roadmap_id AND r.user_id = auth.uid()
    ));

CREATE POLICY "Users can manage steps for their own roadmaps"
    ON public.roadmap_steps FOR ALL
    USING (EXISTS (
        SELECT 1 FROM public.roadmaps r
        WHERE r.id = public.roadmap_steps.roadmap_id AND r.user_id = auth.uid()
    ));

-- ==============================================================================
-- STORAGE BUCKET: syllabus-files & POLICIES
-- ==============================================================================
-- Insert the bucket into storage.buckets if it does not already exist
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'syllabus-files',
    'syllabus-files',
    false,
    10485760, -- 10MB
    ARRAY['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/msword', 'text/plain']
)
ON CONFLICT (id) DO NOTHING;

-- Storage RLS: Users can access and upload only inside their own user folder: <user_id>/...
CREATE POLICY "Users can upload syllabus files into their folder"
    ON storage.objects FOR INSERT
    WITH CHECK (
        bucket_id = 'syllabus-files' AND
        (storage.foldername(name))[1] = auth.uid()::text
    );

CREATE POLICY "Users can view their own syllabus files"
    ON storage.objects FOR SELECT
    USING (
        bucket_id = 'syllabus-files' AND
        (storage.foldername(name))[1] = auth.uid()::text
    );

CREATE POLICY "Users can delete their own syllabus files"
    ON storage.objects FOR DELETE
    USING (
        bucket_id = 'syllabus-files' AND
        (storage.foldername(name))[1] = auth.uid()::text
    );
