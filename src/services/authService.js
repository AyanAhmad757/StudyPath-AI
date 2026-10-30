import { supabase, isSupabaseConfigured } from './supabase';

const MOCK_STORAGE_KEY = 'friday_auth_user';

export const authService = {
  /**
   * Sign up with email, password, and student metadata
   */
  async signUp(email, password, metadata = {}) {
    if (!isSupabaseConfigured()) {
      // Mock Fallback
      const mockUser = {
        id: 'mock-user-' + Date.now(),
        email,
        user_metadata: {
          full_name: metadata.fullName || metadata.full_name || 'Ayan Ahmad',
          college: metadata.college || 'National Institute of Technology',
          course: metadata.course || 'B.Tech CSE',
          semester: metadata.semester || '6th Semester',
          career_goal: metadata.careerGoal || metadata.career_goal || 'Full Stack Developer',
        },
      };
      localStorage.setItem(MOCK_STORAGE_KEY, JSON.stringify(mockUser));
      return { data: { user: mockUser, session: { user: mockUser } }, error: null };
    }

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: metadata.fullName || metadata.full_name || '',
            college: metadata.college || 'National Institute of Technology',
            course: metadata.course || 'B.Tech CSE',
            semester: metadata.semester || '6th Semester',
            career_goal: metadata.careerGoal || metadata.career_goal || 'Full Stack Developer',
            avatar_url: metadata.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
          },
        },
      });

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error signing up:', error.message);
      return { data: null, error };
    }
  },

  /**
   * Sign in with email and password
   */
  async signIn(email, password) {
    if (!isSupabaseConfigured()) {
      // Mock Fallback
      const existing = localStorage.getItem(MOCK_STORAGE_KEY);
      const mockUser = existing
        ? JSON.parse(existing)
        : {
            id: 'mock-user-1',
            email,
            user_metadata: {
              full_name: 'Ayan Ahmad',
              college: 'National Institute of Technology',
              course: 'B.Tech CSE',
              semester: '6th Semester',
              career_goal: 'Full Stack Developer',
            },
          };
      localStorage.setItem(MOCK_STORAGE_KEY, JSON.stringify(mockUser));
      return { data: { user: mockUser, session: { user: mockUser } }, error: null };
    }

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error signing in:', error.message);
      return { data: null, error };
    }
  },

  /**
   * Sign out current user
   */
  async signOut() {
    if (!isSupabaseConfigured()) {
      localStorage.removeItem(MOCK_STORAGE_KEY);
      return { error: null };
    }

    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      return { error: null };
    } catch (error) {
      console.error('Error signing out:', error.message);
      return { error };
    }
  },

  /**
   * Get current authenticated session
   */
  async getSession() {
    if (!isSupabaseConfigured()) {
      const existing = localStorage.getItem(MOCK_STORAGE_KEY);
      if (existing) {
        const user = JSON.parse(existing);
        return { session: { user }, error: null };
      }
      return { session: null, error: null };
    }

    try {
      const { data, error } = await supabase.auth.getSession();
      if (error) throw error;
      return { session: data.session, error: null };
    } catch (error) {
      console.error('Error getting session:', error.message);
      return { session: null, error };
    }
  },

  /**
   * Get current authenticated user
   */
  async getCurrentUser() {
    if (!isSupabaseConfigured()) {
      const existing = localStorage.getItem(MOCK_STORAGE_KEY);
      return existing ? JSON.parse(existing) : null;
    }

    try {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error) throw error;
      return user;
    } catch (error) {
      console.error('Error getting current user:', error.message);
      return null;
    }
  },

  /**
   * Fetch profile record from public.profiles
   */
  async getProfile(userId) {
    if (!isSupabaseConfigured()) {
      const existing = localStorage.getItem(MOCK_STORAGE_KEY);
      if (existing) {
        const u = JSON.parse(existing);
        return {
          id: u.id,
          full_name: u.user_metadata?.full_name || 'Ayan Ahmad',
          college: u.user_metadata?.college || 'National Institute of Technology',
          course: u.user_metadata?.course || 'B.Tech CSE',
          semester: u.user_metadata?.semester || '6th Semester',
          career_goal: u.user_metadata?.career_goal || 'Full Stack Developer',
          avatar_url: u.user_metadata?.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
        };
      }
      return null;
    }

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        // If profile row doesn't exist yet, return metadata fallback
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          return {
            id: user.id,
            full_name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'Student',
            college: user.user_metadata?.college || 'National Institute of Technology',
            course: user.user_metadata?.course || 'B.Tech CSE',
            semester: user.user_metadata?.semester || '6th Semester',
            career_goal: user.user_metadata?.career_goal || 'Full Stack Developer',
            avatar_url: user.user_metadata?.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
          };
        }
        return null;
      }
      return data;
    } catch (error) {
      console.error('Error fetching profile:', error.message);
      return null;
    }
  },

  /**
   * Update student profile in public.profiles
   */
  async updateProfile(userId, profileData) {
    if (!isSupabaseConfigured()) {
      const existing = localStorage.getItem(MOCK_STORAGE_KEY);
      if (existing) {
        const u = JSON.parse(existing);
        u.user_metadata = { ...u.user_metadata, ...profileData };
        localStorage.setItem(MOCK_STORAGE_KEY, JSON.stringify(u));
      }
      return { data: profileData, error: null };
    }

    try {
      const payload = {
        full_name: profileData.full_name || profileData.name,
        college: profileData.college,
        course: profileData.course,
        semester: profileData.semester,
        career_goal: profileData.career_goal || profileData.careerGoal,
        avatar_url: profileData.avatar_url || profileData.avatar,
        updated_at: new Date().toISOString(),
      };

      const { data, error } = await supabase
        .from('profiles')
        .upsert({ id: userId, ...payload })
        .select()
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error updating profile:', error.message);
      return { data: null, error };
    }
  },

  /**
   * Listen to auth state changes
   */
  onAuthStateChange(callback) {
    if (!isSupabaseConfigured()) {
      return { data: { subscription: { unsubscribe: () => {} } } };
    }
    return supabase.auth.onAuthStateChange(callback);
  },
};

export default authService;
