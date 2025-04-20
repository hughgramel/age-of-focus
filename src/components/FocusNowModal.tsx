'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { FOCUS_ACTIONS, ActionType, calculateActionsFromDuration, getRandomAction } from '@/data/actions';
import FocusTimer from './FocusTimer';
import { SessionService } from '@/services/sessionService';
import { Session } from '@/types/session';
import { ActionUpdate } from '@/services/actionService';

interface playerNationResourceTotals {
  playerGold: number;
  playerIndustry: number;
  playerPopulation: number;
  playerArmy: number;
}
interface FocusNowModalProps {
  userId: string;
  onClose: () => void;
  hasActiveSession?: boolean;
  executeActionUpdate: (action: Omit<ActionUpdate, 'target'>) => void;
  playerNationResourceTotals: playerNationResourceTotals;
}

const FocusNowModal: React.FC<FocusNowModalProps> = ({ userId, onClose, hasActiveSession = false, executeActionUpdate, playerNationResourceTotals }) => {
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
    const loadActiveSession = async () => {
      try {
        console.log('🔍 Loading active session...', { userId, hasActiveSession });
        setIsLoadingSession(true);
        const activeSessions = await SessionService.getActiveUserSessions(userId);
        console.log('📊 Active sessions found:', activeSessions);
        
        if (activeSessions && activeSessions.length > 0) {
          const session = activeSessions[0];
          console.log('✅ Setting active session:', session);
          setActiveSession(session);
          
          // Set duration based on active session
          if (session.planned_minutes) {
            console.log('⏱️ Setting duration:', session.planned_minutes);
            setDuration(session.planned_minutes);
          }
          
          // Set session as started (show timer directly)
          console.log('🎬 Setting session as started');
          setSessionStarted(true);
          
          // Set selected actions if they exist
          if (session.selected_actions && session.selected_actions.length > 0) {
            console.log('🎯 Setting processed actions:', session.selected_actions);
            setProcessedActions(session.selected_actions);
          }
        } else {
          console.log('❌ No active sessions found');
        }
      } catch (error) {
        console.error("❌ Error loading active session:", error);
      } finally {
        setIsLoadingSession(false);
      }
    };
    
    console.log('🔄 useEffect triggered for loadActiveSession');
    loadActiveSession();
  }, [userId, hasActiveSession]);
  
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
    console.log('🎬 Starting new focus session...');
    // Process 'auto' selections before starting
    const processedActionsList = selectedActions.map(action => 
      action === 'auto' ? getRandomAction().id : action
    );
    
    console.log('🎯 Processed actions:', processedActionsList);
    setProcessedActions(processedActionsList);
    
    try {
      // Check for existing sessions
      const existingSessions = await SessionService.getActiveUserSessions(userId);
      console.log('📊 Existing sessions:', existingSessions);
      
      // If there's an active session, close it first
      if (existingSessions.length > 0) {
        const activeSession = existingSessions[0];
        console.log('⚠️ Closing existing session:', activeSession.id);
        await SessionService.updateSession(activeSession.id, {
          session_state: 'complete',
          total_minutes_done: 0
        });
      }
      
      // Create new session
      const newSession = await SessionService.createSession({
        user_id: userId,
        planned_minutes: duration,
        session_state: 'focus',
        selected_actions: processedActionsList,
        focus_start_time: new Date().toISOString(),
        focus_end_time: new Date(Date.now() + duration * 60 * 1000).toISOString(),
        break_minutes_remaining: Math.floor(duration / 2),
        total_minutes_done: 0
      });

      if (newSession) {
        console.log('✅ New session created:', newSession);
        setActiveSession(newSession);
      }
      
      console.log('🎬 Setting session as started');
      setSessionStarted(true);
    } catch (error) {
      console.error('❌ Error preparing session:', error);
    }
  };

  // Handle session completion
  const handleSessionComplete = (minutesElapsed: number) => {
    console.log('🏁 Session completed', { minutesElapsed });
    // Only reset session state when the session is actually complete
    setSessionStarted(false);
    setActiveSession(null);
    setSelectedActions([]);
    setProcessedActions([]);
    onClose();
  };

  // Handle modal close
  const handleModalClose = () => {
    console.log('🚪 Modal closing...', {
      activeSession,
      sessionStarted,
      hasActiveSession
    });
    // Do not reset any state when there's an active session
    // Just close the modal and let the session continue in the background
    onClose();
  };

  useEffect(() => {
    console.log('📊 State Update:', {
      sessionStarted,
      hasActiveSession,
      activeSession: activeSession?.id,
      duration,
      selectedActions,
      processedActions
    });
  }, [sessionStarted, hasActiveSession, activeSession, duration, selectedActions, processedActions]);

  if (!userId) {
    console.log('❌ No userId provided');
    return null;
  }

  if (isLoadingSession) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center">
        <div className="absolute inset-0 bg-black opacity-60 z-0"></div>
        <div className="relative z-10 bg-[#0B1423] rounded-lg border border-[#FFD700] text-[#FFD700] p-8 w-full max-w-2xl flex items-center justify-center">
          <div className="flex flex-col items-center">
            <span className="text-3xl mb-3">⏱️</span>
            <p className="text-lg historical-game-title">Loading session...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center pt-16">
      <div 
        className="absolute inset-0 bg-black opacity-60 z-0 border-2"
        onClick={handleModalClose}
      ></div>
      
      {/* Only show the start session view if there's no active session */}
      {!sessionStarted && !activeSession ? (
        <div className="relative z-10 bg-[#0B1423] rounded-lg border border-[#FFD700] text-[#FFD700] p-8 w-full max-w-5xl">
         
          
          {/* Header */}

          
          {/* Two column layout */}
          <div className="flex flex-col md:flex-row gap-6 mb-8">
            {/* Left column - Session duration */}
            <div className="w-full md:w-1/2">
              <h3 className="historical-game-title text-2xl font-semibold mb-4 text-center">Focus Session Duration</h3>
              
              <select 
                value={duration} 
                onChange={handleDurationChange}
                className="bg-[#15223A] historical-game-title text-[#FFD700] border border-[#FFD700] rounded-lg px-4 py-3 w-full outline-none appearance-none cursor-pointer text-center text-xl mb-4"
                style={{ 
                  backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='%23FFD700' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E\")",
                  backgroundRepeat: 'no-repeat',
                  backgroundPosition: 'right 12px center',
                  backgroundSize: '20px'
                }}
              >
                <option value="30">30 minutes</option>
                <option value="45">45 minutes</option>
                <option value="60">1 hour</option>
                <option value="90">1.5 hours</option>
                <option value="120">2 hours</option>
                <option value="180">3 hours</option>
                <option value="240">4 hours</option>
              </select>
              
              {/* Timer placeholder */}
              <div className="w-full aspect-square flex items-center justify-center bg-[#15223A] rounded-lg border border-[#FFD700]/30 mt-1.5">
                <div className="text-center">
                  <img src="/images/timer-icon.svg" alt="Timer" className="w-16 h-16 mx-auto mb-3" 
                       onError={(e) => {
                         const target = e.target as HTMLImageElement;
                         target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='64' height='64' viewBox='0 0 24 24' fill='none' stroke='%23FFD700' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'%3E%3Ccircle cx='12' cy='12' r='10'%3E%3C/circle%3E%3Cpolyline points='12 6 12 12 16 14'%3E%3C/polyline%3E%3C/svg%3E";
                       }} />
                  <p className="text-xl historical-game-title text-white">Timer will appear here</p>
                </div>
              </div>
            </div>
            
            {/* Right column - Actions */}
            <div className="w-full md:w-1/2">
              <h3 className="historical-game-title text-2xl font-semibold mb-4 text-center">Choose your {actionCount} action{actionCount !== 1 ? 's' : ''}</h3>
              
              <div className="space-y-4">
                {Array.from({ length: actionCount }, (_, i) => (
                  <div key={i} className="flex bg-[#15223A] rounded-lg border border-[#FFD700]/50">
                    <div className="py-3 px-4 border-r border-[#FFD700]/30 min-w-[120px]">
                      <span className="text-xl historical-game-title text-white">Action {i + 1}</span>
                    </div>
                    <select 
                      value={selectedActions[i] || 'auto'} 
                      onChange={(e) => handleActionChange(i, e.target.value as ActionType)}
                      className="bg-[#15223A] historical-game-title text-[#FFD700] border-0 rounded-r-lg px-3 py-2 w-full outline-none appearance-none cursor-pointer"
                      style={{ 
                        backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='%23FFD700' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E\")",
                        backgroundRepeat: 'no-repeat',
                        backgroundPosition: 'right 12px center',
                        backgroundSize: '20px'
                      }}
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
          
          {/* Historical Info Box */}
          <div className="flex flex-col sm:flex-row gap-6 mb-6">
            <div className="w-full md:w-1/2">
              <div className="p-4 rounded-lg border border-[#4A9A4A]/70 bg-[#1F3A1F] text-white">
                <h4 className="historical-game-title text-[#90D490] text-lg mb-2">What are actions?</h4>
                 <p className="text-lg historical-game-title mb-2">
                    • Every 30 minutes of focus = 1 action point
                </p>
                 <p className="text-lg historical-game-title mb-2">
                    • Choose your actions to nation on the right
                </p>
              </div>
            </div>
            
            {/* Bottom - Start button */}
            <div className="w-full md:w-1/2 flex items-center justify-center">
              <button 
                onClick={startFocusSession}
                className="px-12 py-3 bg-[#15223A] historical-game-title text-[#FFD700] rounded-lg font-bold text-2xl border border-[#FFD700] hover:bg-[#1D2C4A] transition-colors duration-200"
              >
                START
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="relative z-10 bg-[#0B1423] rounded-lg border border-[#FFD700] text-[#FFD700] p-8 w-full max-w-4xl">
          {activeSession ? (
            <div className="text-center mb-4">
              <h2 className="text-3xl font-bold mb-4 historical-game-title">Resuming Active Session</h2>
              <p className="text-white mb-6 historical-game-title">Your focus session is already in progress</p>
            </div>
          ) : null}
          
          {sessionStarted && (
            <FocusTimer 
              userId={userId}
              initialDuration={duration * 60}
              onSessionComplete={handleSessionComplete}
              selectedActions={processedActions}
              existingSessionId={activeSession?.id}
              handleModalClose={handleModalClose}
              executeActionUpdate={executeActionUpdate}
              playerNationResourceTotals={playerNationResourceTotals}
            />
          )}
        </div>
      )}
    </div>
  );
};

export default FocusNowModal; 