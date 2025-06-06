'use client';

/**
 * FocusTimer Component
 * ====================
 * A reusable component for managing focus sessions with the Pomodoro technique.
 * 
 * Database Interactions:
 * ---------------------
 * 1. On initialization:
 *    - Fetches active user sessions from Firebase via SessionService.getActiveUserSessions()
 *    - If no active session exists, creates a new session via SessionService.createSession()
 *    - If an expired session exists, automatically completes it and shows completion screen
 * 
 * 2. During focus session:
 *    - Sets break time as 1/6th of the planned focus duration (stored in database)
 * 
 * 3. When taking a break:
 *    - Updates session state to "break" in database via SessionService.updateSession()
 *    - Sets break start and end times
 *    - Decreases available break time
 * 
 * 4. When extending a break:
 *    - Updates break end time in database
 *    - Further decreases available break time
 * 
 * 5. When returning to focus:
 *    - Updates session state back to "focus" in database
 * 
 * 6. On session end:
 *    - Updates session state to "complete" in database
 *    - Saves total focus minutes completed
 *    - Triggers onSessionComplete callback if provided
 *    - Shows session complete UI with stats
 * 
 * 7. On session discard:
 *    - Deletes the session record from Firebase via SessionService.deleteSession()
 * 
 * Session End Process:
 * ------------------
 * When a session ends (either when the timer runs out or the user manually ends it):
 * 1. Session state is changed to "focus" if it was in "break"
 * 2. Total focus time is calculated and rounded to nearest 15 minutes
 * 3. Session state is updated to "complete" in Firebase
 * 4. Timer is cleared and UI shows the completion screen
 * 5. If onSessionComplete callback was provided, it's called with the minutes elapsed
 * 6. User can return to dashboard from the completion screen
 * 
 * Expired Session Handling:
 * -----------------------
 * If a user returns after the scheduled focus end time:
 * 1. The session is automatically marked as complete
 * 2. The completion screen is shown with the full planned duration 
 * 3. After returning to dashboard, a new session can be started
 */

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { SessionService } from '@/services/sessionService';
import { Session, SessionInsert, SessionUpdate } from '@/types/session';
import { serverTimestamp } from 'firebase/firestore';
import { useGame } from '@/contexts/GameContext';
import { Game } from '@/types/game';  
import { ActionType, FOCUS_ACTIONS, executeActions, getRandomAction, calculateActionsFromDuration } from '@/data/actions';
import { ActionUpdate } from '@/services/actionService';
import TagSelector from './TagSelector';
import { Tag } from '@/types/tag';

// Moved interface definition outside component
interface DebugToolsState {
  show: boolean;
}

interface playerNationResourceTotals {
  playerGold: number;
  playerIndustry: number;
  playerPopulation: number;
  playerArmy: number;
}
interface FocusTimerProps {
  userId: string | null;
  initialDuration?: number; // in seconds
  onSessionComplete?: (minutesElapsed: number) => void;
  selectedActions?: ActionType[];
  existingSessionId?: string;
  handleModalClose?: () => void;
  executeActionUpdate: (action: Omit<ActionUpdate, 'target'>) => void;
  playerNationResourceTotals: playerNationResourceTotals;
  intention?: string;
  setFocusTimeRemaining: (time: number) => void;
  showFocusModal?: () => void;

  // New props for TagSelector
  initialSelectedTagId?: string | null;
  availableTags: Tag[];
  onFinalTagCreate: (name: string) => Promise<Tag | null>;
  onFinalTagColorChangeRequest: (tag: Tag) => void;
}

// New component for session confirmation popup
interface SessionConfirmationProps {
  minutesElapsed: number;
  minutesRounded: number;
  onConfirm: () => void;
  onCancel: () => void;
}

const SessionConfirmation = ({ 
  minutesElapsed, 
  minutesRounded, 
  onConfirm, 
  onCancel 
}: SessionConfirmationProps) => {
  const willRoundToZero = minutesRounded === 0 && minutesElapsed > 0;
  
  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[1000]">
      <div className="bg-white rounded-xl p-8 w-[90%] max-w-[500px] shadow-lg border border-gray-200 [font-family:var(--font-mplus-rounded)]" style={{ boxShadow: '0 4px 0 rgba(229,229,229,255)', transform: 'translateY(-2px)' }}>
        <h2 className="text-gray-800 text-[1.8rem] mb-6 text-center flex items-center justify-center gap-2">
          <span className="text-3xl">❓</span>
          End Session?
        </h2>
        
        {willRoundToZero ? (
          <div className="mb-8 border-l-4 border-red-500 pl-4 bg-red-50 p-4 rounded-lg">
            <div className="flex items-center gap-2 mb-2 text-red-600">
              <span className="text-2xl">⚠️</span>
              <p className="font-semibold">Warning</p>
            </div>
            <p className="text-red-600 mb-2">Your session lasted less than 15 minutes and will be rounded down to 0 minutes.</p>
            <p className="text-red-600/80 mb-2">Current time: {minutesElapsed} minutes</p>
            <p className="text-red-600/80 mb-2">Rounded time: 0 minutes</p>
          </div>
        ) : (
          <div className="mb-8">
            <p className="text-gray-700 mb-2 text-center text-lg">You've focused for {minutesElapsed} minutes.</p>
            {minutesElapsed !== minutesRounded && (
              <p className="text-gray-600 mb-2 text-center">This will be rounded to {minutesRounded} minutes (nearest 15-minute increment).</p>
            )}
          </div>
        )}
        
        <div className="flex justify-between gap-4 mt-6">
          <button 
            className="bg-white text-gray-800 border border-gray-200 py-3 px-0 rounded-lg text-base font-semibold cursor-pointer transition-all duration-200 flex-1 text-center hover:bg-gray-50 flex items-center justify-center gap-2" 
            style={{ boxShadow: '0 4px 0 rgba(229,229,229,255)', transform: 'translateY(-2px)' }}
            onClick={onCancel}
          >
            <span className="text-xl">⏱️</span>
            Continue Session
          </button>
          <button 
            className="bg-white text-red-600 border border-red-200 py-3 px-0 rounded-lg text-base font-semibold cursor-pointer transition-all duration-200 flex-1 text-center hover:bg-red-50 flex items-center justify-center gap-2" 
            style={{ boxShadow: '0 4px 0 rgba(229,229,229,255)', transform: 'translateY(-2px)' }}
            onClick={onConfirm}
          >
            <span className="text-xl">⏹️</span>
            End Session
          </button>
        </div>
      </div>
    </div>
  );
};

const FocusTimer: React.FC<FocusTimerProps> = ({ 
  userId, 
  initialDuration = 60 * 60, // Default to 1 hour
  onSessionComplete,
  selectedActions = [], 
  existingSessionId = undefined, 
  handleModalClose,
  executeActionUpdate,
  playerNationResourceTotals,
  intention,
  setFocusTimeRemaining,
  showFocusModal,

  // Destructure new props
  initialSelectedTagId,
  availableTags,
  onFinalTagCreate,
  onFinalTagColorChangeRequest
}) => {
  // Default timer durations
  const FOCUS_TIME_SECONDS = initialDuration;
  const BREAK_TIME_SECONDS = 60 * 5; // 5 minutes
  
  const { currentGame, gameLoading } = useGame();
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [, setRerender] = useState(0);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [debugToolsState, setDebugToolsState] = useState<DebugToolsState>({ show: false });
  
  // Refs to track timer state
  const secondsRemaining = useRef(0);
  const secondsElapsed = useRef(0);
  const sessionCreationInProgressRef = useRef(false);
  const isInitializedRef = useRef(false);
  const sessionId = useRef<string | undefined>("");
  const isBreak = useRef(false);
  const breakTimeRemaining = useRef(0);
  const currFocusEndTime = useRef("");
  const currBreakEndTime = useRef("");
  const currFocusStartTime = useRef("");
  const currBreakStartTime = useRef("");
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const isCompleted = useRef(false);
  const totalMinutesElapsedRoundedToFifteen = useRef(0);
  const actualMinutesElapsed = useRef(0);
  
  // State for inline intention editing
  const [isEditingIntention, setIsEditingIntention] = useState(false);
  const [editableIntention, setEditableIntention] = useState("");
  const intentionInputRef = useRef<HTMLInputElement>(null);

  // State for current session's tag
  const [currentSessionTagId, setCurrentSessionTagId] = useState<string | null>(initialSelectedTagId || null);

  // Temporary storage for values while the confirmation dialog is shown
  const pendingValues = useRef({
    minutesElapsed: 0,
    minutesRounded: 0,
    startTime: "",
    endTime: ""
  });

  // Effect to update currentSessionTagId if initialSelectedTagId prop changes
  useEffect(() => {
    setCurrentSessionTagId(initialSelectedTagId || null);
  }, [initialSelectedTagId]);

  const [currentIntention, setCurrentIntention] = useState<string | undefined>(intention);

  // Helper functions
  const convertSecondsToMinutes = (seconds: number): number => {
    return Math.floor(seconds / 60);
  };

  const adjustDateTime = (date: Date | null | undefined, minutesToAdd: number): Date | null | undefined => {
    if (!date) return date;
    const adjustedDate = new Date(date.getTime());
    const millisToAdd = minutesToAdd * 60 * 1000;
    adjustedDate.setTime(adjustedDate.getTime() + millisToAdd);
    return adjustedDate;
  };

  const convertSecondsToTimeFormat = (seconds: number): string => {
    const numHours = Math.floor((seconds / 60) / 60);
    const numMinutes = Math.floor((seconds / 60) % 60);
    const numSeconds = Math.floor(seconds % 60);

    // Only include hours if > 0
    const hoursStr = numHours > 0 ? `${numHours}:` : '';
    
    // Add leading zero to minutes only if there are hours
    const minutesStr = numHours > 0 && numMinutes < 10 ? `0${numMinutes}` : numMinutes;
    
    // Always add leading zero to seconds if < 10
    const secondsStr = numSeconds < 10 ? `0${numSeconds}` : numSeconds;

    return `${hoursStr}${minutesStr}:${secondsStr}`;
  };

  const fetchUserSessions = async () => {
    if (!userId) return [];
    
    try {
      setIsLoading(true);
      setError(null);
      const sessions = await SessionService.getActiveUserSessions(userId);
      return sessions;
    } catch (err) {
      console.error("Error fetching sessions:", err);
      setError("Failed to fetch sessions");
      return [];
    } finally {
      setIsLoading(false);
    }
  };

  // Calculate break time as 5 minutes for every 30 minutes of planned focus
  const calculateInitialBreakTime = (plannedMinutes: number): number => {
    return Math.floor(plannedMinutes / 30) * 5;
  };

  // Calculate remaining times
  function calculateRemainingTimes(dummy: null = null): void {
    console.log('⏱️ CALCULATE TIMES START ==================');
    console.log('Initial State:', {
      isBreak: isBreak.current,
      showConfirmation,
      sessionId: sessionId.current
    });
    
    // Don't recalculate times if confirmation is showing (to avoid visual jumps)
    if (showConfirmation) {
      console.log('Skipping calculation due to confirmation dialog');
      return;
    }
    
    try {
      if (isBreak.current) {
        console.log('Break Mode Calculation:', {
          breakEndTime: currBreakEndTime.current,
          breakStartTime: currBreakStartTime.current,
          currentTime: new Date().toLocaleString()
        });
        
        if (!currBreakEndTime.current || !currBreakStartTime.current) {
          console.warn("🚨 Break time values are null, returning to focus mode");
          returnToFocus();
          return;
        }

        const endTime = new Date(currBreakEndTime.current);
        const now = new Date();
        const timeDiffInMilliseconds = endTime.getTime() - now.getTime();
        secondsRemaining.current = Math.ceil(timeDiffInMilliseconds / 1000);

        const startTime = new Date(currBreakStartTime.current);
        const elapsedTimeDiffInMilliseconds = now.getTime() - startTime.getTime();
        secondsElapsed.current = Math.floor(elapsedTimeDiffInMilliseconds / 1000);

        console.log('Break Time Calculation Results:', {
          secondsRemaining: secondsRemaining.current,
          secondsElapsed: secondsElapsed.current,
          timeDiffInMilliseconds,
          elapsedTimeDiffInMilliseconds
        });
      } else {
        console.log('Focus Mode Calculation:', {
          focusEndTime: currFocusEndTime.current,
          focusStartTime: currFocusStartTime.current,
          currentTime: new Date().toLocaleString()
        });
        
        if (!currFocusEndTime.current || !currFocusStartTime.current) {
          console.warn("🚨 Focus time values are null, reinitializing session");
          if (!isInitializedRef.current && userId) {
            createNewUserSession();
          }
          return;
        }

        const endTime = new Date(currFocusEndTime.current);
        const now = new Date();
        const timeDiffInMilliseconds = endTime.getTime() - now.getTime();
        secondsRemaining.current = Math.ceil(timeDiffInMilliseconds / 1000);

        const startTime = new Date(currFocusStartTime.current);
        const elapsedTimeDiffInMilliseconds = now.getTime() - startTime.getTime();
        secondsElapsed.current = Math.floor(elapsedTimeDiffInMilliseconds / 1000);

        console.log('Focus Time Calculation Results:', {
          secondsRemaining: secondsRemaining.current,
          secondsElapsed: secondsElapsed.current,
          timeDiffInMilliseconds,
          elapsedTimeDiffInMilliseconds
        });
      }
    } catch (error) {
      console.error("❌ Error calculating remaining times:", error);
      secondsRemaining.current = 0;
      secondsElapsed.current = 0;
    }
    
    console.log('⏱️ CALCULATE TIMES END ==================\n');
  }

  // Set alias to avoid changing all call sites
  const setRemainingTimesFromEndTimes = calculateRemainingTimes;

  const handleSessionEnd = () => {
    console.log('🏁 Handling session end...', {
      sessionId: sessionId.current,
      secondsElapsed: secondsElapsed.current,
      isBreak: isBreak.current
    });

    if (!sessionId.current) {
      console.error("❌ No active session to end");
      return;
    }

    const endSession = async () => {
      try {
        const totalMinutes = Math.floor(secondsElapsed.current / 60);
        const roundedMinutes = Math.max(0, Math.floor(totalMinutes / 15) * 15);
        
        console.log('📊 Session completion stats:', {
          totalMinutes,
          roundedMinutes,
          selectedActions
        });

        totalMinutesElapsedRoundedToFifteen.current = roundedMinutes;

        console.log("Session ending with actions:", selectedActions);
        console.log("Total minutes:", totalMinutes, "Rounded minutes:", roundedMinutes);

        // Execute actions based on completed time
        if (selectedActions && selectedActions.length > 0) {
          console.log("Executing actions:", selectedActions);
          // Calculate if session was completed fully (90% threshold)
          const sessionCompletionThreshold = initialDuration * 0.9;
          const isFullyCompleted = secondsElapsed.current >= sessionCompletionThreshold;
          
          // Convert action types to FocusAction objects
          const actionObjects = selectedActions.map(actionType => {
            const action = FOCUS_ACTIONS.find(a => a.id === actionType);
            if (!action) {
              console.warn(`Action type ${actionType} not found, defaulting to build`);
              return FOCUS_ACTIONS.find(a => a.id === 'population_growth')!;
            }
            return action;
          });
          
          executeActions(actionObjects, isFullyCompleted, executeActionUpdate, playerNationResourceTotals);  
        }

        // Update session in Firebase AFTER executing actions

        if (!sessionId.current) {
          console.error("❌ No active session to update");
          throw new Error("No active session to update");
        }

        // Ensure session is properly marked as complete
        await SessionService.updateSession(sessionId.current, {
          session_state: 'complete',
          total_minutes_done: roundedMinutes,
          selected_actions: [] // Clear selected actions to prevent re-execution
        });

        // Clear the timer
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }

        // Set completion state AFTER calling the callback
        isCompleted.current = true;
        setRerender(prev => prev + 1);

        // Trigger completion callback
        if (onSessionComplete) {
          onSessionComplete(roundedMinutes);
        }
      } catch (error) {
        console.error("❌ Error ending session:", error);
        setError("Failed to end session");
      }
    };

    endSession();
  };

  const createNewUserSession = async () => {
    if (!userId || sessionCreationInProgressRef.current) {
      console.warn("Cannot create session: " + (!userId ? "No user ID" : "Session creation in progress"));
      return null;
    }

    try {
      sessionCreationInProgressRef.current = true;
      console.log("Creating new session with actions:", selectedActions);

      // Calculate focus end time
      const focusEndTime = new Date();
      focusEndTime.setSeconds(focusEndTime.getSeconds() + FOCUS_TIME_SECONDS);

      // Create new session
      const sessionData: SessionInsert = {
        user_id: userId,
        focus_start_time: new Date().toISOString(),
        focus_end_time: focusEndTime.toISOString(),
        planned_minutes: Math.floor(FOCUS_TIME_SECONDS / 60),
        session_state: 'focus',
        break_minutes_remaining: calculateInitialBreakTime(Math.floor(FOCUS_TIME_SECONDS / 60)),
        selected_actions: selectedActions,
        createdAt: serverTimestamp(),
        intention: intention,
        tagId: currentSessionTagId
      };

      const sessionResult = await SessionService.createSession(sessionData);
      console.log("New session created:", sessionResult);

      if (!sessionResult || !sessionResult.id) {
        throw new Error("Invalid session result - missing session ID");
      }

      sessionId.current = sessionResult.id;
      breakTimeRemaining.current = sessionResult.break_minutes_remaining;
      
      // Initialize focus times with type checking
      if (!sessionData.focus_start_time || !sessionData.focus_end_time) {
        throw new Error("Focus times are missing from session data");
      }
      
      currFocusStartTime.current = sessionData.focus_start_time;
      currFocusEndTime.current = sessionData.focus_end_time;

      // Initialize timer state
      setRemainingAndElapsedTime(sessionResult);
      isInitializedRef.current = true;

      // Start the timer
      if (!intervalRef.current) {
        intervalRef.current = setInterval(tick, 1000);
      }
      
      return sessionResult;
    } catch (error) {
      console.error("Error in createNewUserSession:", error);
      setError(error instanceof Error ? error.message : "Failed to create session");
      isInitializedRef.current = false; // Reset initialization flag to allow retry
      return null;
    } finally {
      sessionCreationInProgressRef.current = false;
    }
  };

  const setRemainingAndElapsedTime = (session: Session) => {
    if (isBreak.current) {
      if (session && session.break_end_time && session.break_start_time) {
        const endTime = new Date(session.break_end_time);
        const now = new Date();
        const timeDiffInMilliseconds = endTime.getTime() - now.getTime();
        secondsRemaining.current = Math.ceil(timeDiffInMilliseconds / 1000);

        const startTime = new Date(session.break_start_time);
        const elapsedTimeDiffInMilliseconds = now.getTime() - startTime.getTime();
        secondsElapsed.current = Math.floor(elapsedTimeDiffInMilliseconds / 1000);
      }
    } else {
      if (session && session.focus_end_time && session.focus_start_time) {
        const endTime = new Date(session.focus_end_time);
        const now = new Date();
        const timeDiffInMilliseconds = endTime.getTime() - now.getTime();
        secondsRemaining.current = Math.ceil(timeDiffInMilliseconds / 1000);

        const startTime = new Date(session.focus_start_time);
        const elapsedTimeDiffInMilliseconds = now.getTime() - startTime.getTime();
        secondsElapsed.current = Math.floor(elapsedTimeDiffInMilliseconds / 1000);
        
        // Store the break minutes remaining
        breakTimeRemaining.current = session.break_minutes_remaining;
      }
    }
  };

  const checkTime = () => {
    if (secondsRemaining.current <= 0) {
      if (isBreak.current) {
        returnToFocus();
      } else {
        // If timer runs out during focus, end the session
        console.log("Focus timer reached zero, initiating session end.");
        handleSessionEnd(); // Call the standard end handler
      }
    }
  };

  const promptSessionEnd = () => {
    // Store current elapsed and remaining times
    setRemainingTimesFromEndTimes(null);
    
    // Calculate total focus time
    const totalFocusMinutes = Math.floor(secondsElapsed.current / 60);
    const totalFocusMinutesRoundedToNearestFifteenMinutes = Math.floor(totalFocusMinutes / 15) * 15;
    
    // Save to pending values instead of directly updating the refs
    pendingValues.current = {
      minutesElapsed: totalFocusMinutes,
      minutesRounded: totalFocusMinutesRoundedToNearestFifteenMinutes,
      startTime: currFocusStartTime.current,
      endTime: new Date().toUTCString()
    };
    
    // Show confirmation without stopping the timer
    setShowConfirmation(true);
    setRerender(prev => prev + 1);
  };

  const cancelSessionEnd = () => {
    // Just hide the confirmation, timer continues as normal
    setShowConfirmation(false);
    setRerender(prev => prev + 1); // Ensure re-render to hide dialog
  };

  const confirmSessionEnd = () => {
    // Now apply the saved values and end the session
    setShowConfirmation(false);
    actualMinutesElapsed.current = pendingValues.current.minutesElapsed;
    totalMinutesElapsedRoundedToFifteen.current = pendingValues.current.minutesRounded;
    handleSessionEnd();
  };

  // Add a test function to simulate a 15-minute session completion
  const testFifteenMinutes = async () => {
    if (!userId || !sessionId.current) return;
    
    // Calculate start time (15 minutes ago)
    const fifteenMinutesAgo = new Date();
    fifteenMinutesAgo.setMinutes(fifteenMinutesAgo.getMinutes() - 15);
    const startTime = fifteenMinutesAgo.toUTCString();
    
    // Current time as end time
    const endTime = new Date().toUTCString();
    
    // Store test values in pending storage, don't modify actual timer yet
    pendingValues.current = {
      minutesElapsed: 15,
      minutesRounded: 15,
      startTime: startTime,
      endTime: endTime
    };
    
    // Show the confirmation popup without changing the timer
    setShowConfirmation(true);
    setRerender(prev => prev + 1);
  };

  // Add function to debug session data
  const printSessionData = async () => {
    if (!userId) {
      console.log("No user ID provided");
      return;
    }

    try {
      const sessions = await SessionService.getActiveUserSessions(userId);
      if (sessions.length === 0) {
        console.log("No active sessions found");
        return;
      }
      
      const activeSession = sessions[0];
      console.log("Active Session Data:", activeSession);
      
      // Display in alert for easy viewing during testing
      alert(
        `Session ID: ${activeSession.id}\n` +
        `State: ${activeSession.session_state}\n` +
        `Planned Minutes: ${activeSession.planned_minutes}\n` +
        `Actions: ${JSON.stringify(activeSession.selected_actions)}\n` +
        `Started: ${new Date(activeSession.focus_start_time || '').toLocaleString()}\n` +
        `Break Time Left: ${activeSession.break_minutes_remaining} minutes`
      );
    } catch (error) {
      console.error("Error fetching session data:", error);
      setError("Failed to fetch session data");
    }
  };

  // Add function to print game state
  const printGameState = () => {
    console.log("Current Game State:", currentGame);
    console.log("Game Loading:", gameLoading);
  };

  const tick = () => {
    // Make sure isBreak is set correctly
    if (isBreak.current) {
      console.log("Is break is true");
    } else {
      console.log("Is break is false");
    }

    // Detailed state logging at start of tick
    // console.log('🔄 TICK START ==================');
    // console.log('Session Info:', {
    //   sessionId: sessionId.current,
    //   isBreak: isBreak.current,
    //   breakTimeRemaining: breakTimeRemaining.current
    // });
    
    // console.log('Timer State:', {
    //   secondsRemaining: secondsRemaining.current,
    //   secondsElapsed: secondsElapsed.current
    // });
    
    // console.log('Focus Times:', {
    //   focusStartTime: currFocusStartTime.current,
    //   focusEndTime: currFocusEndTime.current,
    //   focusStartDate: new Date(currFocusStartTime.current).toLocaleString(),
    //   focusEndDate: new Date(currFocusEndTime.current).toLocaleString()
    // });
    
    // console.log('Break Times:', {
    //   breakStartTime: currBreakStartTime.current,
    //   breakEndTime: currBreakEndTime.current,
    //   breakStartDate: currBreakStartTime.current ? new Date(currBreakStartTime.current).toLocaleString() : null,
    //   breakEndDate: currBreakEndTime.current ? new Date(currBreakEndTime.current).toLocaleString() : null
    // });

    // // Log before calculating remaining times
    // console.log('Before setRemainingTimesFromEndTimes');
    setRemainingTimesFromEndTimes(null);
    // console.log('After setRemainingTimesFromEndTimes:', {
    //   newSecondsRemaining: secondsRemaining.current,
    //   newSecondsElapsed: secondsElapsed.current
    // });

    // // Log before checking time
    // console.log('Before checkTime');
    checkTime();
    // console.log('After checkTime:', {
    //   isBreak: isBreak.current,
    //   secondsRemaining: secondsRemaining.current
    // });

    


    // Calculate it based on the session end time

    const endTime = new Date(currFocusEndTime.current);
    const now = new Date();
    const timeDiffInMilliseconds = endTime.getTime() - now.getTime();
    const focusTimeRemaining = Math.ceil(timeDiffInMilliseconds / 1000);
    setFocusTimeRemaining(focusTimeRemaining);  
    setRerender((e) => e + 1);




    // console.log('🔄 TICK END ==================\n');
  };

  useEffect(() => {
    console.log('🔄 Initialize session effect triggered', {
      isInitialized: isInitializedRef.current,
      userId,
      existingSessionId,
      hasSelectedActions: selectedActions.length > 0,
      intention // Log intention for debugging
    });

    if (isInitializedRef.current || !userId) {
      console.log('⏭️ Skipping initialization:', {
        alreadyInitialized: isInitializedRef.current,
        noUserId: !userId,
        // hasActiveSession: !!existingSessionId // Corrected 'hasActiveSession' usage for logging
      });
      return;
    }

    const initializeSession = async () => {
      if (!userId) {
        console.warn("No user ID provided");
        return;
      }

      try {
        if (isInitializedRef.current) {
          console.log("Session already initialized");
          return;
        }

        console.log("Initializing session...");
        const existingSessions = await SessionService.getActiveUserSessions(userId);

        if (existingSessions.length > 0) {
          console.log("Found existing session");
          const session = existingSessions[0];
          sessionId.current = session.id;
          breakTimeRemaining.current = session.break_minutes_remaining;
          
          // Load the intention from the existing session with type checking
          if (session.intention) {
            setCurrentIntention(session.intention);
          }
          // Load the tagId from the existing session
          if (session.tagId) {
            setCurrentSessionTagId(session.tagId);
          }
          
          // Initialize focus times with type checking
          if (session.focus_start_time && session.focus_end_time) {
            currFocusStartTime.current = session.focus_start_time;
            currFocusEndTime.current = session.focus_end_time;
          }

          // Initialize timer state
          setRemainingAndElapsedTime(session);
          isInitializedRef.current = true;

          // Start the timer
          if (!intervalRef.current) {
            intervalRef.current = setInterval(tick, 1000);
          }
        } else {
          console.log("No active session found, creating new session");
          const newSession = await createNewUserSession();
          
          if (!newSession) {
            throw new Error("Failed to create new session");
          }
        }
      } catch (error) {
        console.error("Error in initializeSession:", error);
        setError(error instanceof Error ? error.message : "Failed to initialize session");
        
        // Reset initialization state to allow for retry
        isInitializedRef.current = false;
        sessionId.current = undefined;
        
        // Clear any existing interval
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }
      }
    };

    initializeSession();

    // Cleanup function to clear interval when component unmounts
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [userId, FOCUS_TIME_SECONDS, existingSessionId, selectedActions, intention]); // Add intention to dependency array

  const deleteSession = async () => {
    try {
      if (!sessionId.current) {
        console.error("No active session to delete");
        return;
      }
      await SessionService.deleteSession(sessionId.current);
      isCompleted.current = true;
      setRerender((e) => e + 1);
    } catch (error) {
      console.error("Error deleting session:", error);
      setError("Failed to delete session");
    }
  };

  const setBreak = async () => {
    console.log('⏸️ Setting break...', {
      breakTimeRemaining: breakTimeRemaining.current,
      isBreak: isBreak.current,
      sessionId: sessionId.current
    });

    if (!sessionId.current) {
      console.error("No active session to update");
      return;
    }

    if (breakTimeRemaining.current >= 5) {
      if (!isBreak.current) {
        const currTime = new Date();
        const breakEndingTime = adjustDateTime(currTime, convertSecondsToMinutes(BREAK_TIME_SECONDS))?.toUTCString();
        const session: SessionUpdate = {
          break_end_time: breakEndingTime,
          break_start_time: currTime.toUTCString(),
          break_minutes_remaining: breakTimeRemaining.current - 5,
          session_state: "break",
        };
        
        if (!breakEndingTime) {
          throw new Error("Break ending time is null");
        }
        
        currBreakEndTime.current = breakEndingTime;
        currBreakStartTime.current = currTime.toUTCString();
        const updatedWithBreak = await SessionService.updateSession(sessionId.current, session);
        

        isBreak.current = true;
        console.log("Set is break to true");  
        if (updatedWithBreak) {
          setRemainingAndElapsedTime(updatedWithBreak);
        } else {
          throw new Error("Break is null");
        }
      } else {
        if (!currBreakEndTime.current) {
          throw new Error("Curr break ending time is null");
        }
        
        const breakEndingTime = adjustDateTime(new Date(currBreakEndTime.current), convertSecondsToMinutes(BREAK_TIME_SECONDS))?.toUTCString();
        const session: SessionUpdate = {
          break_end_time: breakEndingTime,
          break_minutes_remaining: breakTimeRemaining.current - 5,
          session_state: "break",
        };
        
        if (!breakEndingTime) {
          throw new Error("Break ending time is null");
        }
        
        currBreakEndTime.current = breakEndingTime;
        const updatedWithBreak = await SessionService.updateSession(sessionId.current, session);
        
        if (updatedWithBreak) {
          setRemainingAndElapsedTime(updatedWithBreak);
        }
      }
      
      breakTimeRemaining.current -= 5;
      setRerender((e) => e + 1);
    } else {
      console.warn("⚠️ Not enough break time remaining:", breakTimeRemaining.current);
    }
  };

  const returnToFocus = async () => {
    console.log('▶️ Returning to focus...', {
      sessionId: sessionId.current,
      isBreak: isBreak.current
    });

    if (!sessionId.current) {
      console.error("No active session to update");
      return;
    }

    const session: SessionUpdate = {
      session_state: "focus",
    };
    
    try {
      const updatedWithBreak = await SessionService.updateSession(sessionId.current, session);
      console.log('✅ Focus state updated:', updatedWithBreak);
      
      if (updatedWithBreak) {
        isBreak.current = false;
        console.log("Set is break to false");
      }
      
      setRemainingTimesFromEndTimes(null);
      setRerender((e) => e + 1);
    } catch (error) {
      console.error("❌ Error returning to focus:", error);
    }
  };

  const getMinutesOrHoursIfOverSixty = (seconds: number): string => {
    if (seconds < 3600) {
      return (seconds / 60) + "m";
    } else {
      return (seconds / 60 / 60) + "h";
    }
  };

  // Add a function to adjust session time by -15 minutes
  const adjustSessionTimeMinus15 = async () => {
    if (!userId || !sessionId.current) return;
    
    try {
      // Calculate new start time (15 minutes earlier)
      const currentStartTime = new Date(currFocusStartTime.current);
      currentStartTime.setMinutes(currentStartTime.getMinutes() - 15);
      const newStartTime = currentStartTime.toUTCString();
      
      // Calculate new end time (15 minutes earlier)
      const currentEndTime = new Date(currFocusEndTime.current);
      currentEndTime.setMinutes(currentEndTime.getMinutes() - 15);
      const newEndTime = currentEndTime.toUTCString();
      
      // Update the session in Firebase
      await SessionService.updateSession(sessionId.current, {
        focus_start_time: newStartTime,
        focus_end_time: newEndTime
      });
      
      // Update local state
      currFocusStartTime.current = newStartTime;
      currFocusEndTime.current = newEndTime;
      
      // Recalculate timer values
      setRemainingTimesFromEndTimes(null);
      setRerender(prev => prev + 1);
      
      console.log("Session times adjusted by -15 minutes");
    } catch (error) {
      console.error("Error adjusting session time:", error);
      setError("Failed to adjust session time");
    }
  };

  // Add function to adjust session time by +60 minutes
  const adjustSessionTimePlus60 = async () => {
    if (!userId || !sessionId.current) return;
    
    try {
      // Calculate new start time (60 minutes later)
      const currentStartTime = new Date(currFocusStartTime.current);
      currentStartTime.setMinutes(currentStartTime.getMinutes() - 60);
      const newStartTime = currentStartTime.toUTCString();
      
      // Calculate new end time (60 minutes later)
      const currentEndTime = new Date(currFocusEndTime.current);
      currentEndTime.setMinutes(currentEndTime.getMinutes() - 60);
      const newEndTime = currentEndTime.toUTCString();
      
      // Update the session in Firebase
      await SessionService.updateSession(sessionId.current, {
        focus_start_time: newStartTime,
        focus_end_time: newEndTime
      });
      
      // Update local state
      currFocusStartTime.current = newStartTime;
      currFocusEndTime.current = newEndTime;
      
      // Recalculate timer values
      setRemainingTimesFromEndTimes(null);
      setRerender(prev => prev + 1);
      
      console.log("Session times adjusted by -60 minutes");
    } catch (error) {
      console.error("Error adjusting session time:", error);
      setError("Failed to adjust session time");
    }
  };

  // Handle session completion
  const handleSessionComplete = (minutesElapsed: number) => {
    // Just close the modal without redirecting
    if (onSessionComplete) {
      onSessionComplete(minutesElapsed);
    }
  };

  // Function to handle saving the edited intention
  const handleSaveIntention = async () => {
    if (!sessionId.current || editableIntention === currentIntention) {
      setIsEditingIntention(false);
      return;
    }

    try {
      await SessionService.updateSession(sessionId.current, { intention: editableIntention });
      setCurrentIntention(editableIntention);
      setIsEditingIntention(false);
      console.log("✅ Intention updated successfully:", editableIntention);
    } catch (error) {
      console.error("❌ Error updating intention:", error);
      // Optionally, revert editableIntention or show an error to the user
    }
  };

  // Handler for when the tag is changed within the FocusTimer's TagSelector
  const handleTimerSessionTagUpdate = async (newTagId: string | null) => {
    setCurrentSessionTagId(newTagId);
    if (sessionId.current) {
      try {
        await SessionService.updateSession(sessionId.current, { tagId: newTagId });
        console.log('Session tag updated in timer:', newTagId);
      } catch (error) {
        console.error('Error updating session tag from timer:', error);
        // Optionally revert setCurrentSessionTagId or show an error
      }
    }
  };

  if (isLoading) {
    return <div className="timer-page">Loading timer...</div>;
  }

  if (error) {
    return <div className="timer-page">Error: {error}</div>;
  }

  if (!userId) {
    return <div className="timer-page">Please log in to use the timer</div>;
  }

  return (
    <div className="h-full w-full flex justify-center items-center p-5 [font-family:var(--font-mplus-rounded)]">
      {showConfirmation && (
        <SessionConfirmation
          minutesElapsed={pendingValues.current.minutesElapsed}
          minutesRounded={pendingValues.current.minutesRounded}
          onConfirm={confirmSessionEnd}
          onCancel={cancelSessionEnd}
        />
      )}
      
      {!isCompleted.current && ( 
        <div className="bg-white rounded-xl p-6 sm:p-8 w-full max-w-[700px] mx-auto text-gray-800" style={{ transform: 'translateY(-2px)' }}>
          <div>
            <h1 className="text-center text-2xl mb-0 font-semibold text-gray-800 flex items-center justify-center gap-2">
              <span className="text-3xl">{isBreak.current ? "☕" : "🎯"}</span>
              {isBreak.current ? "Taking a Break for " : "Focusing for "} 
              {isBreak.current 
                ? getMinutesOrHoursIfOverSixty(BREAK_TIME_SECONDS) 
                : getMinutesOrHoursIfOverSixty(FOCUS_TIME_SECONDS)
              }
            </h1>
          </div>

          <div className="my-1 flex justify-center">
            <div className="text-[4rem] font-bold text-gray-800">
              {convertSecondsToTimeFormat(secondsRemaining.current < 0 ? 0 : secondsRemaining.current)}
            </div>
          </div>

          {currentIntention && !isEditingIntention && (
            <div className="text-center mb-2 flex items-center justify-center gap-2">
              <p className="text-lg text-gray-600 italic">{currentIntention}</p>
              <button 
                onClick={() => {
                  setEditableIntention(currentIntention || "");
                  setIsEditingIntention(true);
                  setTimeout(() => intentionInputRef.current?.focus(), 0);
                }} 
                className="text-gray-500 hover:text-gray-700 transition-colors p-1"
                aria-label="Edit intention"
              >
                ✏️
              </button>
            </div>
          )}

          {isEditingIntention && (
            <div className="text-center mb-2">
              <input
                ref={intentionInputRef}
                type="text"
                value={editableIntention}
                onChange={(e) => setEditableIntention(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleSaveIntention();
                  } else if (e.key === 'Escape') {
                    setIsEditingIntention(false);
                    setEditableIntention(currentIntention || ""); // Revert changes
                  }
                }}
                onBlur={handleSaveIntention}
                className="text-lg text-gray-700 italic border border-gray-300 rounded px-2 py-1 text-center focus:outline-none focus:ring-1 focus:ring-[#6ec53e]"
              />
            </div>
          )}

          <div className="my-8">
            <div className="h-3 bg-gray-100 rounded-lg overflow-hidden border border-gray-200 mb-6">
              <div
                className="h-full bg-gradient-to-r from-[#6ec53e] to-[#8ed75f] rounded-lg transition-all duration-500"
                style={{ 
                  width: `${(secondsElapsed.current / (secondsElapsed.current + secondsRemaining.current)) * 100}%` 
                }}
              ></div>
            </div>

            {/* Tag Selector - Placed below progress bar */}
            {userId && availableTags && ( // Ensure necessary props are available
              <div className="my-4 sm:my-6 px-1 sm:px-2 max-w-xs mx-auto"> {/* Centered and width constrained - changed to max-w-xs */}
                <TagSelector
                  userId={userId}
                  availableTags={availableTags}
                  selectedTagId={currentSessionTagId}
                  onTagSelect={handleTimerSessionTagUpdate}
                  onTagCreate={onFinalTagCreate} // Pass through the handler from parent
                  onColorChangeRequest={onFinalTagColorChangeRequest} // Pass through the handler from parent
                  onTagArchiveRequest={undefined} // Archiving not handled directly from timer view for now
                  className="w-full"
                />
              </div>
            )}

            {/* Main Action Buttons - Ensure this is the ONLY button block here */}
            {isBreak.current ? (
              <div className="flex flex-row justify-center items-center mt-6 sm:mt-8 mb-8 sm:mb-12 gap-8"> 
                {/* Save button */}
                <button 
                  className="bg-white text-gray-800 border-2 border-gray-300 py-4 px-6 rounded-lg text-lg font-semibold cursor-pointer transition-all duration-150 hover:bg-gray-50 flex-1 flex items-center justify-center gap-2 hover:translate-y-[-1px] active:translate-y-[0.5px] active:shadow-[0_1px_0px_#d1d5db]"
                  style={{ boxShadow: '0 3px 0px #d1d5db', minWidth: '180px' }}
                  onClick={promptSessionEnd}
                >
                  <span className="text-2xl">💾</span>
                  Save
                </button>
                {/* Resume button */}
                <button 
                  className="bg-[#6ec53e] text-white py-4 px-6 rounded-lg text-lg font-semibold cursor-pointer transition-all duration-150 hover:opacity-90 flex-1 flex items-center justify-center gap-2 border-2 border-[#59a700] hover:bg-[#60b33a] active:bg-[#539e30] hover:translate-y-[-1px] active:translate-y-[0.5px] active:shadow-[0_1px_0px_#59a700]"
                  style={{ boxShadow: '0 3px 0px #59a700', minWidth: '180px' }}
                  onClick={returnToFocus}
                >
                  <span className="text-2xl">▶️</span>
                  Resume
                </button>
                {/* Extend break button */}
                <button 
                  className="bg-white text-gray-800 border-2 border-gray-300 py-2 px-4 rounded-lg text-base font-semibold cursor-pointer transition-all duration-150 hover:bg-gray-50 flex-1 flex items-center justify-center gap-1 hover:translate-y-[-1px] active:translate-y-[0.5px] active:shadow-[0_1px_0px_#d1d5db] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-[0_2px_0px_#d1d5db]"
                  style={{ boxShadow: '0 2px 0px #d1d5db', minWidth: '180px' }}
                  onClick={setBreak} 
                  disabled={breakTimeRemaining.current === 0}
                >
                  <span className="text-lg">⏰</span>
                  <span className="text-center">Extend break<br/>({breakTimeRemaining.current}m left)</span>
                </button>
              </div>
            ) : (
              <div className="flex flex-row justify-center items-center mt-6 sm:mt-8 mb-8 sm:mb-12 gap-8"> 
                {/* Save button */}
                <button 
                  className="bg-white text-gray-800 border-2 border-gray-300 py-4 px-6 rounded-lg text-lg font-semibold cursor-pointer transition-all duration-150 hover:bg-gray-50 flex-1 flex items-center justify-center gap-2 hover:translate-y-[-1px] active:translate-y-[0.5px] active:shadow-[0_1px_0px_#d1d5db]"
                  style={{ boxShadow: '0 3px 0px #d1d5db', minWidth: '220px' }}
                  onClick={promptSessionEnd}
                >
                  <span className="text-2xl">💾</span>
                  Save
                </button>
                {/* Take break button */}
                <button 
                  className="bg-[#6ec53e] text-white py-4 px-6 rounded-lg text-lg font-semibold cursor-pointer transition-all duration-150 hover:opacity-90 flex-1 flex items-center justify-center gap-2 border-2 border-[#59a700] hover:bg-[#60b33a] active:bg-[#539e30] hover:translate-y-[-1px] active:translate-y-[0.5px] active:shadow-[0_1px_0px_#59a700] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:bg-gray-400 disabled:border-gray-500 disabled:shadow-[0_3px_0px_gray-500]"
                  style={{ boxShadow: '0 3px 0px #59a700', minWidth: '220px' }}
                  onClick={setBreak} 
                  disabled={breakTimeRemaining.current === 0}
                >
                  <span className="text-2xl">☕</span>
                  Take break
                </button>
              </div>
            )}
          </div>

          {/* Debug Section - Updated Styles */}
          <div className="mt-12 pt-6 border-t border-gray-200 opacity-70 hover:opacity-100 transition-opacity">
            <button 
              className="bg-white text-gray-600 border-2 border-gray-300 py-1 px-3 rounded-lg text-xs cursor-pointer transition-all duration-150 hover:bg-gray-50 mx-auto block mb-3 hover:translate-y-[-1px] active:translate-y-[0.5px] active:shadow-[0_1px_0px_#d1d5db]"
              style={{ boxShadow: '0 2px 0px #d1d5db' }} // 2px shadow for small button
              onClick={() => setDebugToolsState((prev: DebugToolsState) => ({ ...prev, show: !prev.show }))}
            > 
              {debugToolsState.show ? 'Hide' : 'Show'} Debug Tools 
            </button> 

            {debugToolsState.show && ( 
              <div className="flex justify-center flex-wrap gap-3"> 
                <button 
                  className="bg-white text-gray-600 border-2 border-gray-300 py-2 px-4 rounded-lg text-sm cursor-pointer transition-all duration-150 hover:bg-gray-50 hover:translate-y-[-1px] active:translate-y-[0.5px] active:shadow-[0_1px_0px_#d1d5db]"
                  style={{ boxShadow: '0 2px 0px #d1d5db' }} // 2px shadow for small button
                  onClick={adjustSessionTimePlus60} 
                > 
                  Adjust -60min 
                </button> 
              </div> 
            )} 
          </div>
        </div>
      )}
    </div>
  );
};

export default FocusTimer; 