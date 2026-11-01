import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/authService';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  // Initialize auth session and listen to live Supabase changes
  useEffect(() => {
    let mounted = true;

    async function initAuth() {
      try {
        const { session: currentSession, error } = await authService.getSession();
        if (mounted) {
          if (error) {
            console.warn('[AuthContext] Session retrieval notice:', error.message);
          }

          if (currentSession?.user) {
            setSession(currentSession);
            setUser(currentSession.user);
            const userProf = await authService.getProfile(currentSession.user.id);
            if (mounted) setProfile(userProf);
          } else {
            setSession(null);
            setUser(null);
            setProfile(null);
          }
        }
      } catch (err) {
        console.error('[AuthContext] Error initializing auth:', err);
        if (mounted) {
          setSession(null);
          setUser(null);
          setProfile(null);
        }
      } finally {
        if (mounted) setLoading(false);
      }
    }

    initAuth();

    // Listen to real Supabase auth state transitions
    const { data: { subscription } } = authService.onAuthStateChange(async (event, newSession) => {
      if (!mounted) return;

      setSession(newSession || null);
      setUser(newSession?.user || null);

      if (newSession?.user) {
        const userProf = await authService.getProfile(newSession.user.id);
        if (mounted) setProfile(userProf);
      } else {
        if (mounted) setProfile(null);
      }
      setLoading(false);
    });

    return () => {
      mounted = false;
      subscription?.unsubscribe?.();
    };
  }, []);

  /**
   * Real Supabase sign in
   */
  /**
   * Real Supabase sign in
   */
  const signIn = async (email, password) => {
    try {
      const { data, error } = await authService.signIn(email, password);
      if (error) {
        return {
          success: false,
          error: error.message || 'Authentication failed',
          code: error.code || null,
          status: error.status || null,
        };
      }

      if (data?.user) {
        setUser(data.user);
        setSession(data.session);
        // Fetch profile asynchronously without delaying login redirect
        authService.getProfile(data.user.id).then((userProf) => {
          if (userProf) setProfile(userProf);
        }).catch(() => {});
      }
      return { success: true, user: data?.user, session: data?.session };
    } catch (err) {
      return {
        success: false,
        error: err.message || 'Authentication failed',
        code: err.code || null,
        status: err.status || null,
      };
    }
  };

  /**
   * Real Supabase user registration
   */
  const signUp = async (userData) => {
    try {
      const email = userData.email;
      const password = userData.password;
      const metadata = {
        fullName: userData.fullName || userData.full_name || '',
        college: userData.college || '',
        course: userData.course || '',
        semester: userData.semester || '',
        careerGoal: userData.careerGoal || userData.career_goal || '',
      };

      const { data, error } = await authService.signUp(email, password, metadata);
      if (error) {
        return {
          success: false,
          error: error.message || 'Registration failed',
          code: error.code || null,
        };
      }

      // If email confirmation is disabled, session is returned immediately
      if (data?.session && data?.user) {
        setUser(data.user);
        setSession(data.session);
        authService.getProfile(data.user.id).then((userProf) => {
          if (userProf) setProfile(userProf);
        }).catch(() => {});
        return { success: true, needsEmailConfirmation: false };
      }

      // If email confirmation is enabled, user is created but session is null
      return {
        success: true,
        needsEmailConfirmation: Boolean(data?.user && !data?.session),
      };
    } catch (err) {
      return {
        success: false,
        error: err.message || 'Registration failed',
        code: err.code || null,
      };
    }
  };

  /**
   * Real Supabase sign out
   */
  const signOut = async () => {
    try {
      await authService.signOut();
      setUser(null);
      setSession(null);
      setProfile(null);
    } catch (err) {
      console.error('[AuthContext.signOut] Error:', err);
    }
  };

  /**
   * Send password reset email
   */
  const resetPassword = async (email) => {
    return await authService.resetPassword(email);
  };

  /**
   * Resend signup email confirmation
   */
  const resendConfirmationEmail = async (email) => {
    return await authService.resendConfirmationEmail(email);
  };

  const refreshProfile = async () => {
    if (user?.id) {
      const updated = await authService.getProfile(user.id);
      setProfile(updated);
      return updated;
    }
    return null;
  };

  const updateProfile = async (updates) => {
    if (!user?.id) return null;
    const { data, error } = await authService.updateProfile(user.id, updates);
    if (!error && data) {
      setProfile((prev) => ({ ...prev, ...data }));
    }
    return data;
  };

  return (
    <AuthContext.Provider
      value={{
        session,
        user,
        profile,
        isAuthenticated: Boolean(user),
        loading,
        signIn,
        login: signIn,
        signUp,
        signup: signUp,
        signOut,
        logout: signOut,
        resetPassword,
        resendConfirmationEmail,
        refreshProfile,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export default AuthContext;
