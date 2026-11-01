import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useApp } from '../context/AppContext';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import {
  User,
  Mail,
  School,
  Compass,
  Save,
  Camera,
} from 'lucide-react';

export default function ProfilePage() {
  const { user, profile, updateProfile } = useAuth();
  const { showToast } = useApp();

  const [formData, setFormData] = useState({
    name: profile?.full_name || user?.user_metadata?.full_name || '',
    email: user?.email || '',
    college: profile?.college || user?.user_metadata?.institution || '',
    course: profile?.course || user?.user_metadata?.degree || '',
    year: '1st Year',
    semester: profile?.semester || '1st Semester',
    careerGoal: profile?.career_goal || '',
  });

  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (profile || user) {
      setFormData((prev) => ({
        ...prev,
        name: profile?.full_name || user?.user_metadata?.full_name || prev.name,
        email: user?.email || prev.email,
        college: profile?.college || user?.user_metadata?.institution || prev.college,
        course: profile?.course || user?.user_metadata?.degree || prev.course,
        semester: profile?.semester || prev.semester,
        careerGoal: profile?.career_goal || prev.careerGoal,
      }));
    }
  }, [profile, user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    await updateProfile({
      full_name: formData.name,
      college: formData.college,
      course: formData.course,
      semester: formData.semester,
      career_goal: formData.careerGoal,
    });
    setSaving(false);
    showToast('Profile updated successfully.', 'success');
  };

  return (
    <div className="space-y-6 sm:space-y-8 animate-fadeIn max-w-6xl mx-auto">
      <div>
        <div className="flex items-center gap-2 mb-1">
          <span className="text-[10px] font-mono uppercase tracking-widest text-crimson bg-[#fef2f2] dark:bg-crimson/10 border border-crimson/20 px-2 py-0.5 rounded">
            Student Telemetry
          </span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-headline font-bold text-swiss-black dark:text-white tracking-tight">
          Student Profile
        </h1>
        <p className="text-xs sm:text-sm text-[#737373] mt-0.5">
          Manage your academic credentials, institutional enrollment, and career trajectory.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Column: Avatar & Summary Card */}
        <Card className="p-6 text-center flex flex-col items-center justify-center space-y-4">
          <div className="relative group">
            {profile?.avatar_url || user?.user_metadata?.avatar_url ? (
              <img
                src={profile?.avatar_url || user?.user_metadata?.avatar_url}
                alt={formData.name || 'User'}
                className="w-28 h-28 rounded-lg object-cover border border-swiss-border dark:border-[#262626]"
              />
            ) : (
              <div className="w-28 h-28 rounded-lg bg-[#0a0a0a] dark:bg-white text-white dark:text-[#0a0a0a] flex items-center justify-center font-headline text-3xl font-bold border border-swiss-border dark:border-[#262626]">
                {(formData.name || user?.email || 'S')[0]?.toUpperCase()}
              </div>
            )}
            <button
              type="button"
              onClick={() => showToast('Avatar upload ready to connect to storage API', 'info')}
              className="absolute -bottom-2 -right-2 p-2 rounded-lg bg-crimson text-white hover:bg-crimson-hover transition-colors"
              title="Change Avatar"
            >
              <Camera className="w-3.5 h-3.5" />
            </button>
          </div>

          <div>
            <h3 className="text-base font-headline font-bold text-swiss-black dark:text-white">
              {formData.name}
            </h3>
            <p className="text-xs text-[#737373] font-mono mt-0.5">
              {formData.course} • {formData.year}
            </p>
          </div>

          <div className="w-full pt-4 border-t border-swiss-border dark:border-[#262626] space-y-2 text-xs text-left">
            <div className="flex justify-between text-[#737373]">
              <span className="font-mono uppercase text-[11px]">Enrollment:</span>
              <span className="font-bold text-swiss-black dark:text-white tabular-nums">Aug 2023</span>
            </div>
            <div className="flex justify-between text-[#737373]">
              <span className="font-mono uppercase text-[11px]">Target Role:</span>
              <span className="font-bold text-crimson">{formData.careerGoal}</span>
            </div>
          </div>
        </Card>

        {/* Right Column (2 spans): Edit Form */}
        <div className="md:col-span-2">
          <Card className="p-6 sm:p-8">
            <form onSubmit={handleSubmit} className="space-y-4">
              <h3 className="text-sm font-headline font-bold uppercase tracking-wider text-swiss-black dark:text-white pb-2 border-b border-swiss-border dark:border-[#262626]">
                Academic & Personal Telemetry
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-mono font-bold uppercase tracking-wider text-swiss-muted dark:text-[#a3a3a3] mb-1.5">
                    Full Legal Name
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-[#737373] absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-[#171717] rounded-lg border border-swiss-border dark:border-[#262626] text-sm text-swiss-black dark:text-white placeholder-[#a3a3a3] focus:outline-none focus:border-swiss-black dark:focus:border-white transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-mono font-bold uppercase tracking-wider text-swiss-muted dark:text-[#a3a3a3] mb-1.5">
                    College Identifier (Email)
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-[#737373] absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      disabled
                      value={formData.email}
                      className="w-full pl-10 pr-4 py-2.5 bg-swiss-surface dark:bg-[#1f1f1f] rounded-lg border border-swiss-border dark:border-[#262626] text-sm text-[#737373] cursor-not-allowed font-mono"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-mono font-bold uppercase tracking-wider text-swiss-muted dark:text-[#a3a3a3] mb-1.5">
                  Institutional Academy Name
                </label>
                <div className="relative">
                  <School className="w-4 h-4 text-[#737373] absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={formData.college}
                    onChange={(e) => setFormData({ ...formData, college: e.target.value })}
                    className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-[#171717] rounded-lg border border-swiss-border dark:border-[#262626] text-sm text-swiss-black dark:text-white focus:outline-none focus:border-swiss-black dark:focus:border-white transition-colors"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-[11px] font-mono font-bold uppercase tracking-wider text-swiss-muted dark:text-[#a3a3a3] mb-1.5">
                    Branch Curriculum
                  </label>
                  <input
                    type="text"
                    value={formData.course}
                    onChange={(e) => setFormData({ ...formData, course: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-white dark:bg-[#171717] rounded-lg border border-swiss-border dark:border-[#262626] text-sm text-swiss-black dark:text-white focus:outline-none focus:border-swiss-black dark:focus:border-white transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-mono font-bold uppercase tracking-wider text-swiss-muted dark:text-[#a3a3a3] mb-1.5">
                    Academic Year
                  </label>
                  <input
                    type="text"
                    value={formData.year}
                    onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-white dark:bg-[#171717] rounded-lg border border-swiss-border dark:border-[#262626] text-sm text-swiss-black dark:text-white focus:outline-none focus:border-swiss-black dark:focus:border-white transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-mono font-bold uppercase tracking-wider text-swiss-muted dark:text-[#a3a3a3] mb-1.5">
                    Term / Semester
                  </label>
                  <input
                    type="text"
                    value={formData.semester}
                    onChange={(e) => setFormData({ ...formData, semester: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-white dark:bg-[#171717] rounded-lg border border-swiss-border dark:border-[#262626] text-sm text-swiss-black dark:text-white focus:outline-none focus:border-swiss-black dark:focus:border-white transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-mono font-bold uppercase tracking-wider text-swiss-muted dark:text-[#a3a3a3] mb-1.5">
                  Primary Career Pathway
                </label>
                <div className="relative">
                  <Compass className="w-4 h-4 text-[#737373] absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={formData.careerGoal}
                    onChange={(e) => setFormData({ ...formData, careerGoal: e.target.value })}
                    className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-[#171717] rounded-lg border border-swiss-border dark:border-[#262626] text-sm text-swiss-black dark:text-white focus:outline-none focus:border-swiss-black dark:focus:border-white transition-colors"
                  />
                </div>
              </div>

              <div className="pt-4 flex justify-end">
                <Button
                  type="submit"
                  variant="primary"
                  size="md"
                  loading={saving}
                  icon={Save}
                >
                  Save Telemetry
                </Button>
              </div>
            </form>
          </Card>
        </div>
      </div>
    </div>
  );
}
