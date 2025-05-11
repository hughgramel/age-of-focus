'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { FOCUS_ACTIONS, ActionType, calculateActionsFromDuration, getRandomAction } from '@/data/actions';
import FocusTimer from './FocusTimer';
import { SessionService } from '@/services/sessionService';
import { Session, SessionUpdate, SessionInsert } from '@/types/session';
import { ActionUpdate } from '@/services/actionService';
import CustomDropdown from './CustomDropdown';
import TagSelector from './TagSelector';
import { Tag } from '@/types/tag';
import { TagService } from '@/services/tagService';
import { CircularProgressbarWithChildren } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';
import { playerNationResourceTotals } from './GameView';
import { set } from 'date-fns';

// --- Commented out National Path types ---
/*
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
*/

// --- Commented out National path data ---
/*
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
*/

// --- Commented out Path Button component ---
/*
const PathButton = ({ milestone, onProgressChange }: { 
  milestone: PathMilestone; 
  onProgressChange?: (id: number, progress: number) => void;
}) => {
  return (
    <div className="relative flex items-center justify-center w-full" style={{ marginTop: milestone.id === 1 ? 0 : 40 }}>
      {/* Left side - Name and Description *//*}
      <div className={`flex-1 text-right pr-6 ${milestone.locked ? 'opacity-50' : ''}'>
        <h3 className="font-bold text-lg text-gray-800">{milestone.title}</h3>
        <p className="text-sm text-gray-600">{milestone.description}</p>
      </div>

      {/* Center - Icon with Progress *//*}
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
              <span className={`text-3xl ${milestone.locked ? 'opacity-30' : ''}'>
                {milestone.icon}
              </span>
            </div>
          </CircularProgressbarWithChildren>
          
          {/* Progress controls - only show for development/testing *//*}
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

      {/* Right side - Requirements and Rewards *//*}
      <div className={`flex-1 pl-6 text-left ${milestone.locked ? 'opacity-50' : ''}'>
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
*/

interface FocusNowModalProps {
  userId: string;
  onClose: () => void;
  hasActiveSession?: boolean;
  executeActionUpdate: (action: Omit<ActionUpdate, 'target'>) => void;
  playerNationResourceTotals: playerNationResourceTotals;
  setFocusTimeRemaining: (time: number) => void;
}

// Define COLOR_PALETTE if not already globally available or imported
const COLOR_PALETTE = [
  '#ef4444', '#f97316', '#eab308', '#84cc16', '#22c55e', '#14b8a6', 
  '#06b6d4', '#3b82f6', '#8b5cf6', '#ec4899', '#78716c', '#a1a1aa'
];

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
  const [completionMinutes, setCompletionMinutes] = useState<number | null>(null);
  const [completionStartTime, setCompletionStartTime] = useState<string | null>(null);
  const [completionEndTime, setCompletionEndTime] = useState<string | null>(null);
  
  const [availableTags, setAvailableTags] = useState<Tag[]>([]);
  const [selectedSessionTagId, setSelectedSessionTagId] = useState<string | null>(null);
  const [isLoadingTags, setIsLoadingTags] = useState(true); // For loading tags
  
  // --- Commented out state for milestone progress ---
  // const [milestones, setMilestones] = useState<PathMilestone[]>(NATIONAL_MILESTONES);
  
  // Calculate number of actions based on duration
  const actionCount = calculateActionsFromDuration(duration);
  
  // Function to update milestone progress
  const handleProgressChange = (id: number, progress: number) => {
    // setMilestones(prevMilestones => {
    //   const updatedMilestones = [...prevMilestones];
    //   const index = updatedMilestones.findIndex(m => m.id === id);
    //   
    //   if (index !== -1) {
    //     // Create a new milestone object with updated progress
    //     const updatedMilestone = {
    //       ...updatedMilestones[index],
    //       progress
    //     };
    //     
    //     // Check if milestone is now completed
    //     if (progress >= 100 && !updatedMilestone.completed) {
    //       updatedMilestone.completed = true;
    //       
    //       // Execute the actionUpdate if it exists
    //       if (updatedMilestone.actionUpdate) {
    //         try {
    //           // Transform the milestone's actionUpdate into the correct format
    //           const actionUpdate = updatedMilestone.actionUpdate;
    //           executeActionUpdate(actionUpdate);
    //           
    //           console.log(`🏆 Milestone "${updatedMilestone.title}" completed! Executing action:`, actionUpdate);
    //           
    //           // Update next milestone to be current if there is one
    //           if (index < updatedMilestones.length - 1) {
    //             updatedMilestones[index + 1].locked = false;
    //             
    //             // Set the next milestone as current
    //             updatedMilestone.current = false;
    //             updatedMilestones[index + 1].current = true;
    //           }
    //         } catch (error) {
    //           console.error('Error executing milestone action:', error);
    //         }
    //       }
    //       
    //       updatedMilestones[index] = updatedMilestone;
    //     }
    //     
    //     return updatedMilestones;
    //   });
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
          setIntention(session.intention || '');
          setShowCompletionScreen(false); // Ensure completion screen is hidden
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

  // Effect to load available tags
  useEffect(() => {
    if (!userId) return;
    const loadTags = async () => {
      setIsLoadingTags(true);
      try {
        const userTags = await TagService.getUserTags(userId, false); // Fetch non-deleted tags
        setAvailableTags(userTags);
      } catch (error) {
        console.error("Error loading tags for session modal:", error);
        setAvailableTags([]);
      } finally {
        setIsLoadingTags(false);
      }
    };
    loadTags();
  }, [userId]);

  const handleSessionTagCreate = async (name: string): Promise<Tag | null> => {
    if (!userId) return null;
    try {
      const newColorIndex = availableTags.length % COLOR_PALETTE.length;
      const newTagColor = COLOR_PALETTE[newColorIndex];
      const newTag = await TagService.createTag(userId, { name, color: newTagColor });
      setAvailableTags(prev => [...prev, newTag]);
      setSelectedSessionTagId(newTag.id); // Automatically select the new tag
      return newTag;
    } catch (error) {
      console.error("Error creating session tag:", error);
      return null;
    }
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
      const newSessionData: SessionInsert = {
        user_id: userId,
        planned_minutes: duration,
        session_state: 'focus',
        selected_actions: processedActionsList,
        focus_start_time: new Date().toISOString(),
        focus_end_time: new Date(Date.now() + duration * 60 * 1000).toISOString(),
        break_minutes_remaining: Math.floor(duration / 30) * 5,
        total_minutes_done: 0,
        intention: intention,
        tagId: selectedSessionTagId // Include selected tagId
      };

      const newSession = await SessionService.createSession(newSessionData);

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
    console.log('🏁 FocusNowModal: Session completed callback received', { minutesElapsed });
    setCompletionMinutes(minutesElapsed);
    setCompletionStartTime(activeSession?.focus_start_time || new Date().toISOString());
    setCompletionEndTime(new Date().toISOString());
    setShowCompletionScreen(true);
    setActiveSession(null); // Clear the active session state 
    setSessionStarted(false); // Reset session started flag
    setFocusTimeRemaining(0); // Reset time remaining in GameView
  };

  // Handle final return to map
  const handleReturnToMap = () => {
    console.log('🗺️ Returning to map');
    setShowCompletionScreen(false);
    setCompletionMinutes(null);
    setCompletionStartTime(null);
    setCompletionEndTime(null);
    onClose(); // Close the modal
  };

  // Handle modal close
  const handleModalClose = () => {
    // Handle case where user closes modal during active session (timer will continue)
    // Or closes after completion
    setShowCompletionScreen(false); // Reset completion screen if shown
    setCompletionMinutes(null);
    setCompletionStartTime(null);
    setCompletionEndTime(null);
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

  // Helper functions for completion screen
  const calculateResourceGains = () => {
    // Use processedActions which should be set when session starts
    if (!processedActions || processedActions.length === 0) return null;

    const gains = {
      gold: 0,
      industry: 0,
      army: 0,
      population: 0
    };

    processedActions.forEach(action => {
      switch (action) {
        case 'invest':
          // Ensure playerNationResourceTotals is available
          gains.gold += Math.floor((playerNationResourceTotals?.playerGold || 0) * 0.15);
          break;
        case 'develop':
          gains.industry += Math.floor((playerNationResourceTotals?.playerIndustry || 0) * 0.1);
          gains.gold += Math.floor((playerNationResourceTotals?.playerGold || 0) * 0.03);
          break;
        case 'improve_army':
          gains.army += Math.floor((playerNationResourceTotals?.playerPopulation || 0) * 0.0006);
          break;
        case 'population_growth':
          gains.population += Math.floor((playerNationResourceTotals?.playerPopulation || 0) * 0.0010);
          break;
      }
    });

    // Return null if no gains were actually calculated
    if (Object.values(gains).every(v => v === 0)) {
      return null;
    }

    return gains;
  };

  const formatTimeElapsed = (minutes: number | null): string => {
    if (minutes === null) return 'N/A';
    if (minutes < 60) {
      return `${minutes} ${minutes === 1 ? 'minute' : 'minutes'}`;
    } else {
      const hours = Math.floor(minutes / 60);
      const remainingMinutes = minutes % 60;
      
      if (remainingMinutes === 0) {
        return `${hours} ${hours === 1 ? 'hour' : 'hours'}`;
      } else {
        return `${hours} ${hours === 1 ? 'hour' : 'hours'} and ${remainingMinutes} ${remainingMinutes === 1 ? 'minute' : 'minutes'}`;
      }
    }
  };

  const formatTimeStamp = (timeString: string | null): string => {
    if (!timeString) return 'N/A';
    try {
      const date = new Date(timeString);
      // Check if the date is valid before formatting
      if (isNaN(date.getTime())) {
        return 'Invalid Date';
      }
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch (error) {
      console.error("Error formatting timestamp:", timeString, error);
      return 'Error';
    }
  };

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
      className="fixed inset-0 z-50 flex items-center justify-center p-4 transition-opacity duration-300 ease-in-out opacity-100"
    >
      {/* Transparent Backdrop for closing */}
      <div 
        className="absolute inset-0 z-0"
        onClick={handleModalClose}
      ></div>
      
      {/* Modal Content Container - Match other modals' width/margins */}
      <div 
        className={`relative z-10 w-full max-w-md sm:max-w-4xl transition-transform duration-300 ease-in-out transform scale-100 mx-auto sm:mx-auto bg-white rounded-lg border-2 border-gray-300 shadow-lg`}
        style={{ boxShadow: '0 3px 0px #d1d5db' }}
      >
        {/* Close Button - Moved for sessionStarted and completionScreen scenarios below */}

        {!sessionStarted && !activeSession && !showCompletionScreen ? (
          <>
            {/* Close Button for initial screen */}
            <button 
              onClick={handleModalClose} 
              className="absolute top-2 right-2 text-gray-500 hover:text-gray-800 transition-colors z-20 p-2" 
            >
              <span className="text-xl font-bold">✕</span>
            </button>
            <div className="relative text-black p-4 sm:p-6 [font-family:var(--font-mplus-rounded)]" style={{ transform: 'translateY(-2px)' }}>
              {/* Top section - Duration and Tag Selector Side by Side */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 sm:mb-8">
                <div>
                  <h3 className="text-lg sm:text-xl font-semibold mb-2 sm:mb-3 text-left flex items-center gap-2">
                    <span className="text-2xl">⏱️</span>
                    Duration
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
                    forceLabelVisible={true}
                  />
                </div>
                <div>
                  <h3 className="text-lg sm:text-xl font-semibold mb-2 sm:mb-3 text-left flex items-center gap-2">
                    <span className="text-2xl">🏷️</span>
                    Tag (Optional)
                  </h3>
                  {isLoadingTags ? (
                    <div className="h-[50px] flex items-center justify-center text-gray-500">Loading tags...</div>
                  ) : (
                    <TagSelector
                      userId={userId}
                      availableTags={availableTags}
                      selectedTagId={selectedSessionTagId}
                      onTagSelect={setSelectedSessionTagId}
                      onTagCreate={handleSessionTagCreate}
                      onColorChangeRequest={(tag) => console.log('Color change requested for', tag)} // Placeholder
                      // onTagArchiveRequest - omit for now or add a handler if needed
                      className="w-full"
                    />
                  )}
                </div>
              </div>

              {/* Main Content Area */} 
              <div className="flex flex-col">
                {/* Updated scrollable container: Increased max-h and added min-h */}
                <div className="max-h-[65vh] min-h-[300px] overflow-y-auto pr-2 mb-4">
                  {/* Actions Box */}
                  <div className="bg-white rounded-lg border border-gray-200 p-4 mb-4" style={{ boxShadow: '0 2px 0 rgba(229,229,229,255)' }}>
                    <h3 className="text-xl font-semibold mb-3 text-center flex items-center justify-center gap-2 flex-shrink-0">
                      <span className="text-2xl">🎯</span>
                      Choose your {actionCount} action{actionCount !== 1 ? 's' : ''}
                    </h3>
                    <div className="grid grid-cols-2 gap-2 pr-1 -mr-1">
                      {Array.from({ length: actionCount }, (_, i) => (
                        <div key={i} className="flex bg-white rounded-lg border border-gray-200 flex-shrink-0" style={{ boxShadow: '0 2px 0 rgba(229,229,229,255)' }}>
                           <div className="py-2 px-2 sm:px-3 border-r border-gray-200 min-w-[60px] sm:min-w-[60px] flex items-center">
                             <span className="text-sm sm:text-base text-gray-700">Action {i + 1}</span>
                           </div>
                           <CustomDropdown
                            options={[
                              { value: "auto", label: "Auto", icon: "🎲" }, 
                              ...FOCUS_ACTIONS.filter(action => action.id !== 'auto').map(action => ({
                                value: action.id,
                                label: action.id === 'invest' ? 'Economy' : 
                                       action.id === 'develop' ? 'Industry' : 
                                       action.id === 'improve_army' ? 'Army' : 
                                       action.id === 'population_growth' ? 'Population' : 
                                       action.name, 
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
                            className="flex-1 text-sm sm:text-base [&>button]:justify-center sm:[&>button]:justify-between"
                          />
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Intention Box */}
                  <textarea
                    value={intention}
                    onChange={(e) => setIntention(e.target.value)}
                    placeholder="Write your intention..."
                    className="bg-white text-gray-800 border border-gray-200 rounded-lg px-3 py-2 w-full outline-none text-base resize-none h-[100px] flex-shrink-0"
                    style={{ boxShadow: '0 2px 0 rgba(229,229,229,255)' }}
                  />
                </div>

                {/* Start Focus Button - Updated Styles */}
                  <button 
                    onClick={startFocusSession}
                  className="mt-auto px-8 py-3 bg-[#6ec53e] text-white rounded-lg font-semibold text-xl border-2 border-[#59a700] hover:bg-[#60b33a] active:bg-[#539e30] transition-all duration-150 w-full flex items-center justify-center gap-2 flex-shrink-0 hover:translate-y-[-1px] active:translate-y-[0.5px] active:shadow-[0_1px_0px_#59a700]"
                  style={{ boxShadow: '0 3px 0px #59a700' }}
                  >
                    <span className="text-2xl">▶️</span>
                    Start Focus
                  </button>
              </div>
            </div>
          </>
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

              // Props for TagSelector in FocusTimer
              initialSelectedTagId={activeSession?.tagId ?? selectedSessionTagId}
              availableTags={availableTags}
              onFinalTagCreate={handleSessionTagCreate}
              onFinalTagColorChangeRequest={(tagToChange) => {
                console.log('[FocusNowModal] Color change requested for tag from FocusTimer:', tagToChange);
              }}
            />
          </div>
        )}

        {showCompletionScreen && (
          <div className="[font-family:var(--font-mplus-rounded)] -mt-4 sm:-mt-10">
            <div className="bg-[#6ec53e] py-4 sm:py-6 px-4 sm:px-6 text-center rounded-t-lg relative">
              <h1 className="text-2xl sm:text-[2.5rem] text-white m-0 font-bold flex items-center justify-center gap-2 sm:gap-3">
                <span className="text-3xl sm:text-4xl">🎉</span>
                Session Complete!
              </h1>
              {/* Close Button for completion screen - now inside green bar */}
              <button 
                onClick={handleModalClose} 
                className="absolute top-2 right-2 text-white hover:text-gray-200 transition-colors z-20 p-2" 
              >
                <span className="text-xl font-bold">✕</span>
              </button>
            </div>
            
            <div className="p-4 sm:p-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-8 mb-6 sm:mb-8">
                <div className="flex items-center gap-3 sm:gap-4">
                  <div className="text-3xl sm:text-[2.5rem]">⏱️</div>
                  <div>
                    <h3 className="text-base sm:text-[1.2rem] text-gray-600 mb-1 sm:mb-2">Focused for</h3>
                    <p className="text-lg sm:text-[1.5rem] text-gray-800 font-semibold">{formatTimeElapsed(completionMinutes)}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 sm:gap-4">
                  <div className="text-3xl sm:text-[2.5rem]">🕒</div>
                  <div>
                    <h3 className="text-base sm:text-[1.2rem] text-gray-600 mb-1 sm:mb-2">Session Details</h3>
                    <p className="text-sm sm:text-base text-gray-600 my-0.5 sm:my-1">Start: {formatTimeStamp(completionStartTime)}</p>
                    <p className="text-sm sm:text-base text-gray-600 my-0.5 sm:my-1">End: {formatTimeStamp(completionEndTime)}</p>
                  </div>
                </div>
              </div>

              {intention && (
                <div className="mb-6 sm:mb-8">
                  <h3 className="text-base sm:text-[1.2rem] text-gray-800 mb-2 sm:mb-3 flex items-center gap-2">
                    <span className="text-xl sm:text-2xl">💡</span>
                    Your Intention
                  </h3>
                  <p className="text-base sm:text-lg text-gray-700 bg-gray-50 p-3 sm:p-4 rounded-lg border border-gray-200 leading-relaxed break-words">
                    {intention}
                  </p>
                </div>
              )}

              {calculateResourceGains() && (
                <div className="bg-gray-50 rounded-lg p-4 sm:p-6 mb-6 sm:mb-8 border border-gray-200">
                  <h3 className="text-base sm:text-[1.2rem] text-gray-800 mb-3 sm:mb-4 flex items-center gap-2">
                    <span className="text-xl sm:text-2xl">🎁</span>
                    Resources Gained
                  </h3>
                  <div className="space-y-2 sm:space-y-3">
                    {calculateResourceGains()!.gold > 0 && (
                      <p className="text-base sm:text-lg text-gray-700">+{calculateResourceGains()!.gold.toLocaleString()} 💰</p>
                    )}
                    {calculateResourceGains()!.industry > 0 && (
                      <p className="text-base sm:text-lg text-gray-700">+{calculateResourceGains()!.industry.toLocaleString()} 🏭</p>
                    )}
                    {calculateResourceGains()!.army > 0 && (
                      <p className="text-base sm:text-lg text-gray-700">+{calculateResourceGains()!.army.toLocaleString()} ⚔️</p>
                    )}
                    {calculateResourceGains()!.population > 0 && (
                      <p className="text-base sm:text-lg text-gray-700">+{calculateResourceGains()!.population.toLocaleString()} 👥</p>
                    )}
                  </div>
                </div>
              )}
              
              <div className="text-center my-6 sm:my-8">
                <p className="text-base sm:text-[1.2rem] text-gray-700">Well done! You've completed a focus session!</p>
              </div>
              
              <div className="flex justify-center mt-4 sm:mt-6">
                {/* Return to Map Button - Updated Styles */}
                <button 
                  className="bg-[#6ec53e] text-white py-2 px-6 sm:py-3 sm:px-8 rounded-lg text-base sm:text-[1.2rem] font-semibold cursor-pointer transition-all duration-150 hover:opacity-90 flex items-center justify-center gap-2 border-2 border-[#59a700] hover:bg-[#60b33a] active:bg-[#539e30] hover:translate-y-[-1px] active:translate-y-[0.5px] active:shadow-[0_1px_0px_#59a700]"
                  style={{ boxShadow: '0 3px 0px #59a700' }}
                  onClick={handleReturnToMap}
                >
                  <span className="text-xl sm:text-2xl">🗺️</span>
                  Return to Map
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FocusNowModal; 