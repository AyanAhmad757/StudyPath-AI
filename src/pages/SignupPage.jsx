import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useApp } from '../context/AppContext';
import Button from '../components/common/Button';
import {
  Lock,
  Mail,
  User,
  ArrowRight,
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle2,
  GraduationCap,
  Sparkles,
  Inbox,
} from 'lucide-react';

export default function SignupPage() {
  const { signUp, resendConfirmationEmail } = useAuth();
  const { showToast } = useApp();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    college: '',
    course: '',
  });

  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [emailConfirmationRequired, setEmailConfirmationRequired] = useState(false);
  const [resending, setResending] = useState(false);
  const [resendStatus, setResendStatus] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    const fullName = formData.fullName.trim();
    const email = formData.email.trim();
    const password = formData.password;
    const confirmPassword = formData.confirmPassword;

    // 1. Validate Full Name
    if (!fullName) {
      setErrorMessage('Please enter your full name.');
      return;
    }

    // 2. Validate Email Format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setErrorMessage('Please provide a valid email address.');
      return;
    }

    // 3. Validate Password Length
    if (password.length < 6) {
      setErrorMessage('Password must be at least 6 characters long.');
      return;
    }

    // 4. Validate Passwords Match
    if (password !== confirmPassword) {
      setErrorMessage('Passwords do not match. Please verify your entries.');
      return;
    }

    setIsSubmitting(true);
    try {
      console.log('[SignupPage] Submitting registration for:', email);
      const res = await signUp({
        fullName,
        email,
        password,
        college: formData.college.trim() || 'University / College',
        course: formData.course.trim() || 'Academic Track',
      });
      console.log('[SignupPage] Registration response:', res);

      if (res.success) {
        if (res.needsEmailConfirmation) {
          setEmailConfirmationRequired(true);
        } else {
          showToast('Account created successfully! Welcome to StudyPath AI 🎉', 'success');
          navigate('/dashboard', { replace: true });
        }
      } else {
        const msg = res.error || 'Registration failed. Please review your details and try again.';
        setErrorMessage(msg);
        showToast(msg, 'danger');
      }
    } catch (err) {
      console.error('[SignupPage] Unexpected registration error:', err);
      setErrorMessage(err.message || 'An unexpected error occurred during registration.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResend = async () => {
    setResending(true);
    setResendStatus(null);
    try {
      const { error } = await resendConfirmationEmail(formData.email.trim());
      if (error) {
        setResendStatus({
          type: 'error',
          message: error.message || 'Failed to resend confirmation email.',
        });
      } else {
        setResendStatus({
          type: 'success',
          message: 'Confirmation email dispatched! Please check your inbox and spam folder.',
        });
        showToast('Confirmation email resent!', 'success');
      }
    } catch (err) {
      setResendStatus({
        type: 'error',
        message: err.message || 'Error communicating with Supabase.',
      });
    } finally {
      setResending(false);
    }
  };

  // If email confirmation is enabled in Supabase, show a friendly confirmation message
  if (emailConfirmationRequired) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-white dark:bg-[#121212] text-swiss-black dark:text-[#f2f0f0]">
        <div className="w-full max-w-md p-8 rounded-lg bg-white dark:bg-[#171717] border border-swiss-border dark:border-[#262626] shadow-sm text-center space-y-5 animate-fadeIn">
          <div className="w-14 h-14 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 flex items-center justify-center mx-auto">
            <Inbox className="w-7 h-7" />
          </div>

          <div className="space-y-2">
            <span className="text-[11px] font-mono uppercase tracking-widest text-emerald-600 dark:text-emerald-400 font-bold">
              Account Created
            </span>
            <h1 className="text-2xl font-headline font-bold text-swiss-black dark:text-white">
              Verify Your Email Address
            </h1>
            <p className="text-xs sm:text-sm text-swiss-muted dark:text-[#a3a3a3] leading-relaxed">
              We have dispatched a verification email to{' '}
              <strong className="text-swiss-black dark:text-white">{formData.email.trim()}</strong>. Please click the link inside your email to activate your account.
            </p>
          </div>

          <div className="p-3.5 bg-swiss-canvas dark:bg-[#202020] rounded-lg border border-swiss-border dark:border-[#2a2a2a] text-xs text-swiss-muted dark:text-[#a3a3a3] text-left space-y-2">
            <p className="font-semibold text-swiss-black dark:text-white">Next steps:</p>
            <p>1. Open your inbox (and spam folder) to find the confirmation link.</p>
            <p>2. Click the link to verify your account.</p>
            <p>3. Once confirmed, return here to log in to your dashboard.</p>
          </div>

          {resendStatus && (
            <div
              className={`p-2.5 rounded text-xs font-medium ${
                resendStatus.type === 'success'
                  ? 'bg-emerald-100 text-emerald-900 dark:bg-emerald-950 dark:text-emerald-200'
                  : 'bg-red-100 text-red-900 dark:bg-red-950 dark:text-red-200'
              }`}
            >
              {resendStatus.message}
            </div>
          )}

          <div className="space-y-2 pt-1">
            <Button
              onClick={() => navigate('/login')}
              variant="primary"
              size="lg"
              className="w-full"
            >
              Proceed to Login
            </Button>

            <button
              type="button"
              onClick={handleResend}
              disabled={resending}
              className="w-full py-2 text-xs font-mono font-bold uppercase tracking-wider text-swiss-muted hover:text-crimson transition-colors disabled:opacity-50"
            >
              {resending ? 'Dispatching...' : "Didn't receive email? Resend"}
            </button>
          </div>

          <div className="pt-2 border-t border-swiss-border dark:border-[#262626] text-[11px] text-swiss-muted dark:text-[#737373] text-left">
            <p>
              <strong>Developer Note:</strong> If you wish to disable mandatory email confirmation for rapid local testing, toggle off <em>"Confirm email"</em> in your Supabase Dashboard under <strong>Authentication → Providers → Email</strong>.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-white text-swiss-black dark:bg-[#121212] dark:text-[#f2f0f0] transition-colors">
      {/* Left Column: Swiss Architectural Column */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-[#0a0a0a] text-white p-12 flex-col justify-between border-r border-[#262626]">
        <div className="absolute inset-0 bg-[radial-gradient(#262626_1px,transparent_1px)] [background-size:24px_24px] opacity-40 pointer-events-none" />

        <div className="relative z-10 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-crimson text-white flex items-center justify-center font-bold">
            <GraduationCap className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-headline font-bold text-2xl tracking-tighter text-white">StudyPath</span>
              <span className="text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 rounded bg-[#262626] text-crimson">
                REGISTRY
              </span>
            </div>
            <p className="text-[11px] font-mono tracking-wider text-[#a3a3a3] uppercase">
              Academic & Research Platform
            </p>
          </div>
        </div>

        <div className="relative z-10 max-w-lg space-y-5">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded bg-[#171717] border border-[#262626] text-xs font-mono uppercase tracking-widest text-crimson">
            <Sparkles className="w-3.5 h-3.5 text-crimson" />
            Student Account Setup
          </div>
          <h2 className="text-3xl sm:text-4xl font-headline font-bold tracking-tight text-white leading-tight">
            Initiate curriculum telemetry & personal learning plans.
          </h2>
          <p className="text-sm text-[#d4d4d4] leading-relaxed font-normal">
            Upload institutional course syllabi, master core theoretical competencies, and calibrate your engineering trajectory with AI-synthesized lessons.
          </p>

          <div className="grid grid-cols-2 gap-3 pt-2">
            <div className="p-4 rounded-lg bg-[#171717] border border-[#262626]">
              <span className="text-2xl font-headline font-bold text-white block tabular-nums">100%</span>
              <span className="text-[11px] font-mono uppercase tracking-wider text-[#737373]">Syllabus Decomposition</span>
            </div>
            <div className="p-4 rounded-lg bg-[#171717] border border-[#262626]">
              <span className="text-2xl font-headline font-bold text-crimson block tabular-nums">16-STEP</span>
              <span className="text-[11px] font-mono uppercase tracking-wider text-[#737373]">Lesson Synthesis</span>
            </div>
          </div>
        </div>

        <div className="relative z-10 flex items-center justify-between text-[11px] font-mono text-[#737373] uppercase tracking-wider border-t border-[#262626] pt-4">
          <span>Row Level Security (RLS)</span>
          <span>Open Academic Protocol</span>
        </div>
      </div>

      {/* Right Column: Registration Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 overflow-y-auto bg-white dark:bg-[#121212]">
        <div className="w-full max-w-md space-y-5 my-auto">
          {/* Mobile brand header */}
          <div className="lg:hidden flex items-center gap-2.5 mb-4">
            <div className="w-9 h-9 rounded-lg bg-crimson text-white flex items-center justify-center">
              <GraduationCap className="w-5 h-5 text-white" />
            </div>
            <span className="font-headline font-bold text-xl tracking-tight text-swiss-black dark:text-white">
              StudyPath AI
            </span>
          </div>

          <div>
            <span className="text-[11px] font-mono uppercase tracking-widest text-[#737373] block mb-1">
              New Academic Profile
            </span>
            <h1 className="text-2xl sm:text-3xl font-headline font-bold text-swiss-black dark:text-white tracking-tight">
              Create Account
            </h1>
            <p className="text-xs sm:text-sm text-[#737373] mt-1">
              Register a secure profile to start structuring your courses and technical roadmaps.
            </p>
          </div>

          {/* Error Banner */}
          {errorMessage && (
            <div className="p-3.5 rounded-lg bg-[#fef2f2] dark:bg-crimson/10 border border-crimson/30 flex items-start gap-2.5 text-xs text-crimson animate-fadeIn">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <div className="flex-1 font-medium leading-relaxed">{errorMessage}</div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3.5">
            {/* Full Name */}
            <div>
              <label className="block text-[11px] font-mono font-bold uppercase tracking-wider text-swiss-muted dark:text-[#a3a3a3] mb-1">
                Full Name
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-[#737373] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  autoComplete="name"
                  value={formData.fullName}
                  onChange={(e) => {
                    setFormData({ ...formData, fullName: e.target.value });
                    if (errorMessage) setErrorMessage('');
                  }}
                  placeholder="e.g. Marie Curie"
                  className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-[#171717] rounded-lg border border-swiss-border dark:border-[#262626] text-sm text-swiss-black dark:text-white placeholder-[#a3a3a3] focus:outline-none focus:border-swiss-black dark:focus:border-white transition-colors"
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-[11px] font-mono font-bold uppercase tracking-wider text-swiss-muted dark:text-[#a3a3a3] mb-1">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-[#737373] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  autoComplete="email"
                  value={formData.email}
                  onChange={(e) => {
                    setFormData({ ...formData, email: e.target.value });
                    if (errorMessage) setErrorMessage('');
                  }}
                  placeholder="student@university.edu"
                  className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-[#171717] rounded-lg border border-swiss-border dark:border-[#262626] text-sm text-swiss-black dark:text-white placeholder-[#a3a3a3] focus:outline-none focus:border-swiss-black dark:focus:border-white transition-colors"
                />
              </div>
            </div>

            {/* Password & Confirm */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-mono font-bold uppercase tracking-wider text-swiss-muted dark:text-[#a3a3a3] mb-1">
                  Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-[#737373] absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    autoComplete="new-password"
                    value={formData.password}
                    onChange={(e) => {
                      setFormData({ ...formData, password: e.target.value });
                      if (errorMessage) setErrorMessage('');
                    }}
                    placeholder="Min 6 characters"
                    className="w-full pl-10 pr-8 py-2.5 bg-white dark:bg-[#171717] rounded-lg border border-swiss-border dark:border-[#262626] text-sm text-swiss-black dark:text-white placeholder-[#a3a3a3] focus:outline-none focus:border-swiss-black dark:focus:border-white transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#737373]"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-mono font-bold uppercase tracking-wider text-swiss-muted dark:text-[#a3a3a3] mb-1">
                  Confirm Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-[#737373] absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    autoComplete="new-password"
                    value={formData.confirmPassword}
                    onChange={(e) => {
                      setFormData({ ...formData, confirmPassword: e.target.value });
                      if (errorMessage) setErrorMessage('');
                    }}
                    placeholder="Repeat password"
                    className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-[#171717] rounded-lg border border-swiss-border dark:border-[#262626] text-sm text-swiss-black dark:text-white placeholder-[#a3a3a3] focus:outline-none focus:border-swiss-black dark:focus:border-white transition-colors"
                  />
                </div>
              </div>
            </div>

            {/* Optional Academic Context */}
            <div className="grid grid-cols-2 gap-3 pt-1">
              <div>
                <label className="block text-[11px] font-mono font-bold uppercase tracking-wider text-swiss-muted dark:text-[#a3a3a3] mb-1">
                  Major / Degree
                </label>
                <input
                  type="text"
                  value={formData.course}
                  onChange={(e) => setFormData({ ...formData, course: e.target.value })}
                  placeholder="e.g. B.Tech CSE"
                  className="w-full px-3.5 py-2.5 bg-white dark:bg-[#171717] rounded-lg border border-swiss-border dark:border-[#262626] text-sm text-swiss-black dark:text-white focus:outline-none focus:border-swiss-black dark:focus:border-white transition-colors"
                />
              </div>

              <div>
                <label className="block text-[11px] font-mono font-bold uppercase tracking-wider text-swiss-muted dark:text-[#a3a3a3] mb-1">
                  Institution
                </label>
                <input
                  type="text"
                  value={formData.college}
                  onChange={(e) => setFormData({ ...formData, college: e.target.value })}
                  placeholder="e.g. National Institute"
                  className="w-full px-3.5 py-2.5 bg-white dark:bg-[#171717] rounded-lg border border-swiss-border dark:border-[#262626] text-sm text-swiss-black dark:text-white focus:outline-none focus:border-swiss-black dark:focus:border-white transition-colors"
                />
              </div>
            </div>

            {/* Submit */}
            <Button
              type="submit"
              variant="primary"
              size="lg"
              loading={isSubmitting}
              icon={ArrowRight}
              iconPosition="right"
              className="w-full mt-3"
            >
              {isSubmitting ? 'Creating Account...' : 'Create Account'}
            </Button>
          </form>

          {/* Link to Login */}
          <div className="text-center pt-3 border-t border-swiss-border dark:border-[#262626]">
            <p className="text-xs text-[#737373]">
              Already have an account?{' '}
              <Link
                to="/login"
                className="font-bold text-crimson hover:underline font-headline uppercase tracking-wider text-[11px]"
              >
                Login
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
