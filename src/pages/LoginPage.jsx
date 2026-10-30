import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useApp } from '../context/AppContext';
import Button from '../components/common/Button';
import {
  Sparkles,
  CheckCircle2,
  Lock,
  Mail,
  Eye,
  EyeOff,
  ArrowRight,
} from 'lucide-react';

export default function LoginPage() {
  const { signIn, loading } = useAuth();
  const { showToast } = useApp();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('ayan.ahmad@college.edu');
  const [password, setPassword] = useState('password123');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  const from = location.state?.from?.pathname || '/dashboard';

  const handleSubmit = async (e) => {
    e.preventDefault();
    const res = await signIn(email, password);
    if (res.success) {
      showToast('Welcome back to Friday! 👋', 'success');
      navigate(from, { replace: true });
    } else {
      showToast(res.error || 'Invalid email or password', 'danger');
    }
  };

  const handleGoogleLogin = async () => {
    const res = await signIn('ayan.ahmad@college.edu', 'google_auth_token');
    if (res.success) {
      showToast('Signed in successfully!', 'success');
      navigate(from, { replace: true });
    }
  };

  return (
    <div className="min-h-screen flex bg-swiss-canvas text-swiss-black dark:bg-[#121212] dark:text-swiss-canvas transition-colors">
      {/* Left side: Swiss Architectural Hero Column */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-[#0a0a0a] text-white p-12 flex-col justify-between border-r border-[#262626]">
        {/* Subtle grid watermark */}
        <div className="absolute inset-0 bg-[radial-gradient(#262626_1px,transparent_1px)] [background-size:24px_24px] opacity-40 pointer-events-none" />

        {/* Brand Header */}
        <div className="relative z-10 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-crimson text-white flex items-center justify-center font-bold shadow-none">
            <span className="material-symbols-outlined text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>
              auto_awesome
            </span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-headline font-bold text-2xl tracking-tighter text-white">FRIDAY</span>
              <span className="text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 rounded bg-[#262626] text-crimson">
                SYSTEM
              </span>
            </div>
            <p className="text-[11px] font-mono tracking-wider text-[#a3a3a3] uppercase">Academic & Research Platform</p>
          </div>
        </div>

        {/* Center Pitch */}
        <div className="relative z-10 max-w-lg space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded bg-[#171717] border border-[#262626] text-xs font-mono uppercase tracking-widest text-crimson">
            <Sparkles className="w-3.5 h-3.5 text-crimson" />
            Curriculum Telemetry • B.Tech CSE
          </div>

          <h2 className="text-4xl font-headline font-bold tracking-tight text-white leading-tight">
            Academic precision.<br />
            <span className="text-[#a3a3a3]">Disciplined engineering mastery.</span>
          </h2>

          <p className="text-sm text-[#d4d4d4] leading-relaxed font-normal">
            Deconstruct complex university syllabi into verified topic units, authoritative academic references, and algorithmic career benchmarks.
          </p>

          <div className="space-y-2.5 pt-2 border-t border-[#262626]">
            {[
              'Autonomous syllabus parsing into modular academic units',
              'Structured theory syntheses & authoritative lecture indexing',
              'Rigorous skill-gap diagnostics and industry roadmaps',
            ].map((feature, idx) => (
              <div key={idx} className="flex items-center gap-3 text-xs text-[#d4d4d4] font-medium">
                <div className="w-4 h-4 rounded bg-[#171717] border border-[#333333] text-crimson flex items-center justify-center shrink-0">
                  <CheckCircle2 className="w-3 h-3 text-crimson" />
                </div>
                <span>{feature}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom Tagline */}
        <div className="relative z-10 flex items-center justify-between text-[11px] font-mono text-[#737373] uppercase tracking-wider border-t border-[#262626] pt-4">
          <span>Swiss Typographic Grid v2.4</span>
          <span>B.Tech CSE Protocol</span>
        </div>
      </div>

      {/* Right side: Login Card */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 bg-white dark:bg-[#121212]">
        <div className="w-full max-w-md space-y-6">
          {/* Mobile brand header */}
          <div className="lg:hidden flex items-center gap-2.5 mb-6">
            <div className="w-9 h-9 rounded-lg bg-crimson text-white flex items-center justify-center">
              <span className="material-symbols-outlined text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>
                auto_awesome
              </span>
            </div>
            <span className="font-headline font-bold text-xl tracking-tight text-swiss-black dark:text-white">FRIDAY</span>
          </div>

          <div>
            <span className="text-[11px] font-mono uppercase tracking-widest text-[#737373] block mb-1">
              Authentication Gateway
            </span>
            <h2 className="text-2xl sm:text-3xl font-headline font-bold text-swiss-black dark:text-white tracking-tight">
              Sign In to System
            </h2>
            <p className="text-xs sm:text-sm text-[#737373] mt-1">
              Access your verified curriculum breakdowns and career roadmap
            </p>
          </div>

          {/* Quick Demo Credentials pill */}
          <div className="p-3 bg-swiss-surface dark:bg-[#171717] rounded-lg border border-swiss-border dark:border-[#262626] text-xs text-swiss-muted dark:text-[#a3a3a3] flex items-center justify-between font-mono">
            <span>Demo: <strong className="text-swiss-black dark:text-white">ayan.ahmad@college.edu</strong></span>
            <span className="text-crimson font-bold uppercase tracking-wider text-[10px]">Ready</span>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email Field */}
            <div>
              <label className="block text-[11px] font-mono font-bold uppercase tracking-wider text-swiss-muted dark:text-[#a3a3a3] mb-1.5">
                Academic / Personal Identifier
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-[#737373] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="student@college.edu"
                  className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-[#171717] rounded-lg border border-swiss-border dark:border-[#262626] text-sm text-swiss-black dark:text-white placeholder-[#a3a3a3] focus:outline-none focus:border-swiss-black dark:focus:border-white transition-colors"
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-[11px] font-mono font-bold uppercase tracking-wider text-swiss-muted dark:text-[#a3a3a3]">
                  Security Key
                </label>
                <button
                  type="button"
                  onClick={() => showToast('Demo password reset link sent to email!', 'info')}
                  className="text-xs text-crimson hover:underline font-mono font-medium"
                >
                  Forgot?
                </button>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-[#737373] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-10 py-2.5 bg-white dark:bg-[#171717] rounded-lg border border-swiss-border dark:border-[#262626] text-sm text-swiss-black dark:text-white placeholder-[#a3a3a3] focus:outline-none focus:border-swiss-black dark:focus:border-white transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#737373] hover:text-swiss-black dark:hover:text-white"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Remember Me */}
            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center gap-2 text-xs text-swiss-muted dark:text-[#a3a3a3] cursor-pointer">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded border-swiss-border dark:border-[#333333] text-swiss-black dark:text-white focus:ring-0 w-4 h-4 accent-[#0a0a0a]"
                />
                <span>Persist session for 30 days</span>
              </label>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              variant="primary"
              size="lg"
              loading={loading}
              icon={ArrowRight}
              iconPosition="right"
              className="w-full mt-2"
            >
              Authenticate Session
            </Button>
          </form>

          {/* Divider */}
          <div className="relative my-4">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-swiss-border dark:border-[#262626]" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white dark:bg-[#121212] px-3 text-[#737373] font-mono text-[10px] tracking-wider">
                OR
              </span>
            </div>
          </div>

          {/* Google Sign In */}
          <Button
            onClick={handleGoogleLogin}
            variant="outline"
            size="lg"
            className="w-full"
          >
            <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            Continue with Google
          </Button>

          {/* Create Account Link */}
          <div className="text-center pt-2">
            <p className="text-xs text-[#737373]">
              Need a research account?{' '}
              <Link
                to="/signup"
                className="font-bold text-crimson hover:underline"
              >
                Register student profile
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
