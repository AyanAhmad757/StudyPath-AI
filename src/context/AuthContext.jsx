import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/authService';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  // Initialize auth session and listen to changes
  useEffect(() => {
    let mounted = true;

    async function initAuth() {
      try {
        const { session: currentSession } = await authService.getSession();
        if (mounted) {
          if (currentSession?.user) {
            setSession(currentSession);
            setUser(currentSession.user);
            const userProf = await authService.getProfile(currentSession.user.id);
            setProfile(userProf);
          } else {
            // Automatically establish genuine session using demo account if unauthenticated
            try {
              const { data: demoAuth } = await authService.signIn('ayan.ahmad@college.edu', 'password123');
              if (demoAuth?.session?.user && mounted) {
                setSession(demoAuth.session);
                setUser(demoAuth.session.user);
                const userProf = await authService.getProfile(demoAuth.session.user.id);
                setProfile(userProf);
                return;
              }
            } catch (_) {}

            // Fallback mock profile if offline
            const defaultDemoUser = {
              id: 'demo-student-1',
              email: 'ayan.ahmad@college.edu',
              user_metadata: {
                full_name: 'Ayan Ahmad',
                college: 'National Institute of Technology',
                course: 'B.Tech CSE',
                semester: '6th Semester',
                career_goal: 'Full Stack Developer',
                avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
              },
            };
            setSession({ user: defaultDemoUser });
            setUser(defaultDemoUser);
            setProfile({
              id: defaultDemoUser.id,
              full_name: defaultDemoUser.user_metadata.full_name,
              college: defaultDemoUser.user_metadata.college,
              course: defaultDemoUser.user_metadata.course,
              semester: defaultDemoUser.user_metadata.semester,
              career_goal: defaultDemoUser.user_metadata.career_goal,
              avatar_url: defaultDemoUser.user_metadata.avatar_url,
            });
          }
        }
      } catch (err) {
        console.error('Error initializing auth:', err);
      } finally {
        if (mounted) setLoading(false);
      }
    }

    initAuth();

    const { data: { subscription } } = authService.onAuthStateChange(async (_event, newSession) => {
      if (!mounted) return;
      setSession(newSession);
      setUser(newSession?.user || null);

      if (newSession?.user) {
        const userProf = await authService.getProfile(newSession.user.id);
        setProfile(userProf);
      } else {
        setProfile(null);
      }
      setLoading(false);
    });

    return () => {
      mounted = false;
      subscription?.unsubscribe?.();
    };
  }, []);

  const signIn = async (email, password) => {
    setLoading(true);
    try {
      const { data, error } = await authService.signIn(email, password);
      if (error) throw error;

      if (data?.user) {
        setUser(data.user);
        setSession(data.session);
        const userProf = await authService.getProfile(data.user.id);
        setProfile(userProf);
      }
      return { success: true };
    } catch (err) {
      return { success: false, error: err.message || 'Authentication failed' };
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (userData) => {
    setLoading(true);
    try {
      const email = userData.email;
      const password = userData.password;
      const metadata = {
        fullName: userData.fullName || userData.full_name,
        college: userData.college,
        course: userData.course,
        semester: userData.semester,
        careerGoal: userData.careerGoal || userData.career_goal,
      };

      const { data, error } = await authService.signUp(email, password, metadata);
      if (error) throw error;

      if (data?.user) {
        setUser(data.user);
        setSession(data.session);
        const userProf = await authService.getProfile(data.user.id);
        setProfile(userProf);
      }
      return { success: true };
    } catch (err) {
      return { success: false, error: err.message || 'Registration failed' };
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    setLoading(true);
    try {
      await authService.signOut();
      setUser(null);
      setSession(null);
      setProfile(null);
    } finally {
      setLoading(false);
    }
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
        login: signIn, // alias
        signUp,
        signup: signUp, // alias
        signOut,
        logout: signOut, // alias
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
