import { supabase, isSupabaseConfigured } from './supabase';

/**
 * Authentication Service for StudyPath AI
 * 
 * Interacts directly with Supabase Auth:
 * - signUp (with user metadata and profile row creation)
 * - signInWithPassword
 * - signOut
 * - getSession & getUser
 * - resetPasswordForEmail
 * - public.profiles query & updates
 * 
 * Strictly uses real Supabase Auth. No mock sessions or hardcoded credentials.
 */
export const authService = {
  /**
   * Register a new user with email, password, and metadata
   */
  async signUp(email, password, metadata = {}) {
    if (!isSupabaseConfigured() || !supabase) {
      return {
        data: null,
        error: new Error('Supabase is not configured. Please ensure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are set.'),
      };
    }

    try {
      const trimmedEmail = (email || '').trim().toLowerCase();
      const fullName = (metadata.fullName || metadata.full_name || '').trim();

      const { data, error } = await supabase.auth.signUp({
        email: trimmedEmail,
        password,
        options: {
          data: {
            full_name: fullName,
            college: metadata.college || '',
            course: metadata.course || '',
            semester: metadata.semester || '',
            career_goal: metadata.careerGoal || metadata.career_goal || '',
          },
        },
      });

      if (error) throw error;

      // Ensure profile row exists in public.profiles if user was created
      if (data?.user?.id) {
        try {
          await supabase.from('profiles').upsert(
            {
              id: data.user.id,
              full_name: fullName || trimmedEmail.split('@')[0],
              college: metadata.college || null,
              course: metadata.course || null,
              semester: metadata.semester || null,
              career_goal: metadata.careerGoal || metadata.career_goal || null,
              updated_at: new Date().toISOString(),
            },
            { onConflict: 'id' }
          );
        } catch (profileErr) {
          console.warn('[authService.signUp] Profile upsert notice:', profileErr.message);
        }
      }

      return { data, error: null };
    } catch (error) {
      console.error('[authService.signUp] Error:', error.message);
      return { data: null, error };
    }
  },

  /**
   * Sign in with registered email and password
   */
  async signIn(email, password) {
    if (!isSupabaseConfigured() || !supabase) {
      return {
        data: null,
        error: new Error('Supabase is not configured. Please ensure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are set.'),
      };
    }

    try {
      const trimmedEmail = (email || '').trim().toLowerCase();
      const { data, error } = await supabase.auth.signInWithPassword({
        email: trimmedEmail,
        password,
      });

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('[authService.signIn] Error:', error.message);
      return { data: null, error };
    }
  },

  /**
   * Terminate current Supabase session
   */
  async signOut() {
    if (!isSupabaseConfigured() || !supabase) {
      return { error: null };
    }

    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      return { error: null };
    } catch (error) {
      console.error('[authService.signOut] Error:', error.message);
      return { error };
    }
  },

  /**
   * Retrieve current Supabase session
   */
  async getSession() {
    if (!isSupabaseConfigured() || !supabase) {
      return { session: null, error: null };
    }

    try {
      const { data, error } = await supabase.auth.getSession();
      if (error) throw error;
      return { session: data?.session || null, error: null };
    } catch (error) {
      console.error('[authService.getSession] Error:', error.message);
      return { session: null, error };
    }
  },

  /**
   * Retrieve current authenticated user record
   */
  async getCurrentUser() {
    if (!isSupabaseConfigured() || !supabase) {
      return null;
    }

    try {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error) throw error;
      return user || null;
    } catch (error) {
      console.error('[authService.getCurrentUser] Error:', error.message);
      return null;
    }
  },

  /**
   * Fetch user profile from public.profiles
   */
  async getProfile(userId) {
    if (!userId || !isSupabaseConfigured() || !supabase) {
      return null;
    }

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (error) {
        console.warn('[authService.getProfile] Database query note:', error.message);
      }

      if (data) {
        return data;
      }

      // If no row exists yet in public.profiles, construct from user metadata and save
      const { data: { user } } = await supabase.auth.getUser();
      if (user && user.id === userId) {
        const fallbackProfile = {
          id: user.id,
          full_name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'Student',
          college: user.user_metadata?.college || '',
          course: user.user_metadata?.course || '',
          semester: user.user_metadata?.semester || '',
          career_goal: user.user_metadata?.career_goal || '',
          avatar_url: user.user_metadata?.avatar_url || '',
          updated_at: new Date().toISOString(),
        };

        try {
          await supabase.from('profiles').upsert(fallbackProfile, { onConflict: 'id' });
        } catch (_) {}

        return fallbackProfile;
      }

      return null;
    } catch (error) {
      console.error('[authService.getProfile] Error:', error.message);
      return null;
    }
  },

  /**
   * Update student profile fields in public.profiles
   */
  async updateProfile(userId, profileData) {
    if (!userId || !isSupabaseConfigured() || !supabase) {
      return {
        data: null,
        error: new Error('Cannot update profile: Supabase is not configured or user is unauthenticated.'),
      };
    }

    try {
      const payload = {
        id: userId,
        full_name: profileData.full_name || profileData.name || '',
        college: profileData.college || '',
        course: profileData.course || '',
        semester: profileData.semester || '',
        career_goal: profileData.career_goal || profileData.careerGoal || '',
        avatar_url: profileData.avatar_url || profileData.avatar || '',
        updated_at: new Date().toISOString(),
      };

      const { data, error } = await supabase
        .from('profiles')
        .upsert(payload, { onConflict: 'id' })
        .select()
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('[authService.updateProfile] Error:', error.message);
      return { data: null, error };
    }
  },

  /**
   * Send password reset email via Supabase Auth
   */
  async resetPassword(email) {
    if (!isSupabaseConfigured() || !supabase) {
      return {
        data: null,
        error: new Error('Supabase is not configured.'),
      };
    }

    try {
      const trimmedEmail = (email || '').trim().toLowerCase();
      const redirectUrl = `${window.location.origin}/login`;
      const { data, error } = await supabase.auth.resetPasswordForEmail(trimmedEmail, {
        redirectTo: redirectUrl,
      });

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('[authService.resetPassword] Error:', error.message);
      return { data: null, error };
    }
  },

  /**
   * Resend signup email confirmation link
   */
  async resendConfirmationEmail(email) {
    if (!isSupabaseConfigured() || !supabase) {
      return {
        data: null,
        error: new Error('Supabase is not configured.'),
      };
    }

    try {
      const trimmedEmail = (email || '').trim().toLowerCase();
      const { data, error } = await supabase.auth.resend({
        type: 'signup',
        email: trimmedEmail,
        options: {
          emailRedirectTo: `${window.location.origin}/dashboard`,
        },
      });

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('[authService.resendConfirmationEmail] Error:', error.message);
      return { data: null, error };
    }
  },

  /**
   * Listen to active auth state changes
   */
  onAuthStateChange(callback) {
    if (!isSupabaseConfigured() || !supabase) {
      return { data: { subscription: { unsubscribe: () => {} } } };
    }
    return supabase.auth.onAuthStateChange(callback);
  },
};

export default authService;
