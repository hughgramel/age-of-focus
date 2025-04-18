'use client';

import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import FocusTimer from '@/components/FocusTimer';

export default function TimerPage() {
  const { user } = useAuth();
  const router = useRouter();
  
  const handleSessionComplete = (minutesElapsed: number) => {
    console.log("Session completed with", minutesElapsed, "minutes");
    // User will navigate using the button, no automatic redirect
  };

  return (
    <div className="container mx-auto">
      <FocusTimer 
        userId={user?.uid || null}
        initialDuration={60 * 60} // 1 hour
        onSessionComplete={handleSessionComplete}
      />
    </div>
  );
} 