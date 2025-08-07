import React from 'react';
import { Agent1TestInterface } from '../components/Agent1TestInterface';
import { useAuth } from '../contexts/AuthContext';

export const Agent1Test: React.FC = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-brutalist-light-gray dark:bg-brutalist-dark-gray font-space-grotesk flex items-center justify-center">
        <div className="brutal-card p-8 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-electric-500 mx-auto mb-4"></div>
          <p className="text-brutalist-black dark:text-brutalist-white">Loading Agent 1...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-brutalist-light-gray dark:bg-brutalist-dark-gray font-space-grotesk flex items-center justify-center">
        <div className="brutal-card p-8 text-center">
          <h2 className="text-2xl font-black text-brutalist-black dark:text-brutalist-white mb-4">
            AUTHENTICATION REQUIRED
          </h2>
          <p className="text-brutalist-gray mb-6">
            Please sign in to test Agent 1 (Parser CRM)
          </p>
          <a 
            href="/auth" 
            className="inline-block bg-electric-500 text-brutalist-black px-6 py-3 font-bold uppercase border-2 border-brutalist-black hover:shadow-brutal-hover transform hover:-translate-x-1 hover:-translate-y-1 transition-all"
          >
            Sign In
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-brutalist-light-gray dark:bg-brutalist-dark-gray font-space-grotesk">
      <Agent1TestInterface />
    </div>
  );
};