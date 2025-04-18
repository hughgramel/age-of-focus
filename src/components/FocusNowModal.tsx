'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { FOCUS_ACTIONS, ActionType, calculateActionsFromDuration, getRandomAction } from '@/data/actions';
import FocusTimer from './FocusTimer';
import { SessionService } from '@/services/sessionService';
import { Session } from '@/types/session';

interface FocusNowModalProps {
  userId: string;
  onClose: () => void;
  hasActiveSession?: boolean;
}

const FocusNowModal: React.FC<FocusNowModalProps> = ({ userId, onClose, hasActiveSession = false }) => {
  const router = useRouter();
  const [sessionStarted, setSessionStarted] = useState(false);
  const [duration, setDuration] = useState(60); // Default: 60 minutes
  const [selectedActions, setSelectedActions] = useState<ActionType[]>([]);
  const [processedActions, setProcessedActions] = useState<ActionType[]>([]);
  const [activeSession, setActiveSession] = useState<Session | null>(null);
  const [isLoadingSession, setIsLoadingSession] = useState(true);
  
  // Calculate number of actions based on duration
  const actionCount = calculateActionsFromDuration(duration);
  
  // Load active session if hasActiveSession is true
  useEffect(() => {
    if (hasActiveSession) {
      const loadActiveSession = async () => {
        try {
          setIsLoadingSession(true);
          const activeSessions = await SessionService.getActiveUserSessions(userId);
          
          if (activeSessions && activeSessions.length > 0) {
            const session = activeSessions[0];
            setActiveSession(session);
            
            // Set duration based on active session
            if (session.planned_minutes) {
              setDuration(session.planned_minutes);
            }
            
            // Set session as started (show timer directly)
            setSessionStarted(true);
          }
        } catch (error) {
          console.error("Error loading active session:", error);
        } finally {
          setIsLoadingSession(false);
        }
      };
      
      loadActiveSession();
    } else {
      setIsLoadingSession(false);
    }
  }, [hasActiveSession, userId]);
  
  // Initialize selected actions array
  useEffect(() => {
    // Don't reset if we have an active session
    if (hasActiveSession) return;
    
    // Reset selected actions when duration changes
    const initialActions: ActionType[] = Array(actionCount).fill('auto');
    setSelectedActions(initialActions);
  }, [actionCount, hasActiveSession]);

  // Handle action selection change
  const handleActionChange = (index: number, actionType: ActionType) => {
    const updatedActions = [...selectedActions];
    updatedActions[index] = actionType;
    setSelectedActions(updatedActions);
  };

  // Handle duration change
  const handleDurationChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setDuration(parseInt(event.target.value));
  };

  // Start focus session
  const startFocusSession = async () => {
    // Process 'auto' selections before starting
    const actions = selectedActions.map(action => 
      action === 'auto' ? getRandomAction().id : action
    );
    
    // Save processed actions to state so they can be passed to the FocusTimer
    setProcessedActions(actions);
    console.log("Selected actions before starting:", selectedActions);
    console.log("Processed actions to pass to timer:", actions);
    
    try {
      // Check for existing sessions
      const existingSessions = await SessionService.getActiveUserSessions(userId);
      
      // If there's an active session, close it first
      if (existingSessions.length > 0) {
        const activeSession = existingSessions[0];
        await SessionService.updateSession(activeSession.id, {
          session_state: 'complete',
          total_minutes_done: 0
        });
      }
      
      // Start the timer
      setSessionStarted(true);
    } catch (error) {
      console.error('Error preparing session:', error);
    }
  };

  // Handle session completion
  const handleSessionComplete = (minutesElapsed: number) => {
    // Close the modal
    onClose();
  };

  if (isLoadingSession) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-[2px] bg-opacity-0">
        <div className="absolute inset-0 bg-black opacity-40 z-0"></div>
        <div className="relative z-10 bg-[#1F1F1F] bg-opacity-80 rounded-lg border border-[#FFD78C20] text-[#FFD78C] p-8 shadow-xl max-w-4xl w-full max-h-[90vh] flex items-center justify-center">
          <p className="text-lg">Loading session...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-[2px] bg-opacity-0">
      <div 
        className="absolute inset-0 bg-black opacity-40 z-0"
        onClick={onClose}
      ></div>
      
      <div className="relative z-10 bg-[#1F1F1F] bg-opacity-80 rounded-lg border border-[#FFD78C20] text-[#FFD78C] p-8 shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
           style={{ 
             backdropFilter: 'blur(4px)',
             boxShadow: '0 0 30px rgba(0, 0, 0, 0.5), 0 0 15px rgba(255, 215, 140, 0.2)',
           }}
      >
        {/* Close button */}
        <button 
          className="absolute top-4 right-4 text-gray-400 hover:text-[#FFD78C] transition-colors duration-200"
          onClick={onClose}
        >
          ✕
        </button>
        
        {!sessionStarted ? (
          <>
            <div className="flex items-center mb-8">
              <div className="mr-6">
                <img src="/clock-icon.png" alt="Clock" className="w-24 h-24 opacity-80" 
                     onError={(e) => {
                       const target = e.target as HTMLImageElement;
                       target.style.display = 'none';
                     }} />
              </div>
              <div>
                <h2 className="text-3xl font-bold mb-2">Focus Now</h2>
                <p className="text-gray-400">Set up your focus session to gain action points</p>
              </div>
            </div>
            
            {/* Session configuration */}
            <div className="mb-8">
              <div className="mb-6">
                <label className="block text-lg font-semibold mb-2">Session Duration</label>
                <select 
                  value={duration} 
                  onChange={handleDurationChange}
                  className="bg-[#2A2A2A] text-[#FFD78C] border border-[#FFD78C40] rounded px-4 py-2 w-full focus:outline-none focus:ring-2 focus:ring-[#FFD78C40]"
                >
                  <option value="15">15 minutes</option>
                  <option value="30">30 minutes</option>
                  <option value="45">45 minutes</option>
                  <option value="60">1 hour</option>
                  <option value="90">1.5 hours</option>
                  <option value="120">2 hours</option>
                  <option value="180">3 hours</option>
                  <option value="240">4 hours</option>
                </select>
                <p className="text-gray-400 mt-2">
                  This session will grant you {actionCount} action{actionCount !== 1 ? 's' : ''}
                </p>
              </div>
              
              <div>
                <label className="block text-lg font-semibold mb-4">Choose your actions</label>
                <div className="space-y-4">
                  {Array.from({ length: actionCount }, (_, i) => (
                    <div key={i} className="flex items-center">
                      <span className="mr-4 text-xl">Action {i + 1}</span>
                      <select 
                        value={selectedActions[i] || 'auto'} 
                        onChange={(e) => handleActionChange(i, e.target.value as ActionType)}
                        className="bg-[#2A2A2A] text-[#FFD78C] border border-[#FFD78C40] rounded px-4 py-2 w-full focus:outline-none focus:ring-2 focus:ring-[#FFD78C40]"
                      >
                        <option value="auto">Auto (Random)</option>
                        {FOCUS_ACTIONS.filter(action => action.id !== 'auto').map(action => (
                          <option key={action.id} value={action.id}>
                            {action.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            
            <div className="flex items-center mt-8">
              <div className="flex-1 text-gray-400">
                <p className="mb-2">⚠️ Note:</p>
                <p>If you complete the full session, all actions will be executed.</p>
                <p>If you end early, only the first action will be executed.</p>
              </div>
              <button 
                className="px-8 py-3 bg-[#FFD78C] text-[#1F1F1F] rounded-lg font-bold text-xl hover:bg-[#E5C073] transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-[#FFD78C]"
                onClick={startFocusSession}
              >
                START
              </button>
            </div>
          </>
        ) : (
          <div className="h-full">
            {activeSession ? (
              // Resume existing session
              <div className="text-center mb-4">
                <h2 className="text-2xl font-bold mb-4">Resuming Active Session</h2>
                <p className="text-gray-400 mb-6">Your focus session is already in progress</p>
              </div>
            ) : null}
            
            <FocusTimer 
              userId={userId} 
              initialDuration={duration * 60} // Convert to seconds
              onSessionComplete={handleSessionComplete}
              selectedActions={processedActions.length > 0 ? processedActions : selectedActions}
              existingSessionId={activeSession?.id}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default FocusNowModal; 