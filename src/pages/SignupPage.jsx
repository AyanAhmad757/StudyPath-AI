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
} from 'lucide-react';

export default function SignupPage() {
  const { signUp, loading } = useAuth();
  const { showToast } = useApp();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    college: 'National Institute of Technology',
    course: 'B.Tech CSE',
    semester: '6th Semester',
  });
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      showToast('Passwords do not match. Please verify.', 'danger');
      return;
    }
    const res = await signUp(formData);
    if (res.success) {
      showToast('Account created successfully! Welcome to Friday AI 🎉', 'success');
      navigate('/dashboard');
    } else {
      showToast(res.error || 'Registration failed. Please check details.', 'danger');
    }
  };

  return (
    <div className="min-h-screen flex bg-swiss-canvas text-swiss-black dark:bg-[#121212] dark:text-swiss-canvas transition-colors">
      {/* Left side: Swiss Architectural Hero Column */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-[#0a0a0a] text-white p-12 flex-col justify-between border-r border-[#262626]">
        <div className="absolute inset-0 bg-[radial-gradient(#262626_1px,transparent_1px)] [background-size:24px_24px] opacity-40 pointer-events-none" />

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
                REGISTRY
              </span>
            </div>
            <p className="text-[11px] font-mono tracking-wider text-[#a3a3a3] uppercase">Academic & Research Platform</p>
          </div>
        </div>

        <div className="relative z-10 max-w-lg space-y-5">
          <span className="text-[11px] font-mono uppercase tracking-widest text-crimson block">
            Student Registration
          </span>
          <h2 className="text-3xl sm:text-4xl font-headline font-bold tracking-tight text-white leading-tight">
            Initiate curriculum telemetry & career benchmarks.
          </h2>
          <p className="text-sm text-[#d4d4d4] leading-relaxed font-normal">
            Upload institutional course syllabi, master core theoretical competencies, and calibrate your engineering trajectory.
          </p>

          <div className="grid grid-cols-2 gap-3 pt-2">
            <div className="p-4 rounded-lg bg-[#171717] border border-[#262626]">
              <span className="text-2xl font-headline font-bold text-white block tabular-nums">100%</span>
              <span className="text-[11px] font-mono uppercase tracking-wider text-[#737373]">Syllabus Coverage</span>
            </div>
            <div className="p-4 rounded-lg bg-[#171717] border border-[#262626]">
              <span className="text-2xl font-headline font-bold text-crimson block tabular-nums">5-PHASE</span>
              <span className="text-[11px] font-mono uppercase tracking-wider text-[#737373]">Career Roadmaps</span>
            </div>
          </div>
        </div>

        <div className="relative z-10 flex items-center justify-between text-[11px] font-mono text-[#737373] uppercase tracking-wider border-t border-[#262626] pt-4">
          <span>Verification Protocol</span>
          <span>Open Academic Standard</span>
        </div>
      </div>

      {/* Right side: Signup Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 overflow-y-auto bg-white dark:bg-[#121212]">
        <div className="w-full max-w-md space-y-5 my-auto">
          <div>
            <span className="text-[11px] font-mono uppercase tracking-widest text-[#737373] block mb-1">
              New Academic Profile
            </span>
            <h2 className="text-2xl sm:text-3xl font-headline font-bold text-swiss-black dark:text-white tracking-tight">
              Create Student Account
            </h2>
            <p className="text-xs sm:text-sm text-[#737373] mt-1">
              Join Friday to accelerate your B.Tech CSE learning trajectory
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3.5">
            {/* Full Name */}
            <div>
              <label className="block text-[11px] font-mono font-bold uppercase tracking-wider text-swiss-muted dark:text-[#a3a3a3] mb-1">
                Full Legal Name
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-[#737373] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  placeholder="Ayan Ahmad"
                  className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-[#171717] rounded-lg border border-swiss-border dark:border-[#262626] text-sm text-swiss-black dark:text-white placeholder-[#a3a3a3] focus:outline-none focus:border-swiss-black dark:focus:border-white transition-colors"
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-[11px] font-mono font-bold uppercase tracking-wider text-swiss-muted dark:text-[#a3a3a3] mb-1">
                Academic Identifier (Email)
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-[#737373] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="student@college.edu"
                  className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-[#171717] rounded-lg border border-swiss-border dark:border-[#262626] text-sm text-swiss-black dark:text-white placeholder-[#a3a3a3] focus:outline-none focus:border-swiss-black dark:focus:border-white transition-colors"
                />
              </div>
            </div>

            {/* Password & Confirm */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-mono font-bold uppercase tracking-wider text-swiss-muted dark:text-[#a3a3a3] mb-1">
                  Security Key
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-[#737373] absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-8 py-2.5 bg-white dark:bg-[#171717] rounded-lg border border-swiss-border dark:border-[#262626] text-sm text-swiss-black dark:text-white placeholder-[#a3a3a3] focus:outline-none focus:border-swiss-black dark:focus:border-white transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#737373]"
                  >
                    {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-mono font-bold uppercase tracking-wider text-swiss-muted dark:text-[#a3a3a3] mb-1">
                  Confirm Key
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-[#737373] absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-[#171717] rounded-lg border border-swiss-border dark:border-[#262626] text-sm text-swiss-black dark:text-white placeholder-[#a3a3a3] focus:outline-none focus:border-swiss-black dark:focus:border-white transition-colors"
                  />
                </div>
              </div>
            </div>

            {/* Academic Info */}
            <div className="grid grid-cols-2 gap-3 pt-1">
              <div>
                <label className="block text-[11px] font-mono font-bold uppercase tracking-wider text-swiss-muted dark:text-[#a3a3a3] mb-1">
                  Curriculum Track
                </label>
                <input
                  type="text"
                  value={formData.course}
                  onChange={(e) => setFormData({ ...formData, course: e.target.value })}
                  placeholder="B.Tech CSE"
                  className="w-full px-3.5 py-2.5 bg-white dark:bg-[#171717] rounded-lg border border-swiss-border dark:border-[#262626] text-sm text-swiss-black dark:text-white focus:outline-none focus:border-swiss-black dark:focus:border-white transition-colors"
                />
              </div>

              <div>
                <label className="block text-[11px] font-mono font-bold uppercase tracking-wider text-swiss-muted dark:text-[#a3a3a3] mb-1">
                  Current Term
                </label>
                <input
                  type="text"
                  value={formData.semester}
                  onChange={(e) => setFormData({ ...formData, semester: e.target.value })}
                  placeholder="6th Semester"
                  className="w-full px-3.5 py-2.5 bg-white dark:bg-[#171717] rounded-lg border border-swiss-border dark:border-[#262626] text-sm text-swiss-black dark:text-white focus:outline-none focus:border-swiss-black dark:focus:border-white transition-colors"
                />
              </div>
            </div>

            {/* Submit */}
            <Button
              type="submit"
              variant="primary"
              size="lg"
              loading={loading}
              icon={ArrowRight}
              iconPosition="right"
              className="w-full mt-3"
            >
              Complete Registration
            </Button>
          </form>

          <div className="text-center pt-2">
            <p className="text-xs text-[#737373]">
              Existing student profile?{' '}
              <Link to="/login" className="font-bold text-crimson hover:underline">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
