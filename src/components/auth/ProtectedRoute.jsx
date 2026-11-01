import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-white dark:bg-[#121212] text-swiss-black dark:text-white p-6">
        <div className="w-10 h-10 rounded-lg bg-[#fef2f2] dark:bg-crimson/15 text-crimson flex items-center justify-center mb-3 border border-crimson/20">
          <div className="w-5 h-5 border-2 border-crimson border-t-transparent rounded-full animate-spin" />
        </div>
        <p className="text-xs font-mono font-bold uppercase tracking-widest text-swiss-muted dark:text-[#a3a3a3]">
          Authenticating Session...
        </p>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
}
