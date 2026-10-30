import React from 'react';
import { Routes, Route } from 'react-router-dom';
import ProtectedRoute from '../components/auth/ProtectedRoute';
import AppLayout from '../components/layout/AppLayout';

// 11 Main Pages
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
import NotFoundPage from '../pages/NotFoundPage';

export default function AppRoutes() {
  return (
    <Routes>
      {/* 1. Public Landing Page */}
      <Route path="/" element={<LandingPage />} />

      {/* 2. Public Auth Routes */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignupPage />} />

      {/* Protected Main Application Routes */}
      <Route
        element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        }
      >
        {/* 3. Student Dashboard */}
        <Route path="/dashboard" element={<DashboardPage />} />

        {/* 4. Mode A: Syllabus Upload & Analysis */}
        <Route path="/study/upload" element={<UploadSyllabusPage />} />
        <Route path="/syllabus/upload" element={<UploadSyllabusPage />} />

        {/* 5. Course Syllabus and Topic Tree */}
        <Route path="/study" element={<StudyPage />} />
        <Route path="/study/:syllabusId" element={<SyllabusDetailPage />} />
        <Route path="/courses/:courseId" element={<SyllabusDetailPage />} />

        {/* 6. Mode B: Individual Topic and Document Learning ("Learn Anything") */}
        <Route path="/learn" element={<LearnAnythingPage />} />

        {/* 7. Lesson Viewer (Shared AI Teaching Engine) */}
        <Route path="/lessons/:lessonId" element={<LessonViewerPage />} />
        <Route path="/study/:syllabusId/topic/:topicId" element={<LessonViewerPage />} />

        {/* 8. Dedicated Quiz Page */}
        <Route path="/lessons/:lessonId/quiz" element={<QuizPage />} />
        <Route path="/quiz/:lessonId" element={<QuizPage />} />

        {/* 9. Saved Learning Library */}
        <Route path="/library" element={<LibraryPage />} />

        {/* 10. Student Progress & Analytics */}
        <Route path="/progress" element={<ProgressPage />} />

        {/* 11. Settings & Configuration */}
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="/profile" element={<ProfilePage />} />

        {/* 404 Inside Layout */}
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}
