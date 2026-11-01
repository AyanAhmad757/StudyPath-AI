import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useApp } from '../context/AppContext';
import Button from '../components/common/Button';
import Modal from '../components/common/Modal';
import {
  Sparkles,
  CheckCircle2,
  Lock,
  Mail,
  Eye,
  EyeOff,
  ArrowRight,
  AlertCircle,
  GraduationCap,
  KeyRound,
  Inbox,
  RefreshCw,
  Info,
} from 'lucide-react';

export default function LoginPage() {
  const { signIn, resetPassword, resendConfirmationEmail } = useAuth();
  const { showToast } = useApp();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [authError, setAuthError] = useState(null); // { message, isUnconfirmed, code }

  // Email confirmation resend state
  const [resendingEmail, setResendingEmail] = useState(false);
  const [resendStatus, setResendStatus] = useState(null);

  // Forgot password modal state
  const [isForgotOpen, setIsForgotOpen] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [isResetting, setIsResetting] = useState(false);
  const [resetStatus, setResetStatus] = useState(null);

  const rawFrom = location.state?.from?.pathname;
  const targetDestination = (rawFrom && rawFrom !== '/login' && rawFrom !== '/signup') ? rawFrom : '/dashboard';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setAuthError(null);
    setResendStatus(null);

    const cleanEmail = email.trim();
    if (!cleanEmail) {
      setAuthError({ message: 'Please enter your registered email address.' });
      return;
    }
    if (!password) {
      setAuthError({ message: 'Please enter your password.' });
      return;
    }

    setIsSubmitting(true);
    try {
      console.log('[LoginPage] Initiating authentication for:', cleanEmail);
      const res = await signIn(cleanEmail, password);
      console.log('[LoginPage] Authentication response:', res);

      if (res.success) {
        showToast('Signed in successfully! Redirecting...', 'success');
        navigate(targetDestination, { replace: true });
      } else {
        const errorMsg = res.error || 'Invalid email or password.';
        const isUnconfirmed =
          res.code === 'email_not_confirmed' ||
          errorMsg.toLowerCase().includes('email not confirmed') ||
          errorMsg.toLowerCase().includes('email confirmation');

        setAuthError({
          message: errorMsg,
          isUnconfirmed,
          code: res.code,
        });

        if (isUnconfirmed) {
          showToast('Email confirmation required before sign-in.', 'warning');
        } else {
          showToast(errorMsg, 'danger');
        }
      }
    } catch (err) {
      console.error('[LoginPage] Unexpected submit error:', err);
      setAuthError({
        message: err.message || 'An unexpected error occurred during login. Please try again.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResendConfirmation = async () => {
    const cleanEmail = email.trim();
    if (!cleanEmail) {
      showToast('Please enter your email above to resend confirmation.', 'warning');
      return;
    }

    setResendingEmail(true);
    setResendStatus(null);
    try {
      const { error } = await resendConfirmationEmail(cleanEmail);
      if (error) {
        setResendStatus({
          type: 'error',
          message: error.message || 'Failed to resend confirmation email. Rate limit may apply.',
        });
        showToast(error.message || 'Failed to resend verification email.', 'danger');
      } else {
        setResendStatus({
          type: 'success',
          message: `Verification link sent to ${cleanEmail}. Please check your inbox and spam folder.`,
        });
        showToast('Confirmation email dispatched successfully!', 'success');
      }
    } catch (err) {
      setResendStatus({
        type: 'error',
        message: err.message || 'Error communicating with Supabase.',
      });
    } finally {
      setResendingEmail(false);
    }
  };

  const handleForgotPasswordSubmit = async (e) => {
    e.preventDefault();
    if (!resetEmail.trim()) {
      setResetStatus({ type: 'error', message: 'Please provide an email address.' });
      return;
    }

    setIsResetting(true);
    setResetStatus(null);
    try {
      const { error } = await resetPassword(resetEmail.trim());
      if (error) {
        setResetStatus({ type: 'error', message: error.message || 'Failed to send reset link.' });
      } else {
        setResetStatus({
          type: 'success',
          message: `Password recovery link dispatched to ${resetEmail.trim()}. Please inspect your inbox.`,
        });
      }
    } catch (err) {
      setResetStatus({ type: 'error', message: err.message || 'An unexpected error occurred.' });
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-white text-swiss-black dark:bg-[#121212] dark:text-[#f2f0f0] transition-colors">
      {/* Left Column: Swiss Architectural Column */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-[#0a0a0a] text-white p-12 flex-col justify-between border-r border-[#262626]">
        {/* Subtle grid watermark */}
        <div className="absolute inset-0 bg-[radial-gradient(#262626_1px,transparent_1px)] [background-size:24px_24px] opacity-40 pointer-events-none" />

        {/* Brand Header */}
        <div className="relative z-10 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-crimson text-white flex items-center justify-center font-bold">
            <GraduationCap className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-headline font-bold text-2xl tracking-tighter text-white">StudyPath</span>
              <span className="text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 rounded bg-[#262626] text-crimson">
                AI
              </span>
            </div>
            <p className="text-[11px] font-mono tracking-wider text-[#a3a3a3] uppercase">
              Academic & Research Platform
            </p>
          </div>
        </div>

        {/* Center Editorial Pitch */}
        <div className="relative z-10 max-w-lg space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded bg-[#171717] border border-[#262626] text-xs font-mono uppercase tracking-widest text-crimson">
            <Sparkles className="w-3.5 h-3.5 text-crimson" />
            Curriculum Telemetry & Precision Learning
          </div>

          <h2 className="text-4xl font-headline font-bold tracking-tight text-white leading-tight">
            Academic precision.<br />
            <span className="text-[#a3a3a3]">Rigorous knowledge architecture.</span>
          </h2>

          <p className="text-sm text-[#d4d4d4] leading-relaxed font-normal">
            Deconstruct complex university syllabi into verified topic units, authoritative academic references, and step-by-step interactive lessons.
          </p>

          <div className="space-y-2.5 pt-2 border-t border-[#262626]">
            {[
              'Autonomous syllabus parsing into modular academic units',
              'Structured 16-section theory syntheses & lecture indexing',
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
          <span>Swiss Typographic Grid</span>
          <span>Verified Supabase Protocol</span>
        </div>
      </div>

      {/* Right Column: Sign In Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 bg-white dark:bg-[#121212]">
        <div className="w-full max-w-md space-y-6">
          {/* Mobile brand header */}
          <div className="lg:hidden flex items-center gap-2.5 mb-6">
            <div className="w-9 h-9 rounded-lg bg-crimson text-white flex items-center justify-center">
              <GraduationCap className="w-5 h-5 text-white" />
            </div>
            <span className="font-headline font-bold text-xl tracking-tight text-swiss-black dark:text-white">
              StudyPath AI
            </span>
          </div>

          <div>
            <span className="text-[11px] font-mono uppercase tracking-widest text-[#737373] block mb-1">
              Authentication Gateway
            </span>
            <h1 className="text-2xl sm:text-3xl font-headline font-bold text-swiss-black dark:text-white tracking-tight">
              Sign In
            </h1>
            <p className="text-xs sm:text-sm text-[#737373] mt-1">
              Enter your registered credentials to access your personal study platform.
            </p>
          </div>

          {/* Error & Warning Banners */}
          {authError && (
            authError.isUnconfirmed ? (
              <div className="p-4 rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-300 dark:border-amber-800 text-amber-900 dark:text-amber-200 text-xs space-y-3 animate-fadeIn">
                <div className="flex items-start gap-2.5">
                  <Inbox className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <p className="font-headline font-bold uppercase tracking-wider text-[11px] text-amber-800 dark:text-amber-300">
                      Email Confirmation Required
                    </p>
                    <p className="leading-relaxed">
                      Your account was registered in Supabase, but your email address has not been confirmed yet. Supabase requires email verification before granting access.
                    </p>
                    <p className="text-[11px] opacity-80">
                      Please check your inbox (and spam folder) for the confirmation link sent during registration.
                    </p>
                  </div>
                </div>

                {/* Resend Action */}
                <div className="pt-2 border-t border-amber-200 dark:border-amber-800/60 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                  <button
                    type="button"
                    onClick={handleResendConfirmation}
                    disabled={resendingEmail}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded bg-amber-600 hover:bg-amber-700 text-white font-bold text-[11px] uppercase tracking-wider transition-colors disabled:opacity-50"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${resendingEmail ? 'animate-spin' : ''}`} />
                    {resendingEmail ? 'Sending...' : 'Resend Confirmation Email'}
                  </button>

                  <span className="text-[10px] text-amber-700 dark:text-amber-400 font-mono">
                    Supabase Auth Policy
                  </span>
                </div>

                {resendStatus && (
                  <div
                    className={`p-2.5 rounded text-[11px] font-medium leading-relaxed ${
                      resendStatus.type === 'success'
                        ? 'bg-emerald-100 text-emerald-900 dark:bg-emerald-950 dark:text-emerald-200'
                        : 'bg-red-100 text-red-900 dark:bg-red-950 dark:text-red-200'
                    }`}
                  >
                    {resendStatus.message}
                  </div>
                )}

                {/* Developer / Admin guidance */}
                <div className="pt-2 border-t border-amber-200/60 dark:border-amber-800/40 text-[10px] text-amber-800/80 dark:text-amber-300/80 leading-normal flex items-start gap-1.5">
                  <Info className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                  <span>
                    <strong>Project Setup Note:</strong> To allow immediate sign-in without waiting for emails, disable <em>"Confirm email"</em> in your Supabase Dashboard under <strong>Authentication → Providers → Email</strong>.
                  </span>
                </div>
              </div>
            ) : (
              <div className="p-3.5 rounded-lg bg-[#fef2f2] dark:bg-crimson/10 border border-crimson/30 flex items-start gap-2.5 text-xs text-crimson animate-fadeIn">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <div className="flex-1 font-medium leading-relaxed">{authError.message}</div>
              </div>
            )
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email Field */}
            <div>
              <label className="block text-[11px] font-mono font-bold uppercase tracking-wider text-swiss-muted dark:text-[#a3a3a3] mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-[#737373] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  autoComplete="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (authError) setAuthError(null);
                  }}
                  placeholder="student@university.edu"
                  className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-[#171717] rounded-lg border border-swiss-border dark:border-[#262626] text-sm text-swiss-black dark:text-white placeholder-[#a3a3a3] focus:outline-none focus:border-swiss-black dark:focus:border-white transition-colors"
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-[11px] font-mono font-bold uppercase tracking-wider text-swiss-muted dark:text-[#a3a3a3]">
                  Password
                </label>
                <button
                  type="button"
                  onClick={() => {
                    setResetEmail(email);
                    setResetStatus(null);
                    setIsForgotOpen(true);
                  }}
                  className="text-xs text-crimson hover:underline font-mono font-medium"
                >
                  Forgot Password?
                </button>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-[#737373] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (authError) setAuthError(null);
                  }}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-10 py-2.5 bg-white dark:bg-[#171717] rounded-lg border border-swiss-border dark:border-[#262626] text-sm text-swiss-black dark:text-white placeholder-[#a3a3a3] focus:outline-none focus:border-swiss-black dark:focus:border-white transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#737373] hover:text-swiss-black dark:hover:text-white"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              variant="primary"
              size="lg"
              loading={isSubmitting}
              icon={ArrowRight}
              iconPosition="right"
              className="w-full mt-2"
            >
              {isSubmitting ? 'Authenticating...' : 'Log In'}
            </Button>
          </form>

          {/* Link to Sign Up */}
          <div className="text-center pt-4 border-t border-swiss-border dark:border-[#262626]">
            <p className="text-xs text-[#737373]">
              Don't have an account?{' '}
              <Link
                to="/signup"
                className="font-bold text-crimson hover:underline font-headline uppercase tracking-wider text-[11px]"
              >
                Sign Up
              </Link>
            </p>
          </div>
        </div>
      </div>

      {/* Forgot Password Modal */}
      <Modal
        isOpen={isForgotOpen}
        onClose={() => setIsForgotOpen(false)}
        title="Reset Account Password"
        maxWidth="max-w-md"
      >
        <form onSubmit={handleForgotPasswordSubmit} className="space-y-4">
          <p className="text-xs text-swiss-muted dark:text-[#a3a3a3] leading-relaxed">
            Enter your registered email address below. We'll transmit an official password reset link directly to your inbox via Supabase Auth.
          </p>

          {resetStatus && (
            <div
              className={`p-3 rounded-lg text-xs leading-relaxed border ${
                resetStatus.type === 'success'
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800'
                  : 'bg-[#fef2f2] text-crimson border-crimson/30 dark:bg-crimson/10'
              }`}
            >
              {resetStatus.message}
            </div>
          )}

          <div>
            <label className="block text-[11px] font-mono font-bold uppercase tracking-wider text-swiss-muted dark:text-[#a3a3a3] mb-1.5">
              Account Email
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-[#737373] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                value={resetEmail}
                onChange={(e) => setResetEmail(e.target.value)}
                placeholder="student@university.edu"
                className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-[#171717] rounded-lg border border-swiss-border dark:border-[#262626] text-sm text-swiss-black dark:text-white placeholder-[#a3a3a3] focus:outline-none focus:border-swiss-black dark:focus:border-white transition-colors"
              />
            </div>
          </div>

          <div className="pt-2 flex items-center justify-end gap-2.5">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsForgotOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              loading={isResetting}
              icon={KeyRound}
            >
              Send Reset Link
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
