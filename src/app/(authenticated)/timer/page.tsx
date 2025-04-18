'use client';

import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import FocusTimer from '@/components/FocusTimer';

export default function TimerPage() {
  const { user } = useAuth();
  const router = useRouter();
  
  const handleSessionComplete = (minutesElapsed: number) => {
    router.push('/dashboard');
  };

  return (
    <FocusTimer 
      userId={user?.uid || null}
      initialDuration={60 * 60} // 1 hour
      onSessionComplete={handleSessionComplete}
    />
  );
} 