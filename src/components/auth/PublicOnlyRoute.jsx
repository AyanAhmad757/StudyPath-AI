import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

/**
 * Route guard that redirects already authenticated users away from Login/Signup to Dashboard
 */
export default function PublicOnlyRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-white dark:bg-[#121212] text-swiss-black dark:text-white p-6">
        <div className="w-10 h-10 rounded-lg bg-[#fef2f2] dark:bg-crimson/15 text-crimson flex items-center justify-center mb-3 border border-crimson/20">
          <div className="w-5 h-5 border-2 border-crimson border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}
