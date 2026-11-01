import React from 'react';
import { Routes, Route } from 'react-router-dom';
import ProtectedRoute from '../components/auth/ProtectedRoute';
import PublicOnlyRoute from '../components/auth/PublicOnlyRoute';
import AppLayout from '../components/layout/AppLayout';

// Main Application Pages
import LandingPage from '../pages/LandingPage';
import LoginPage from '../pages/LoginPage';
import SignupPage from '../pages/SignupPage';
import DashboardPage from '../pages/DashboardPage';
import UploadSyllabusPage from '../pages/UploadSyllabusPage';
import SyllabusDetailPage from '../pages/SyllabusDetailPage';
import LearnAnythingPage from '../pages/LearnAnythingPage';
import LessonViewerPage from '../pages/LessonViewerPage';
import QuizPage from '../pages/QuizPage';
import LibraryPage from '../pages/LibraryPage';
import ProgressPage from '../pages/ProgressPage';
import SettingsPage from '../pages/SettingsPage';
import ProfilePage from '../pages/ProfilePage';
import StudyPage from '../pages/StudyPage';
import CareerPage from '../pages/CareerPage';
import CareerAssessmentPage from '../pages/CareerAssessmentPage';
import CareerRoadmapPage from '../pages/CareerRoadmapPage';
import NotFoundPage from '../pages/NotFoundPage';

export default function AppRoutes() {
  return (
    <Routes>
      {/* 1. Public Landing Page */}
      <Route path="/" element={<LandingPage />} />

      {/* 2. Public-only Auth Routes (redirects authenticated users to /dashboard) */}
      <Route
        path="/login"
        element={
          <PublicOnlyRoute>
            <LoginPage />
          </PublicOnlyRoute>
        }
      />
      <Route
        path="/signup"
        element={
          <PublicOnlyRoute>
            <SignupPage />
          </PublicOnlyRoute>
        }
      />

      {/* 3. Protected Application Routes (Strictly requires active Supabase session) */}
      <Route
        element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        }
      >
        {/* Student Dashboard */}
        <Route path="/dashboard" element={<DashboardPage />} />

        {/* Mode A: Syllabus Upload & Analysis */}
        <Route path="/study/upload" element={<UploadSyllabusPage />} />
        <Route path="/syllabus/upload" element={<UploadSyllabusPage />} />

        {/* Course Syllabus and Topic Tree */}
        <Route path="/study" element={<StudyPage />} />
        <Route path="/study/:syllabusId" element={<SyllabusDetailPage />} />
        <Route path="/courses/:courseId" element={<SyllabusDetailPage />} />

        {/* Mode B: Individual Topic and Document Learning ("Learn Anything") */}
        <Route path="/learn" element={<LearnAnythingPage />} />

        {/* Lesson Viewer (Shared AI Teaching Engine) */}
        <Route path="/lessons/:lessonId" element={<LessonViewerPage />} />
        <Route path="/study/:syllabusId/topic/:topicId" element={<LessonViewerPage />} />

        {/* Dedicated Quiz Page */}
        <Route path="/lessons/:lessonId/quiz" element={<QuizPage />} />
        <Route path="/quiz/:lessonId" element={<QuizPage />} />

        {/* Saved Learning Library */}
        <Route path="/library" element={<LibraryPage />} />

        {/* Student Progress & Analytics */}
        <Route path="/progress" element={<ProgressPage />} />

        {/* Career Pathways & Diagnostics */}
        <Route path="/career" element={<CareerPage />} />
        <Route path="/career/assessment" element={<CareerAssessmentPage />} />
        <Route path="/career/roadmap" element={<CareerRoadmapPage />} />

        {/* Settings & Profile */}
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="/profile" element={<ProfilePage />} />

        {/* 404 Inside Layout */}
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}
