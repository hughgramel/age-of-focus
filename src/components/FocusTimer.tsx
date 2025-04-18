'use client';

import { useFocusSession } from '@/hooks/useFocusSession';
import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { FocusSessionService } from '@/services/focusSessionService';
import { FocusSessionState } from '@/lib/FocusSessionManager';

interface FocusTimerProps {
  initialFocusDuration?: number;
  initialRewardInterval?: number;
  initialRewardAmount?: number;
  onSessionComplete?: () => void;
}

export function FocusTimer({
  initialFocusDuration = 25, // Default to 25 minutes
  initialRewardInterval = 5, // Earn reward every 5 minutes
  initialRewardAmount = 5, // 5 minute break as reward
  onSessionComplete
}: FocusTimerProps) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // State for persisting to Firebase
  const [saveState, setSaveState] = useState({
    lastSaved: new Date(),
    isSaving: false,
    saveError: null as string | null
  });

  // Initialize the session hook
  const focusSession = useFocusSession({
    focusDuration: initialFocusDuration,
    rewardInterval: initialRewardInterval,
    rewardAmount: initialRewardAmount,
    onSessionEnd: (state) => {
      console.log('Session ended:', state);
      if (onSessionComplete) {
        onSessionComplete();
      }

      // Save the session to Firebase
      if (user) {
        saveSessionToFirebase(state);
      }
    }
  });

  // Format time functions
  const formatTimeMinSec = (minutes: number): string => {
    const mins = Math.floor(Math.abs(minutes));
    const secs = Math.floor((Math.abs(minutes) - mins) * 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  // Save the session state to Firebase
  const saveSessionToFirebase = async (state: FocusSessionState) => {
    if (!user) return;

    try {
      setSaveState(prev => ({ ...prev, isSaving: true, saveError: null }));
      
      // Save the completed session to the focusSessions collection
      await FocusSessionService.saveSession({
        userId: user.uid,
        timestamp: new Date(),
        duration: initialFocusDuration,
        elapsedFocus: state.elapsedFocus,
        breakTimeAwarded: state.breakTimeAwarded,
        breakBank: state.breakBank,
        wasCompleted: state.remainingFocus <= 0,
        actionPointsAwarded: 2 // Default to 2 AP per completed session
      });

      setSaveState({
        lastSaved: new Date(),
        isSaving: false,
        saveError: null
      });
    } catch (err) {
      console.error('Error saving session:', err);
      setSaveState(prev => ({
        ...prev,
        isSaving: false,
        saveError: err instanceof Error ? err.message : 'Unknown error saving session'
      }));
    }
  };

  // Save active session
  const saveActiveSession = async () => {
    if (!user) return;

    try {
      const state = focusSession.getState();
      
      await FocusSessionService.saveActiveSession(user.uid, {
        state: {
          ...state,
          lastUpdated: new Date()
        },
        config: {
          focusDuration: initialFocusDuration,
          rewardInterval: initialRewardInterval,
          rewardAmount: initialRewardAmount
        }
      });
      
      console.log("Active session saved");
    } catch (err) {
      console.error('Error saving active session:', err);
    }
  };

  // Periodically save active session when running
  useEffect(() => {
    if (!user || !focusSession.isRunning) return;
    
    // Save active session every 30 seconds
    const saveInterval = setInterval(saveActiveSession, 30 * 1000);
    
    return () => clearInterval(saveInterval);
  }, [user, focusSession.isRunning]);

  // Save active session when paused
  useEffect(() => {
    if (!user) return;
    
    if (!focusSession.isRunning && focusSession.elapsedFocus > 0) {
      saveActiveSession();
    }
  }, [user, focusSession.isRunning]);

  // Load sessions on mount if user is logged in
  useEffect(() => {
    const loadSessionData = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        
        // Check for an active session
        const activeSession = await FocusSessionService.getActiveSession(user.uid);
        
        if (activeSession) {
          console.log('Found active session:', activeSession);
          // You could restore the session state here if needed
        }
        
        setLoading(false);
      } catch (err) {
        console.error('Error loading session data:', err);
        setError(err instanceof Error ? err.message : 'Unknown error loading sessions');
        setLoading(false);
      }
    };

    loadSessionData();
  }, [user]);

  // Timer progress calculation
  const calculateProgress = (): number => {
    if (focusSession.isBreak) {
      const total = initialRewardAmount;
      const current = focusSession.remainingBreak;
      return Math.min(100, Math.max(0, ((total - current) / total) * 100));
    } else {
      const total = initialFocusDuration;
      const current = focusSession.remainingFocus;
      return Math.min(100, Math.max(0, ((total - current) / total) * 100));
    }
  };

  const progress = calculateProgress();

  // Determine what button to show based on state
  const getActionButton = () => {
    if (focusSession.isRunning) {
      return (
        <button 
          onClick={() => {
            focusSession.pause();
            if (user) saveActiveSession();
          }} 
          className="px-6 py-3 bg-amber-600 hover:bg-amber-700 text-white rounded-full font-semibold text-lg transition-colors"
        >
          Pause
        </button>
      );
    } else if (focusSession.remainingFocus < initialFocusDuration || focusSession.isBreak) {
      return (
        <button 
          onClick={focusSession.resume} 
          className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-full font-semibold text-lg transition-colors"
        >
          Resume
        </button>
      );
    } else {
      return (
        <button 
          onClick={focusSession.start} 
          className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-full font-semibold text-lg transition-colors"
        >
          Start Focus
        </button>
      );
    }
  };

  if (loading) {
    return <div className="text-center p-8">Loading timer data...</div>;
  }

  if (error) {
    return <div className="text-center p-8 text-red-500">Error: {error}</div>;
  }

  return (
    <div className="bg-gray-900 rounded-lg p-6 max-w-md mx-auto shadow-xl">
      <div className="flex flex-col items-center">
        {/* Title based on current state */}
        <h2 className="text-2xl font-bold mb-4 text-center">
          {focusSession.isBreak 
            ? '🎉 Break Time!' 
            : '🧠 Focus Session'}
        </h2>
        
        {/* Timer display */}
        <div className="relative w-48 h-48 mb-6">
          {/* Progress ring */}
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
            {/* Background ring */}
            <circle
              cx="50"
              cy="50"
              r="45"
              fill="transparent"
              stroke="#1E293B"
              strokeWidth="10"
            />
            {/* Progress ring */}
            <circle
              cx="50"
              cy="50"
              r="45"
              fill="transparent"
              stroke={focusSession.isBreak ? '#F59E0B' : '#10B981'}
              strokeWidth="10"
              strokeDasharray="283"
              strokeDashoffset={283 - (283 * progress) / 100}
              strokeLinecap="round"
            />
          </svg>
          
          {/* Time remaining */}
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-3xl font-mono font-bold">
              {focusSession.isBreak 
                ? formatTimeMinSec(focusSession.remainingBreak)
                : formatTimeMinSec(focusSession.remainingFocus)}
            </span>
          </div>
        </div>
        
        {/* Action buttons */}
        <div className="flex gap-4 mt-2">
          {getActionButton()}
          
          <button 
            onClick={() => {
              focusSession.reset();
              if (user) FocusSessionService.clearActiveSession(user.uid);
            }} 
            className="px-6 py-3 bg-gray-700 hover:bg-gray-800 text-white rounded-full font-semibold text-lg transition-colors"
          >
            Reset
          </button>
        </div>
        
        {/* Stats section */}
        <div className="mt-8 w-full grid grid-cols-2 gap-4 text-sm">
          <div className="bg-gray-800 p-3 rounded-lg">
            <div className="text-gray-400">Focus time</div>
            <div className="text-xl font-bold">{formatTimeMinSec(focusSession.elapsedFocus)}</div>
          </div>
          
          <div className="bg-gray-800 p-3 rounded-lg">
            <div className="text-gray-400">Break time available</div>
            <div className="text-xl font-bold">{formatTimeMinSec(focusSession.breakBank)}</div>
          </div>
        </div>
        
        {/* Save status message */}
        {saveState.saveError && (
          <div className="mt-4 text-red-500 text-sm">
            Error saving session: {saveState.saveError}
          </div>
        )}
      </div>
    </div>
  );
} 