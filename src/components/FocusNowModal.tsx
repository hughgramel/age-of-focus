'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { FOCUS_ACTIONS, ActionType, calculateActionsFromDuration, getRandomAction } from '@/data/actions';
import FocusTimer from './FocusTimer';
import { SessionService } from '@/services/sessionService';
import { Session } from '@/types/session';
import { ActionUpdate } from '@/services/actionService';
import CustomDropdown from './CustomDropdown';
import { CircularProgressbarWithChildren } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';

// Add National Path types
interface PathMilestone {
  id: number;
  title: string;
  description: string;
  icon: string;
  locked: boolean;
  current: boolean;
  completed: boolean;
  requirements?: string;
  rewards?: string;
  progress: number; // 0-100 progress percentage
  actionUpdate?: {
    type: 'resources';
    // Use only ResourceUpdate compatible types here for now
    updates: Array<
      { resource: 'goldIncome' | 'industry' | 'army' | 'population'; amount: number } 
      // Removed: | { resource: 'gold' | 'researchPoints'; amount: number }
    >;
  };
}

// National path data
const NATIONAL_MILESTONES: PathMilestone[] = [
  {
    id: 1,
    title: 'Industrial Foundation',
    description: 'Establish your first factories',
    icon: '🏭',
    locked: false,
    current: true,
    completed: false,
    requirements: 'Complete 3 focus sessions',
    rewards: '+10% Industry growth', // This reward text is fine, but action needs fixing
    progress: 65,
    actionUpdate: {
      type: 'resources',
      updates: [
        // Changed from 'army' which wasn't in the reward text
        // Let's assume +10% industry growth means a flat +100 industry points for now
        { resource: 'industry', amount: 100 } 
      ]
    }
  },
  {
    id: 2,
    title: 'Military Might',
    description: 'Build your first army',
    icon: '⚔️',
    locked: true,
    current: false,
    completed: false,
    requirements: 'Have 5 factories built',
    rewards: '+500 Army units',
    progress: 0,
    actionUpdate: {
      type: 'resources',
      updates: [
        { resource: 'army', amount: 500 } // This one is fine
      ]
    }
  },
  {
    id: 3,
    title: 'Economic Power',
    description: 'Reach 1000 gold income',
    icon: '💰',
    locked: true,
    current: false,
    completed: false,
    requirements: 'Have 10 factories and 5 markets',
    rewards: '+25% Gold income', // Text fine, action needs fixing
    progress: 0,
    actionUpdate: {
      type: 'resources',
      updates: [
        // Assume +25% means a flat +1000 goldIncome for now
        { resource: 'goldIncome', amount: 1000 } 
      ]
    }
  },
  {
    id: 4,
    title: 'Great Power',
    description: 'Become a dominant nation',
    icon: '👑',
    locked: true,
    current: false,
    completed: false,
    requirements: 'Have 20 factories, 10 markets, 1000 army',
    rewards: 'National Prestige +50', // Text fine, action needs fixing
    progress: 0,
    actionUpdate: {
      type: 'resources',
      updates: [
        // Changed 'gold' to 'goldIncome' - prestige needs separate handling
        { resource: 'goldIncome', amount: 2000 }, 
        { resource: 'army', amount: 1000 }
      ]
    }
  },
];

// Path Button component for milestone display
const PathButton = ({ milestone, onProgressChange }: { 
  milestone: PathMilestone; 
  onProgressChange?: (id: number, progress: number) => void;
}) => {
  return (
    <div className="relative flex items-center justify-center w-full" style={{ marginTop: milestone.id === 1 ? 0 : 40 }}>
      {/* Left side - Name and Description */}
      <div className={`flex-1 text-right pr-6 ${milestone.locked ? 'opacity-50' : ''}`}>
        <h3 className="font-bold text-lg text-gray-800">{milestone.title}</h3>
        <p className="text-sm text-gray-600">{milestone.description}</p>
      </div>

      {/* Center - Icon with Progress */}
      <div className="relative flex-shrink-0">
        <div className="relative h-[80px] w-[80px]">
          <CircularProgressbarWithChildren
            value={milestone.progress}
            styles={{
              root: {
                width: '100%',
                height: '100%',
                backgroundColor: 'white',
                borderRadius: '50%',
              },
              path: {
                stroke: milestone.completed ? '#4ade80' : (milestone.current ? '#4ade80' : '#67b9e7'),
                strokeLinecap: 'round',
                transition: 'stroke-dashoffset 0.5s ease 0s',
              },
              trail: {
                stroke: '#e5e7eb',
                strokeLinecap: 'round',
              }
            }}
          >
            <div className={`h-[60px] w-[60px] rounded-full flex items-center justify-center bg-white`}>
              <span className={`text-3xl ${milestone.locked ? 'opacity-30' : ''}`}>
                {milestone.icon}
              </span>
            </div>
          </CircularProgressbarWithChildren>
          
          {/* Progress controls - only show for development/testing */}
          {onProgressChange && (
            <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 flex gap-1">
              <button 
                className="bg-gray-200 text-xs px-1 rounded"
                onClick={() => onProgressChange(milestone.id, Math.max(0, milestone.progress - 10))}
              >
                -
              </button>
              <button 
                className="bg-gray-200 text-xs px-1 rounded"
                onClick={() => onProgressChange(milestone.id, Math.min(100, milestone.progress + 10))}
              >
                +
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Right side - Requirements and Rewards */}
      <div className={`flex-1 pl-6 text-left ${milestone.locked ? 'opacity-50' : ''}`}>
        {milestone.requirements && (
          <div className="mb-1">
            <span className="text-xs font-semibold text-gray-500">Required:</span>
            <p className="text-sm text-gray-600">{milestone.requirements}</p>
          </div>
        )}
        {milestone.rewards && (
          <div>
            <span className="text-xs font-semibold text-green-600">Reward:</span>
            <p className="text-sm text-green-700">{milestone.rewards}</p>
          </div>
        )}
      </div>
    </div>
  );
};

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
  setFocusTimeRemaining: (time: number) => void;
}

const FocusNowModal: React.FC<FocusNowModalProps> = ({ userId, onClose, hasActiveSession = false, executeActionUpdate, playerNationResourceTotals, setFocusTimeRemaining }) => {
  const router = useRouter();
  const [sessionStarted, setSessionStarted] = useState(false);
  const [duration, setDuration] = useState(60); // Default: 60 minutes
  const [intention, setIntention] = useState(''); // Add intention state
  const [selectedActions, setSelectedActions] = useState<ActionType[]>([]);
  const [processedActions, setProcessedActions] = useState<ActionType[]>([]);
  const [activeSession, setActiveSession] = useState<Session | null>(null);
  const [isLoadingSession, setIsLoadingSession] = useState(true);
  const [showCompletionScreen, setShowCompletionScreen] = useState(false);
  
  // Add state for milestone progress
  const [milestones, setMilestones] = useState<PathMilestone[]>(NATIONAL_MILESTONES);
  
  // Calculate number of actions based on duration
  const actionCount = calculateActionsFromDuration(duration);
  
  // Function to update milestone progress
  const handleProgressChange = (id: number, progress: number) => {
    setMilestones(prevMilestones => {
      const updatedMilestones = [...prevMilestones];
      const index = updatedMilestones.findIndex(m => m.id === id);
      
      if (index !== -1) {
        // Create a new milestone object with updated progress
        const updatedMilestone = {
          ...updatedMilestones[index],
          progress
        };
        
        // Check if milestone is now completed
        if (progress >= 100 && !updatedMilestone.completed) {
          updatedMilestone.completed = true;
          
          // Execute the actionUpdate if it exists
          if (updatedMilestone.actionUpdate) {
            try {
              // Transform the milestone's actionUpdate into the correct format
              const actionUpdate = updatedMilestone.actionUpdate;
              executeActionUpdate(actionUpdate);
              
              console.log(`🏆 Milestone "${updatedMilestone.title}" completed! Executing action:`, actionUpdate);
              
              // Update next milestone to be current if there is one
              if (index < updatedMilestones.length - 1) {
                updatedMilestones[index + 1].locked = false;
                
                // Set the next milestone as current
                updatedMilestone.current = false;
                updatedMilestones[index + 1].current = true;
              }
            } catch (error) {
              console.error('Error executing milestone action:', error);
            }
          }
        }
        
        updatedMilestones[index] = updatedMilestone;
      }
      
      return updatedMilestones;
    });
  };
  
  // Load active session if hasActiveSession is true or check for active sessions on load
  useEffect(() => {
    const loadActiveSession = async () => {
      try {
        console.log('🔍 Loading active session...', { userId, hasActiveSession });
        setIsLoadingSession(true);
        const activeSessions = await SessionService.getActiveUserSessions(userId);
        console.log('📊 Active sessions found:', activeSessions);
        
        // Check if we have a valid active session (not completed)
        const validSession = activeSessions && activeSessions.length > 0 && 
                             activeSessions[0].session_state !== 'complete';
        
        if (validSession) {
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
          
          // Set intention if it exists
          if (session.intention) {
            setIntention(session.intention);
          }
        } else {
          console.log('❌ No active sessions found or session is already completed');
          // Reset states to show the creation screen
          setSessionStarted(false);
          setActiveSession(null);
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
    console.log('🎬 Starting new focus session...', { intention });
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
        total_minutes_done: 0,
        intention: intention // Add intention to session
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
    setShowCompletionScreen(true);
  };

  // Handle final return to map
  const handleReturnToMap = async () => {
    console.log('🏁 Returning to map, resetting session state');
    
    try {
      // If there's an active session ID, ensure it's properly marked as complete in Firebase
      onClose();
      if (activeSession?.id) {
        console.log('✅ Marking session as complete:', activeSession.id);
        await SessionService.updateSession(activeSession.id, {
          session_state: 'complete'
        });
      }

      // Reset all state
      setShowCompletionScreen(false);
      setSessionStarted(false);
      setActiveSession(null);
      setSelectedActions([]);
      setProcessedActions([]);
      setIntention('');
      setDuration(60); // Reset to default duration
      // Close the modal
      
    } catch (error) {
      console.error('❌ Error closing session:', error);
    }
  };

  // Handle modal close
  const handleModalClose = () => {
    if (showCompletionScreen) {
      // If we're showing completion screen, don't allow closing with backdrop click
      return;
    }
    console.log('🚪 Modal closing...', {
      activeSession,
      sessionStarted,
      hasActiveSession
    });
    
    // Don't reset the active session state if there's an actual active session
    // This way when reopening, it will resume the session
    
    // Only reset states related to the modal UI
    setShowCompletionScreen(false);
    
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
    <div 
      className="fixed inset-0 z-50 flex items-start justify-center pt-26 transition-opacity duration-300 ease-in-out opacity-100"
    >
      {/* Transparent Backdrop for closing */}
      <div 
        className="absolute inset-0 z-0"
        onClick={handleModalClose}
      ></div>
      
      {/* Modal Content Container - Add scale transition */}
      <div 
        className={`relative z-10 w-full max-w-5xl transition-transform duration-300 ease-in-out transform scale-100`}
      >
          {!sessionStarted && !activeSession && !showCompletionScreen ? (
            <div className="relative bg-white rounded-lg border border-gray-200 text-black p-6 [font-family:var(--font-mplus-rounded)]" style={{ boxShadow: '0 4px 0 rgba(229,229,229,255)', transform: 'translateY(-2px)' }}>
              {/* Add Close Button */}
              <button 
                onClick={handleModalClose} 
                className="absolute top-2 right-2 text-gray-500 hover:text-gray-800 transition-colors z-20 p-2" 
              >
                <span className="text-xl font-bold">✕</span>
              </button>

              {/* Top section - Duration centered */}
              <div className="mb-8 max-w-md mx-auto">
                <h3 className="text-2xl font-semibold mb-4 text-center flex items-center justify-center gap-2">
                  <span className="text-3xl">⏱️</span>
                  Focus Session Duration
                </h3>
                <CustomDropdown
                  options={[
                    { value: "30", label: "30 minutes", icon: "⏱️" },
                    { value: "45", label: "45 minutes", icon: "⏱️" },
                    { value: "60", label: "1 hour", icon: "⏱️" },
                    { value: "90", label: "1.5 hours", icon: "⏱️" },
                    { value: "120", label: "2 hours", icon: "⏱️" },
                    { value: "180", label: "3 hours", icon: "⏱️" },
                    { value: "240", label: "4 hours", icon: "⏱️" }
                  ]}
                  value={duration.toString()}
                  onChange={(value) => setDuration(parseInt(value))}
                  className="w-full"
                />
              </div>

              {/* Info Box (Moved to Absolute Top Right) */}
              <div className="absolute top-10 right-8 p-3 rounded-lg border border-emerald-200 bg-emerald-50 w-60">
                <h4 className="text-emerald-800 text-base mb-1 flex items-center gap-1">
                  <span className="text-xl">ℹ️</span>
                  What are actions?
                </h4>
                <p className="text-sm text-emerald-700 mb-0.5">
                  • 30 mins focus = 1 action pt
                </p>
                <p className="text-sm text-emerald-700">
                  • Action pts develop nation
                </p>
              </div>

              {/* Main Content Area - Two Columns */}
              <div className="flex gap-6 items-start">
                {/* Left Column - National Path (Wider) */}
                <div className="w-7/12 bg-gray-50 rounded-lg border border-gray-200 p-6 overflow-hidden flex flex-col self-stretch max-h-[55vh]" style={{ boxShadow: '0 2px 0 rgba(229,229,229,255)' }}>
                  <h3 className="text-2xl font-semibold mb-6 text-center flex items-center justify-center gap-2 flex-shrink-0">
                    <span className="text-3xl">🌟</span>
                    National Path
                  </h3>
                  <div className="relative flex-grow overflow-y-auto pr-2 -mr-2">
                    <div className="absolute left-1/2 top-[35px] bottom-[35px] w-0.5 bg-[#67b9e7]/30 -translate-x-1/2" style={{ zIndex: 1 }} />
                    <div className="relative flex flex-col items-stretch">
                      {milestones.map((milestone) => (
                        <div key={milestone.id} style={{ zIndex: 2, position: 'relative' }}>
                           <PathButton milestone={milestone} onProgressChange={handleProgressChange} />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Right Column - Actions, Intention, Start */}
                <div className="w-5/12 flex flex-col gap-3">
                  {/* Actions Box (Reduced min-height further) */}
                  <div className="bg-white rounded-lg border border-gray-200 p-4 flex-grow min-h-[250px]" style={{ boxShadow: '0 2px 0 rgba(229,229,229,255)' }}>
                    <h3 className="text-xl font-semibold mb-3 text-center flex items-center justify-center gap-2 flex-shrink-0">
                      <span className="text-2xl">🎯</span>
                      Choose your {actionCount} action{actionCount !== 1 ? 's' : ''}
                    </h3>
                    <div className="space-y-3 pr-1 -mr-1">
                      {Array.from({ length: actionCount }, (_, i) => (
                        <div key={i} className="flex bg-white rounded-lg border border-gray-200 flex-shrink-0" style={{ boxShadow: '0 2px 0 rgba(229,229,229,255)' }}>
                           <div className="py-2 px-3 border-r border-gray-200 min-w-[80px]">
                             <span className="text-base text-gray-700">Action {i + 1}</span>
                           </div>
                           <CustomDropdown
                            options={[
                              { value: "auto", label: "Auto (Random)", icon: "🎲" },
                              ...FOCUS_ACTIONS.filter(action => action.id !== 'auto').map(action => ({
                                value: action.id,
                                label: action.name,
                                icon: (() => {
                                  switch (action.id) {
                                    case 'invest': return '💰';
                                    case 'develop': return '🏭';
                                    case 'improve_army': return '⚔️';
                                    case 'population_growth': return '👥';
                                    default: return '🎯';
                                  }
                                })()
                              }))
                            ]}
                            value={selectedActions[i] || 'auto'}
                            onChange={(value) => handleActionChange(i, value as ActionType)}
                            className="flex-1"
                          />
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Intention Box (Reduced height) */}
                  <textarea
                    value={intention}
                    onChange={(e) => setIntention(e.target.value)}
                    placeholder="Write your intention..."
                    className="bg-white text-gray-800 border border-gray-200 rounded-lg px-3 py-2 w-full outline-none text-sm resize-none h-[70px] flex-shrink-0"
                    style={{ boxShadow: '0 2px 0 rgba(229,229,229,255)' }}
                  />

                  {/* Start Button (Reduced text/padding) */}
                  <button 
                    onClick={startFocusSession}
                    className="mt-auto px-8 py-2 bg-[#6ec53e] text-white rounded-lg font-bold text-xl hover:opacity-90 transition-all duration-200 w-full flex items-center justify-center gap-2 flex-shrink-0"
                    style={{ boxShadow: '0 4px 0 rgba(89,167,0,255)', transform: 'translateY(-2px)' }}
                  >
                    <span className="text-2xl">▶️</span>
                    Start Focus
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="relative z-10">
              <FocusTimer 
                userId={userId}
                initialDuration={duration * 60}
                onSessionComplete={handleSessionComplete}
                selectedActions={processedActions}
                existingSessionId={activeSession?.id}
                handleModalClose={handleModalClose}
                executeActionUpdate={executeActionUpdate}
                playerNationResourceTotals={playerNationResourceTotals}
                intention={intention}
                setFocusTimeRemaining={setFocusTimeRemaining}
                showFocusModal={handleReturnToMap}
              />
            </div>
          )}
      </div>
    </div>
  );
};

export default FocusNowModal; 