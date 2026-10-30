# StudyPath AI — AI Study Platform

A production-grade, responsive AI-powered learning platform that turns university academic syllabi, single topics, lecture slides, and study documents into complete structured mastery experiences.

Built with **React**, **Vite**, **TypeScript/JavaScript**, **Tailwind CSS**, and **Supabase**.

---

## 1. Product Architecture & Dual Learning Modes

### Mode A: Complete Syllabus Learning
- **Multi-Format Extraction:** Upload university course syllabi in PDF, Word DOCX, plain text, or scanned images (PNG, JPG, WEBP). Text-based PDFs preserve visual reading order, and image-based/scanned documents automatically invoke Tesseract OCR.
- **AI Curriculum Hierarchy:** The server-side AI decomposes raw syllabus text into subject metadata, units, topics, subtopics, and prerequisites, validated with strict Zod schemas and automated repair retries.
- **Editable Curriculum Tree:** Students review the extracted curriculum structure, add, edit, delete, or reorder topics, and persist the confirmed syllabus to Supabase.
- **On-Demand Lesson Generation:** Structured 16-section lessons are generated on demand as students study topic-by-topic.
- **Course Telemetry:** Tracks topic completion statuses and automatically calculates overall course progress.

### Mode B: Individual Topic and Document Learning ("Learn Anything")
- **Instant Learning Entry Point:** Students can enter any topic name directly or upload single study documents (notes, slides, textbook pages).
- **Grounded Lesson Generation:** If a document is attached, factual explanations are strictly grounded in that material with source coverage notes; if typed, the lesson is generated from academic curriculum standards.
- **Standalone Library:** Lessons can be saved, searched, and reopened independently of any course structure.

### Shared AI Teaching Engine (16-Section Lesson Format)
1. Lesson Title & Learning Objectives
2. Prerequisites
3. Simple Introduction & Intuition
4. Step-by-Step Detailed Analysis
5. Key Definitions & Concepts
6. Worked Examples with Solutions & Explanations
7. Equations, Formulas & Diagram Descriptions
8. Key Summary Points
9. High-Density Revision Notes
10. Analytical Practice Questions
11. Multiple-Choice Quiz Questions
12. Pedagogical Explanations for all answers
13. Recommended Next Topics
14. Uncertainty & Source Coverage Notes
15. **Interactive AI Doubt Solver:** Context-aware Q&A grounded in the lesson and source material.
16. **Verified YouTube Lecture Discovery:** Real video search using YouTube Data API v3 (cached in Supabase, zero fake recommendations).
17. **Deterministic Quiz Player:** Instant client/server evaluation, confetti on mastery, and revision tracking.

---

## 2. Directory Structure

```
d:/projects/7th sem project/
├── src/
│   ├── app/
│   ├── components/
│   │   ├── auth/           # Protected routes and authentication wrappers
│   │   ├── common/         # Buttons, cards, modals, empty & error states
│   │   ├── dashboard/      # Journey cards, stats, fast learn bar
│   │   ├── layout/         # AppLayout, responsive Sidebar, MobileSidebar, Navbar
│   │   ├── progress/       # Progress bars, activity metrics, revision tables
│   │   └── study/          # Dropzones, text review, unit accordions
│   ├── context/            # AuthContext, AppContext
│   ├── pages/              # All 11 main application pages:
│   │   ├── LandingPage.jsx          # Public landing & feature showcase
│   │   ├── LoginPage.jsx            # Supabase auth sign-in
│   │   ├── SignupPage.jsx           # Supabase auth sign-up
│   │   ├── DashboardPage.jsx        # Dual-mode entry & resume learning
│   │   ├── UploadSyllabusPage.jsx   # Multi-format upload & extraction review
│   │   ├── SyllabusDetailPage.jsx   # Interactive syllabus topic tree
│   │   ├── LearnAnythingPage.jsx    # Mode B instant standalone learning
│   │   ├── LessonViewerPage.jsx     # Rich 16-section lesson & AI Doubt solver
│   │   ├── QuizPage.jsx             # Dedicated interactive quiz assessment
│   │   ├── LibraryPage.jsx          # Searchable repository of courses & lessons
│   │   ├── ProgressPage.jsx         # Telemetry, revision alerts & quiz scores
│   │   └── SettingsPage.jsx         # System preferences & backend diagnostics
│   ├── routes/             # AppRoutes (declarative React Router 6 configuration)
│   ├── schemas/            # Zod validation schemas (syllabus, lessons, doubts, videos)
│   └── services/           # Backend API clients, OCR parser, and Supabase client:
│       ├── api/
│       │   ├── aiTeachingEngine.js       # Proxies to server-side Edge Functions
│       │   ├── videoDiscoveryService.js  # YouTube Data API client
│       │   ├── quizEngineService.js      # Deterministic score calculation
│       │   ├── courseService.js          # Curriculum CRUD & tree operations
│       │   ├── lessonService.js          # Standalone & syllabus lesson persistence
│       │   └── learningProgressService.js# Real topic & course completion rates
│       ├── documentParser.js             # PDF.js, Mammoth DOCX, & Tesseract OCR
│       └── supabase.js                   # Supabase client initializer
├── supabase/
│   ├── migrations/
│   │   └── 20261028000000_ai_study_platform_core_schema.sql  # Core Section 12 schema
│   └── functions/
│       ├── analyze-syllabus/   # Groq API curriculum hierarchy extraction
│       ├── process-document/   # Background document processing & job records
│       ├── generate-lesson/    # 16-section lesson generation via Groq API
│       ├── ask-doubt/          # Contextual tutor doubt solver
│       ├── generate-quiz/      # On-demand MCQ generator
│       ├── search-videos/      # YouTube Data API v3 search & caching
│       ├── submit-quiz/        # Deterministic scoring & attempt persistence
│       └── update-progress/    # Topic status & course completion updater
└── tests/
    └── unit/
        ├── validationSchemas.test.js  # Zod schema validation tests
        ├── quizScoring.test.js        # Deterministic scoring tests
        ├── documentParser.test.js     # Text extraction & OCR boundary tests
        └── videoDiscovery.test.js     # YouTube search integrity tests
```

---

## 3. Database Schema & Security (Row Level Security)

The PostgreSQL database schema follows Section 12 & 13 of the specification:

1. **`profiles`**: User profile, display name, and avatar settings.
2. **`source_files`**: Uploaded syllabus documents, file metadata, and extraction logs.
3. **`courses`**: User-owned curriculum courses (with backward-compatible support for `syllabi`).
4. **`units`**: Course units with order positions.
5. **`topics`**: Topics and subtopics with difficulty, estimated time, and objectives.
6. **`lessons`**: Generated 16-section lessons (`content_json` JSONB), learning levels, and course associations.
7. **`quiz_questions`**: Questions tied to lessons (`question_json` JSONB).
8. **`quiz_attempts`**: Deterministically calculated scores, student answers, and evaluations.
9. **`topic_progress`**: Status (`not_started`, `in_progress`, `completed`, `needs_revision`), timestamps, and user isolation (`UNIQUE(user_id, topic_id)`).
10. **`video_resources`**: Verified YouTube video records cached per lesson.
11. **`learning_jobs`**: Asynchronous document processing and generation jobs.
12. **`storage.buckets` (`study-materials`)**: Private storage bucket configured with user-folder RLS (`auth.uid() = (storage.foldername(name))[1]`).

Every table has **Row Level Security (RLS) enabled** with strict ownership checks. Students cannot view or alter another student's courses, files, quiz results, or progress.

---

## 4. Environment Variables & Server Secrets Setup

### Frontend Client Configuration (`.env`)
Create a `.env` file in the root directory:
```bash
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

### Server-Side Edge Function Secrets
**Never place API keys in client-side code.** Configure secrets securely in Supabase:
```bash
# 1. AI Provider Secret (Groq API)
supabase secrets set GROQ_API_KEY=gsk_your_groq_api_key

# 2. Configurable Groq Model Name
supabase secrets set GROQ_MODEL=llama-3.3-70b-versatile

# 3. YouTube Data API v3 Secret (Google Cloud Console)
supabase secrets set YOUTUBE_API_KEY=your_google_youtube_data_api_key
```

---

## 5. Deployment Guide

### Applying Database Migrations
Deploy the PostgreSQL schema to your Supabase project:
```bash
supabase db push
# Or run the SQL in the Supabase Dashboard SQL Editor:
# supabase/migrations/20261028000000_ai_study_platform_core_schema.sql
```

### Deploying Edge Functions
Deploy all 8 server-side functions:
```bash
supabase functions deploy analyze-syllabus
supabase functions deploy process-document
supabase functions deploy generate-lesson
supabase functions deploy ask-doubt
supabase functions deploy generate-quiz
supabase functions deploy search-videos
supabase functions deploy submit-quiz
supabase functions deploy update-progress
```

---

## 6. Local Development & Testing

### Install Dependencies
```bash
npm install
```

### Run Automated Test Suite (Vitest)
```bash
npm test
```
All unit tests verify:
- Zod schema validation for syllabi, lessons, doubts, and videos.
- Deterministic quiz scoring (100% correct, partial scores, case insensitivity, revision flags).
- Document parser file limits, OCR detection, header removal, and subject detection.
- Video discovery integrity (zero fabricated IDs or URLs).

### Run Local Development Server
```bash
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

### Build Production Bundle
```bash
npm run build
```

---

## 7. Troubleshooting & Diagnostics

- **Missing `GROQ_API_KEY`:** If Groq secrets are not set in Supabase, the Edge Functions return a clean `500` error with code `MISSING_API_KEY`. Set `supabase secrets set GROQ_API_KEY=...`.
- **Missing `YOUTUBE_API_KEY`:** If YouTube Data API key is missing or quota is exceeded, the application displays a friendly unconfigured notice with setup instructions rather than fabricating fake videos.
- **Scanned or Image-only PDFs:** Text-less PDFs automatically trigger the Tesseract OCR fallback pipeline to render page canvases and extract text.
- **Unreadable Documents:** If a file has insufficient characters or illegible content, an uncertainty alert is raised instead of hallucinating content.
