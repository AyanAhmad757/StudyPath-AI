import React from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../components/common/Button';
import { Home, ArrowLeft, AlertCircle } from 'lucide-react';

export default function NotFoundPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center p-6 animate-fadeIn">
      <div className="w-14 h-14 rounded-lg bg-crimson-wash dark:bg-crimson/15 text-crimson flex items-center justify-center mb-4 border border-crimson/20">
        <AlertCircle className="w-7 h-7" />
      </div>
      <h1 className="text-4xl sm:text-5xl font-headline font-bold text-swiss-black dark:text-white tracking-tight mb-2">
        404 — Page Not Found
      </h1>
      <p className="text-sm text-swiss-muted dark:text-swiss-border max-w-md mb-6 leading-relaxed font-normal">
        The requested resource is unmapped or has been relocated within the research syllabus. Return to your primary dashboard.
      </p>
      <div className="flex items-center gap-3">
        <Button onClick={() => navigate(-1)} variant="outline" size="md" icon={ArrowLeft}>
          Go Back
        </Button>
        <Button onClick={() => navigate('/dashboard')} variant="primary" size="md" icon={Home}>
          Dashboard Home
        </Button>
      </div>
    </div>
  );
}
