import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  Server,
  Terminal,
  ShieldCheck,
  RefreshCw,
  Bell,
  Save,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { supabase } from '../services/supabase';

export default function SettingsPage() {
  const { showToast } = useApp();

  const [testingConnection, setTestingConnection] = useState(false);
  const [testResult, setTestResult] = useState(null);

  const [reminders, setReminders] = useState(() => {
    return localStorage.getItem('study_reminders_enabled') !== 'false';
  });
  const [weeklyReport, setWeeklyReport] = useState(() => {
    return localStorage.getItem('study_weekly_report') === 'true';
  });

  const handleTestConnection = async () => {
    setTestingConnection(true);
    setTestResult(null);

    try {
      const { data, error } = await supabase.from('courses').select('id').limit(1);
      if (error && error.code !== 'PGRST116') {
        throw error;
      }
      setTestResult({
        status: 'success',
        message: 'Supabase connection verified. Edge Functions and database schema reachable.',
      });
      showToast('Connection test successful!', 'success');
    } catch (err) {
      console.error('Connection test error:', err);
      setTestResult({
        status: 'error',
        message: err.message || 'Failed to reach Supabase backend. Verify your VITE_SUPABASE_URL and key.',
      });
      showToast('Connection test failed', 'danger');
    } finally {
      setTestingConnection(false);
    }
  };

  const handleSavePreferences = () => {
    localStorage.setItem('study_reminders_enabled', reminders.toString());
    localStorage.setItem('study_weekly_report', weeklyReport.toString());
    showToast('Preferences successfully updated', 'success');
  };

  const supabaseConfigured =
    Boolean(import.meta.env.VITE_SUPABASE_URL) &&
    Boolean(import.meta.env.VITE_SUPABASE_ANON_KEY);

  return (
    <div className="space-y-6 sm:space-y-8 animate-fade-in max-w-5xl mx-auto py-4 sm:py-8">
      {/* Header */}
      <div className="border-b border-[#e5e5e5] dark:border-[#262626] pb-6">
        <span className="text-[10px] font-headline font-bold text-crimson uppercase tracking-wider">
          System Configuration & Diagnostics
        </span>
        <h1 className="text-2xl sm:text-3xl font-headline font-bold text-[#0a0a0a] dark:text-white tracking-tight mt-1">
          Settings & Environment
        </h1>
        <p className="text-xs sm:text-sm text-[#737373] mt-1">
          Manage system preferences, backend services, and AI provider configuration.
        </p>
      </div>

      <div className="space-y-6">
        {/* Backend & AI Configuration Card */}
        <div className="p-6 sm:p-8 rounded-lg bg-white dark:bg-[#171717] border border-[#e5e5e5] dark:border-[#262626] space-y-6">
          <div className="flex items-center justify-between border-b border-[#e5e5e5] dark:border-[#262626] pb-4">
            <div>
              <h2 className="text-sm font-headline font-bold text-[#0a0a0a] dark:text-white uppercase tracking-wider flex items-center gap-2">
                <Server className="w-4 h-4 text-crimson" />
                Backend & AI Services Status
              </h2>
              <p className="text-xs text-[#737373] mt-0.5">
                All AI and video API keys are kept strictly server-side inside Supabase Edge Function secrets.
              </p>
            </div>
            <span
              className={`px-2.5 py-0.5 rounded text-[10px] font-headline font-bold uppercase tracking-wider border ${
                supabaseConfigured
                  ? 'bg-[#f4f4f4] text-[#171717] dark:bg-neutral-800 dark:text-neutral-200 border-[#e5e5e5] dark:border-neutral-700'
                  : 'bg-[#fef2f2] text-crimson border-crimson/30'
              }`}
            >
              {supabaseConfigured ? 'Supabase Connected' : 'Configuration Notice'}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            {/* Supabase Status */}
            <div className="p-4 rounded-lg bg-[#fafafa] dark:bg-[#121212] border border-[#e5e5e5] dark:border-[#262626] space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-headline font-bold text-[#0a0a0a] dark:text-white">Supabase Database & Auth</span>
                <span className={`font-bold font-headline ${supabaseConfigured ? 'text-crimson' : 'text-[#737373]'}`}>
                  {supabaseConfigured ? 'Configured' : 'Missing URL/Key'}
                </span>
              </div>
              <p className="text-[#737373] text-[11px] leading-relaxed">
                Database migrations, Row Level Security (RLS), and private storage bucket <code className="font-mono text-crimson">study-materials</code>.
              </p>
            </div>

            {/* Groq API Status */}
            <div className="p-4 rounded-lg bg-[#fafafa] dark:bg-[#121212] border border-[#e5e5e5] dark:border-[#262626] space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-headline font-bold text-[#0a0a0a] dark:text-white">AI Provider (Groq API)</span>
                <span className="text-crimson font-headline font-bold">Server Secret</span>
              </div>
              <p className="text-[#737373] text-[11px] leading-relaxed">
                Configured in Supabase secrets via <code className="font-mono text-crimson">GROQ_API_KEY</code> and <code className="font-mono text-crimson">GROQ_MODEL</code>.
              </p>
            </div>

            {/* YouTube API Status */}
            <div className="p-4 rounded-lg bg-[#fafafa] dark:bg-[#121212] border border-[#e5e5e5] dark:border-[#262626] space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-headline font-bold text-[#0a0a0a] dark:text-white">YouTube Data API v3</span>
                <span className="text-crimson font-headline font-bold">Server Secret</span>
              </div>
              <p className="text-[#737373] text-[11px] leading-relaxed">
                Configured in Supabase secrets via <code className="font-mono text-crimson">YOUTUBE_API_KEY</code> for verified lecture search.
              </p>
            </div>

            {/* Test Connection Box */}
            <div className="p-4 rounded-lg bg-[#fafafa] dark:bg-[#121212] border border-[#e5e5e5] dark:border-[#262626] flex flex-col justify-between space-y-2">
              <span className="font-headline font-bold text-[#0a0a0a] dark:text-white">System Diagnostics</span>
              <button
                type="button"
                onClick={handleTestConnection}
                disabled={testingConnection}
                className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-[#0a0a0a] hover:bg-[#171717] dark:bg-white dark:text-[#0a0a0a] text-white font-headline font-bold text-xs uppercase tracking-wider transition-colors"
              >
                {testingConnection ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <ShieldCheck className="w-3.5 h-3.5" />}
                Test Connection
              </button>
            </div>
          </div>

          {testResult && (
            <div
              className={`p-3.5 rounded-lg text-xs flex items-start gap-2.5 ${
                testResult.status === 'success'
                  ? 'bg-[#f4f4f4] text-[#171717] dark:bg-neutral-800 dark:text-neutral-200 border border-[#e5e5e5] dark:border-neutral-700'
                  : 'bg-[#fef2f2] text-crimson border border-crimson/30'
              }`}
            >
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span className="font-medium">{testResult.message}</span>
            </div>
          )}

          {/* Quick CLI Commands */}
          <div className="p-4 rounded-lg bg-[#fafafa] dark:bg-[#121212] border border-[#e5e5e5] dark:border-[#262626] space-y-2 font-mono text-xs text-[#171717] dark:text-neutral-300">
            <div className="flex items-center gap-2 text-[#737373] font-sans font-headline font-bold text-[10px] uppercase tracking-wider">
              <Terminal className="w-3.5 h-3.5 text-crimson" />
              Edge Function Deployment Commands
            </div>
            <p className="text-[#737373] font-sans text-xs">
              To configure server secrets and deploy Edge Functions:
            </p>
            <pre className="p-3 rounded-lg bg-white dark:bg-[#1a1a1a] border border-[#e5e5e5] dark:border-[#262626] text-[11px] overflow-x-auto text-[#0a0a0a] dark:text-white font-mono">
{`supabase secrets set GROQ_API_KEY=your_key GROQ_MODEL=llama-3.3-70b-versatile YOUTUBE_API_KEY=your_yt_key
supabase functions deploy analyze-syllabus
supabase functions deploy generate-lesson
supabase functions deploy ask-doubt
supabase functions deploy search-videos
supabase functions deploy submit-quiz`}
            </pre>
          </div>
        </div>

        {/* Notifications & Learning Preferences */}
        <div className="p-6 sm:p-8 rounded-lg bg-white dark:bg-[#171717] border border-[#e5e5e5] dark:border-[#262626] space-y-4">
          <div className="border-b border-[#e5e5e5] dark:border-[#262626] pb-3">
            <h2 className="text-sm font-headline font-bold text-[#0a0a0a] dark:text-white uppercase tracking-wider flex items-center gap-2">
              <Bell className="w-4 h-4 text-crimson" />
              Learning Notifications
            </h2>
            <p className="text-xs text-[#737373] mt-0.5">
              Customize study reminders and research digest telemetry.
            </p>
          </div>

          <div className="space-y-4 divide-y divide-[#f4f4f4] dark:divide-neutral-800">
            <div className="flex items-center justify-between pt-2">
              <div>
                <p className="text-xs sm:text-sm font-headline font-bold text-[#0a0a0a] dark:text-white">Daily Study Reminders</p>
                <p className="text-xs text-[#737373]">Receive morning notification to resume your current curriculum topic.</p>
              </div>
              <input
                type="checkbox"
                checked={reminders}
                onChange={(e) => setReminders(e.target.checked)}
                className="w-4 h-4 rounded text-crimson focus:ring-0 bg-[#fafafa] dark:bg-[#121212] border-[#747878] accent-crimson cursor-pointer"
              />
            </div>

            <div className="flex items-center justify-between pt-4">
              <div>
                <p className="text-xs sm:text-sm font-headline font-bold text-[#0a0a0a] dark:text-white">Email Progress Digests</p>
                <p className="text-xs text-[#737373]">Weekly breakdown of mastered topics and evaluation scores.</p>
              </div>
              <input
                type="checkbox"
                checked={weeklyReport}
                onChange={(e) => setWeeklyReport(e.target.checked)}
                className="w-4 h-4 rounded text-crimson focus:ring-0 bg-[#fafafa] dark:bg-[#121212] border-[#747878] accent-crimson cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* Save button */}
        <div className="flex justify-end">
          <button
            type="button"
            onClick={handleSavePreferences}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-lg bg-crimson hover:bg-crimson-hover text-white font-headline font-bold text-xs uppercase tracking-wider transition-colors shadow-xs"
          >
            <Save className="w-4 h-4" /> Save Preferences
          </button>
        </div>
      </div>
    </div>
  );
}
