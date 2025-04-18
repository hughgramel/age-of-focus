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
 * 
 * 2. During focus session:
 *    - Updates break time in database when break time is earned (every 25 minutes of focus)
 *      via SessionService.updateSession()
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
  onReturnHome?: () => void;
}

const SessionComplete = ({ minutesElapsed, level, onReturnHome }: SessionCompleteProps) => {
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

  const handleReturnHome = () => {
    if (onReturnHome) {
      onReturnHome();
    } else {
      router.push('/dashboard');
    }
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
          </div>
          
          <div className="completion-message">
            <p>You've completed a focus session!</p>
          </div>
          
          <div className="return-home-container">
            <button className="return-home-button" onClick={handleReturnHome}>
              Return to Home
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
  
  // Refs to track timer state
  const secondsRemaining = useRef(0);
  const secondsElapsed = useRef(0);
  const sessionCreationInProgressRef = useRef(false);
  const isInitializedRef = useRef(false);
  const sessionId = useRef("");
  const isBreak = useRef(false);
  const breakTimeRemaining = useRef(5);
  const currFocusEndTime = useRef("");
  const currBreakEndTime = useRef("");
  const currFocusStartTime = useRef("");
  const currBreakStartTime = useRef("");
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const isCompleted = useRef(false);
  const totalMinutesElapsedRoundedToFifteen = useRef(0);
  const lastBreakTimeGranted = useRef(0);

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

  const calculateBreakTimeToGrant = (elapsedMinutes: number, lastGrantedMinutes: number): number => {
    const lastGrantedSegments = Math.floor(lastGrantedMinutes / 25);
    const currentSegments = Math.floor(elapsedMinutes / 25);
    const newSegments = currentSegments - lastGrantedSegments;
    return Math.max(0, newSegments) * 5;
  };

  const updateBreakTimeInDatabase = async (session: Session, breakMinutes: number) => {
    try {
      await SessionService.updateSession(session.id, {
        break_minutes_remaining: breakMinutes
      });
    } catch (err) {
      console.error("Error updating break time in database:", err);
    }
  };

  // Function to calculate and update the remaining and elapsed times based on current end times
  function calculateRemainingTimes(dummy: null = null): void {
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

      const newSession: SessionInsert = {
        break_end_time: null,
        break_minutes_remaining: 5,
        total_minutes_done: 0,
        break_start_time: null,
        focus_start_time: currTime.toUTCString(),
        focus_end_time: ending_time,
        createdAt: serverTimestamp(),
        session_state: "focus",
        user_id: userId,
        planned_minutes: convertSecondsToMinutes(FOCUS_TIME_SECONDS)
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
        
        const elapsedMinutes = Math.floor(secondsElapsed.current / 60);
        const additionalBreakMinutes = calculateBreakTimeToGrant(elapsedMinutes, lastBreakTimeGranted.current);
        
        if (additionalBreakMinutes > 0) {
          breakTimeRemaining.current += additionalBreakMinutes;
          lastBreakTimeGranted.current = elapsedMinutes;
          
          updateBreakTimeInDatabase(session, breakTimeRemaining.current);
        }
      }
    }
  };

  const checkTime = () => {
    if (secondsRemaining.current <= 0) {
      const overflowSeconds = -1 * secondsRemaining.current;
      secondsElapsed.current = secondsElapsed.current - overflowSeconds;
      if (isBreak.current) {
        returnToFocus();
      } else {
        handleSessionEnd();
      }
    } else if (!isBreak.current) {
      const elapsedMinutes = Math.floor(secondsElapsed.current / 60);
      const additionalBreakMinutes = calculateBreakTimeToGrant(elapsedMinutes, lastBreakTimeGranted.current);
      
      if (additionalBreakMinutes > 0) {
        breakTimeRemaining.current += additionalBreakMinutes;
        lastBreakTimeGranted.current = elapsedMinutes;
        
        if (sessionId.current) {
          SessionService.updateSession(sessionId.current, {
            break_minutes_remaining: breakTimeRemaining.current
          });
        }
      }
    }
  };

  const handleSessionEnd = () => {
    isBreak.current = false;
    setRemainingTimesFromEndTimes(null);

    const totalFocusMinutes = Math.floor(secondsElapsed.current / 60);
    const totalFocusMinutesRoundedToNearestFifteenMinutes = Math.floor(totalFocusMinutes / 15) * 15;
    
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
    totalMinutesElapsedRoundedToFifteen.current = totalFocusMinutesRoundedToNearestFifteenMinutes;
    
    isCompleted.current = true;

    if (intervalRef.current) clearInterval(intervalRef.current);
    
    // Call the optional callback if provided
    if (onSessionComplete) {
      onSessionComplete(totalFocusMinutesRoundedToNearestFifteenMinutes);
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
          } else {
            throw new Error("Session was not initialized");
          }
        } else {
          sessionId.current = existingSessions[0].id;
          isBreak.current = existingSessions[0].session_state === "break";
          
          if (existingSessions[0].focus_end_time && existingSessions[0].focus_start_time) {
            currFocusEndTime.current = existingSessions[0].focus_end_time;
            currFocusStartTime.current = existingSessions[0].focus_start_time;
          } else {
            throw new Error("end time is null");
          }
          
          breakTimeRemaining.current = existingSessions[0].break_minutes_remaining;
          lastBreakTimeGranted.current = Math.floor(breakTimeRemaining.current / 5) * 25;
          
          if (existingSessions[0].break_end_time && existingSessions[0].break_start_time) {
            currBreakEndTime.current = existingSessions[0].break_end_time;
            currBreakStartTime.current = existingSessions[0].break_start_time;
          } else {
            currBreakEndTime.current = "";
          }

          setRemainingTimesFromEndTimes(null);
          if (secondsRemaining.current <= 0) {
            const overflowSeconds = -1 * secondsRemaining.current;
            secondsElapsed.current = secondsElapsed.current - overflowSeconds;
            if (isBreak.current) {
              returnToFocus();
            } else {
              handleSessionEnd();
            }
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
    <div className="timer-page">
      {isCompleted.current ? (
        <SessionComplete 
          minutesElapsed={totalMinutesElapsedRoundedToFifteen.current}
          level="L1"
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
                  Take a break ({breakTimeRemaining.current} mins left)
                </button>
              )}
            </div>
          </div>

          <div className="timer-actions">
            <button className="save-button" onClick={handleSessionEnd}>Save session</button>
            <button className="discard-button" onClick={deleteSession}>Discard session</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default FocusTimer; 