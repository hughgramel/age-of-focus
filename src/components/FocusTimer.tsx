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
import '@/app/timer.css';

interface FocusTimerProps {
  userId: string | null;
  initialDuration?: number; // in seconds
  onSessionComplete?: (minutesElapsed: number) => void;
}

interface SessionCompleteProps {
  minutesElapsed: number;
  level: string;
  startTime: string;
  endTime: string;
  onReturnHome?: () => void;
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
    <div className="session-confirmation-overlay">
      <div className="session-confirmation-modal">
        <h2>End Session?</h2>
        
        {willRoundToZero ? (
          <div className="warning-message">
            <p>Warning: Your session lasted less than 15 minutes and will be rounded down to 0 minutes.</p>
            <p>Current time: {minutesElapsed} minutes</p>
            <p>Rounded time: 0 minutes</p>
          </div>
        ) : (
          <div className="confirmation-message">
            <p>You've focused for {minutesElapsed} minutes.</p>
            {minutesElapsed !== minutesRounded && (
              <p>This will be rounded to {minutesRounded} minutes (nearest 15-minute increment).</p>
            )}
          </div>
        )}
        
        <div className="confirmation-buttons">
          <button className="cancel-button" onClick={onCancel}>
            Continue Session
          </button>
          <button className="confirm-button" onClick={onConfirm}>
            End Session
          </button>
        </div>
      </div>
    </div>
  );
};

const SessionComplete = ({ 
  minutesElapsed, 
  level, 
  startTime, 
  endTime, 
  onReturnHome 
}: SessionCompleteProps) => {
  const router = useRouter();
  
  const formatTimeElapsed = (minutes: number): string => {
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

  const formatTimeStamp = (timeString: string): string => {
    const date = new Date(timeString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const handleReturnHome = () => {
    if (onReturnHome) {
      onReturnHome();
    }
    router.push('/dashboard');
  };

  return (
    <div className="session-complete-container">
      <div className="session-complete-card">
        <div className="session-complete-header">
          <h1>Session Complete!</h1>
        </div>
        
        <div className="session-complete-content">
          <div className="session-stats">
            <div className="stat-item">
              <div className="stat-icon">⏱️</div>
              <div className="stat-info">
                <h3>Focused for</h3>
                <p className="stat-value">{formatTimeElapsed(minutesElapsed)}</p>
              </div>
            </div>
            
            <div className="stat-item">
              <div className="stat-icon">🕒</div>
              <div className="stat-info">
                <h3>Session Details</h3>
                <p className="stat-detail">Start: {formatTimeStamp(startTime)}</p>
                <p className="stat-detail">End: {formatTimeStamp(endTime)}</p>
              </div>
            </div>
          </div>
          
          <div className="completion-message">
            <p>Well done! You've completed a focus session!</p>
          </div>
          
          <div className="return-home-container">
            <button className="return-home-button" onClick={handleReturnHome}>
              Return to Dashboard
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const FocusTimer: React.FC<FocusTimerProps> = ({ 
  userId, 
  initialDuration = 60 * 60, // Default to 1 hour
  onSessionComplete 
}) => {
  // Default timer durations
  const FOCUS_TIME_SECONDS = initialDuration;
  const BREAK_TIME_SECONDS = 60 * 5; // 5 minutes
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [, setRerender] = useState(0);
  const [showConfirmation, setShowConfirmation] = useState(false);
  
  // Refs to track timer state
  const secondsRemaining = useRef(0);
  const secondsElapsed = useRef(0);
  const sessionCreationInProgressRef = useRef(false);
  const isInitializedRef = useRef(false);
  const sessionId = useRef("");
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
  
  // Temporary storage for values while the confirmation dialog is shown
  const pendingValues = useRef({
    minutesElapsed: 0,
    minutesRounded: 0,
    startTime: "",
    endTime: ""
  });

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

    const hoursStr = numHours < 10 ? `0${numHours}` : numHours;
    const minutesStr = numMinutes < 10 ? `0${numMinutes}` : numMinutes;
    const secondsStr = numSeconds < 10 ? `0${numSeconds}` : numSeconds;

    return `${hoursStr}:${minutesStr}:${secondsStr}`;
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

  // Calculate break time as 1/6th of planned time (replacing the old calculation logic)
  const calculateInitialBreakTime = (plannedMinutes: number): number => {
    return Math.floor(plannedMinutes / 6);
  };

  // Function to calculate and update the remaining and elapsed times based on current end times
  function calculateRemainingTimes(dummy: null = null): void {
    // Don't recalculate times if confirmation is showing (to avoid visual jumps)
    if (showConfirmation) return;
    
    if (isBreak.current) {
      if (!currBreakEndTime.current || !currBreakStartTime.current) throw new Error("Break time must not be null here");
      const endTime = new Date(currBreakEndTime.current);
      const now = new Date();
      const timeDiffInMilliseconds = endTime.getTime() - now.getTime();
      secondsRemaining.current = Math.ceil(timeDiffInMilliseconds / 1000);

      const startTime = new Date(currBreakStartTime.current);
      const elapsedTimeDiffInMilliseconds = now.getTime() - startTime.getTime();
      secondsElapsed.current = Math.floor(elapsedTimeDiffInMilliseconds / 1000);
    } else {
      if (!currFocusEndTime.current || !currFocusStartTime.current) throw new Error("Focus time must not be null here");
      const endTime = new Date(currFocusEndTime.current);
      const now = new Date();
      const timeDiffInMilliseconds = endTime.getTime() - now.getTime();
      secondsRemaining.current = Math.ceil(timeDiffInMilliseconds / 1000);

      const startTime = new Date(currFocusStartTime.current);
      const elapsedTimeDiffInMilliseconds = now.getTime() - startTime.getTime();
      secondsElapsed.current = Math.floor(elapsedTimeDiffInMilliseconds / 1000);
      
      // No need to modify break time here
    }
  }

  // Set alias to avoid changing all call sites
  const setRemainingTimesFromEndTimes = calculateRemainingTimes;

  const createNewUserSession = async () => {
    if (!userId || sessionCreationInProgressRef.current) {
      return null;
    }
    
    try {
      sessionCreationInProgressRef.current = true;
      setIsLoading(true);
      setError(null);
      
      const latestSessions = await SessionService.getActiveUserSessions(userId);
      if (latestSessions && latestSessions.length > 0) {
        return null;
      }
      
      const currTime = new Date();
      const ending_time = adjustDateTime(currTime, convertSecondsToMinutes(FOCUS_TIME_SECONDS))?.toUTCString();

      if (!ending_time) throw new Error("Failed to calculate ending time");

      const plannedMinutes = convertSecondsToMinutes(FOCUS_TIME_SECONDS);
      // Calculate break time as 1/6th of the planned time
      const initialBreakMinutes = calculateInitialBreakTime(plannedMinutes);

      const newSession: SessionInsert = {
        break_end_time: null,
        break_minutes_remaining: initialBreakMinutes,
        total_minutes_done: 0,
        break_start_time: null,
        focus_start_time: currTime.toUTCString(),
        focus_end_time: ending_time,
        createdAt: serverTimestamp(),
        session_state: "focus",
        user_id: userId,
        planned_minutes: plannedMinutes
      };

      const session = await SessionService.createSession(newSession);
      
      currFocusEndTime.current = ending_time;
      currFocusStartTime.current = currTime.toUTCString();
      return session;
    } catch (err) {
      console.error("Error creating session:", err);
      setError("Failed to create session");
      return null;
    } finally {
      sessionCreationInProgressRef.current = false;
      setIsLoading(false);
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
      const overflowSeconds = -1 * secondsRemaining.current;
      secondsElapsed.current = secondsElapsed.current - overflowSeconds;
      
      // Calculate minutes for completed session
      const totalFocusMinutes = Math.floor(secondsElapsed.current / 60);
      const totalFocusMinutesRoundedToNearestFifteenMinutes = Math.floor(totalFocusMinutes / 15) * 15;
      
      if (isBreak.current) {
        returnToFocus();
      } else {
        // For naturally ended sessions (through tick), directly complete without confirmation
        console.log("Session naturally completed - directly showing completion screen");
        
        // Apply values directly
        actualMinutesElapsed.current = totalFocusMinutes;
        totalMinutesElapsedRoundedToFifteen.current = totalFocusMinutesRoundedToNearestFifteenMinutes;
        pendingValues.current = {
          minutesElapsed: totalFocusMinutes,
          minutesRounded: totalFocusMinutesRoundedToNearestFifteenMinutes,
          startTime: currFocusStartTime.current,
          endTime: new Date().toUTCString()
        };
        
        // Skip confirmation and directly end the session
        handleSessionEnd();
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

  const handleSessionEnd = () => {
    isBreak.current = false;
    setRemainingTimesFromEndTimes(null);

    // Calculate total focus time
    const totalFocusMinutes = actualMinutesElapsed.current;
    
    const endSession = async () => {
      await SessionService.updateSession(sessionId.current, {
        session_state: 'complete',
        total_minutes_done: totalFocusMinutes
      });
    };
    endSession();

    secondsRemaining.current = 0;
    secondsElapsed.current = 0;
    sessionCreationInProgressRef.current = false;
    
    isCompleted.current = true;

    if (intervalRef.current) clearInterval(intervalRef.current);
    
    // Call the optional callback if provided
    if (onSessionComplete) {
      console.log("Completing session with minutes:", totalMinutesElapsedRoundedToFifteen.current);
      onSessionComplete(totalMinutesElapsedRoundedToFifteen.current);
    }
    
    setRerender((e) => e + 1);
  };

  const tick = () => {
    intervalRef.current = setInterval(() => {
      setRemainingTimesFromEndTimes(null);
      checkTime();
      setRerender((e) => e + 1);
    }, 1000);
  };

  useEffect(() => {
    tick();
    return () => { 
      if (intervalRef.current) clearInterval(intervalRef.current); 
    };
  }, []);

  useEffect(() => {
    if (isInitializedRef.current || !userId) {
      return;
    }

    isInitializedRef.current = true;

    const initializeSession = async () => {
      try {
        setIsLoading(true);
        
        const existingSessions = await fetchUserSessions();
        
        if (!existingSessions || existingSessions.length === 0) {
          const newSession = await createNewUserSession();
          if (newSession) {
            setRemainingAndElapsedTime(newSession);
            sessionId.current = newSession.id;
            breakTimeRemaining.current = newSession.break_minutes_remaining;
          } else {
            throw new Error("Session was not initialized");
          }
        } else {
          const session = existingSessions[0];
          sessionId.current = session.id;
          isBreak.current = session.session_state === "break";
          
          // Check if session has end times
          if (!session.focus_end_time || !session.focus_start_time) {
            throw new Error("Session end time is null");
          }

          // Set focus times from session
          currFocusEndTime.current = session.focus_end_time;
          currFocusStartTime.current = session.focus_start_time;
          
          // Set break time and break times if in break state
          breakTimeRemaining.current = session.break_minutes_remaining;
          
          if (session.break_end_time && session.break_start_time) {
            currBreakEndTime.current = session.break_end_time;
            currBreakStartTime.current = session.break_start_time;
          } else {
            currBreakEndTime.current = "";
            currBreakStartTime.current = "";
          }

          // Calculate time remaining
          setRemainingTimesFromEndTimes(null);
          
          // Check if the session has expired (i.e., came back after 1+ hour)
          const now = new Date();
          const focusEndTime = new Date(session.focus_end_time);
          
          // Session should be complete if the focus end time has passed
          if (now > focusEndTime && !isBreak.current) {
            console.log("Session expired - directly showing completion screen");
            
            // Calculate how much time was successfully completed
            const focusStartTime = new Date(session.focus_start_time);
            const totalFocusSeconds = (focusEndTime.getTime() - focusStartTime.getTime()) / 1000;
            
            // Calculate rounded minutes for expired session
            const totalFocusMinutes = Math.floor(totalFocusSeconds / 60);
            const totalFocusMinutesRoundedToNearestFifteenMinutes = Math.floor(totalFocusMinutes / 15) * 15;
            
            // Apply values directly without showing confirmation
            actualMinutesElapsed.current = totalFocusMinutes;
            totalMinutesElapsedRoundedToFifteen.current = totalFocusMinutesRoundedToNearestFifteenMinutes;
            
            // Handle session completion directly
            handleSessionEnd();
            return;
          }
          
          // If in break mode and break has expired, return to focus mode
          if (isBreak.current && secondsRemaining.current <= 0) {
            console.log("Break expired - returning to focus");
            await returnToFocus();
          }
        }
      } catch (error) {
        console.error("Error initializing session:", error);
        setError("Failed to initialize session");
      } finally {
        setIsLoading(false);
      }
    };

    initializeSession();
  }, [userId, FOCUS_TIME_SECONDS]);

  const deleteSession = async () => {
    try {
      await SessionService.deleteSession(sessionId.current);
      isCompleted.current = true;
      setRerender((e) => e + 1);
    } catch (error) {
      console.error("Error deleting session:", error);
      setError("Failed to delete session");
    }
  };

  const setBreak = async () => {
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
      console.log("Not enough break time!");
    }
  };

  const returnToFocus = async () => {
    const session: SessionUpdate = {
      session_state: "focus",
    };
    const updatedWithBreak = await SessionService.updateSession(sessionId.current, session);
    
    if (updatedWithBreak) {
      isBreak.current = false;
    }
    
    setRemainingTimesFromEndTimes(null);
    setRerender((e) => e + 1);
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
    <div className="timer-page timer-container-wrapper">
      {showConfirmation && (
        <SessionConfirmation
          minutesElapsed={pendingValues.current.minutesElapsed}
          minutesRounded={pendingValues.current.minutesRounded}
          onConfirm={confirmSessionEnd}
          onCancel={cancelSessionEnd}
        />
      )}
      
      {isCompleted.current ? (
        <SessionComplete 
          minutesElapsed={totalMinutesElapsedRoundedToFifteen.current}
          level="L1"
          startTime={pendingValues.current.startTime || currFocusStartTime.current}
          endTime={pendingValues.current.endTime || new Date().toUTCString()}
          onReturnHome={onSessionComplete ? 
            () => onSessionComplete(totalMinutesElapsedRoundedToFifteen.current) : 
            undefined}
        />
      ) : (
        <div className="timer-container">
          <div>
            <h1 className="timer-header">
              {isBreak.current ? "" : "L1: "}
              {isBreak.current ? "Break" : "Focus"} Session (
              {isBreak.current 
                ? getMinutesOrHoursIfOverSixty(BREAK_TIME_SECONDS) 
                : getMinutesOrHoursIfOverSixty(FOCUS_TIME_SECONDS)
              })
            </h1>
          </div>

          <div className="timer-display">
            <div className="small-timer">
              {convertSecondsToTimeFormat(
                secondsRemaining.current < 0 
                  ? secondsElapsed.current - (-1 * secondsRemaining.current) 
                  : secondsElapsed.current
              )}
            </div>
          </div>

          <div className="timer-display">
            <div className="large-timer">
              {convertSecondsToTimeFormat(secondsRemaining.current < 0 ? 0 : secondsRemaining.current)}
            </div>
          </div>

          <div className="timer-progress">
            <div className="progress-bar">
              <div
                className="progress-fill"
                style={{ 
                  width: `${(secondsElapsed.current / (secondsElapsed.current + secondsRemaining.current)) * 100}%` 
                }}
              ></div>
            </div>

            <div className="break-text">
              {isBreak.current ? (
                <div>
                  <button className='take-break-btn' onClick={returnToFocus}>
                    Go back to focus
                  </button>
                  <button 
                    className='take-break-btn' 
                    onClick={setBreak} 
                    disabled={breakTimeRemaining.current === 0}
                  >
                    Extend your break ({breakTimeRemaining.current} mins left)
                  </button>
                </div>
              ) : (
                <button 
                  className='take-break-btn' 
                  onClick={setBreak} 
                  disabled={breakTimeRemaining.current === 0}
                >
                  Take a break ({breakTimeRemaining.current} mins total available)
                </button>
              )}
            </div>
          </div>

          <div className="timer-actions">
            <button className="save-button" onClick={promptSessionEnd}>Save session</button>
            <button className="discard-button" onClick={deleteSession}>Discard session</button>
            <button className="test-button" onClick={testFifteenMinutes}>Test 15 min</button>
            <button className="adjust-time-button" onClick={adjustSessionTimeMinus15}>Adjust -15min</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default FocusTimer; 