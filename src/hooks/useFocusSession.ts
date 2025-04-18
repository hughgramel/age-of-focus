import { useState, useEffect, useRef } from 'react';
import { FocusSessionManager, FocusSessionConfig, FocusSessionState } from '@/lib/FocusSessionManager';

export function useFocusSession(config: FocusSessionConfig) {
  // Create state variables for each aspect of the session state
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [isBreak, setIsBreak] = useState<boolean>(false);
  const [remainingFocus, setRemainingFocus] = useState<number>(config.focusDuration);
  const [remainingBreak, setRemainingBreak] = useState<number>(0);
  const [breakBank, setBreakBank] = useState<number>(config.rewardAmount);
  const [breakTimeAwarded, setBreakTimeAwarded] = useState<number>(config.rewardAmount);
  const [breakTimePotential, setBreakTimePotential] = useState<number>(config.rewardAmount);
  const [elapsedFocus, setElapsedFocus] = useState<number>(0);

  // Create a ref for our manager to persist between renders
  const managerRef = useRef<FocusSessionManager | null>(null);

  // Initialize the manager on mount
  useEffect(() => {
    const updatedConfig = {
      ...config,
      onTick: (state: FocusSessionState) => {
        // Update all state variables when the timer ticks
        setIsRunning(state.isRunning);
        setIsBreak(state.isBreak);
        setRemainingFocus(state.remainingFocus);
        setRemainingBreak(state.remainingBreak);
        setBreakBank(state.breakBank);
        setBreakTimeAwarded(state.breakTimeAwarded);
        setBreakTimePotential(state.breakTimePotential);
        setElapsedFocus(state.elapsedFocus);
        
        // Call the original onTick if provided
        if (config.onTick) {
          config.onTick(state);
        }
      }
    };
    
    managerRef.current = new FocusSessionManager(updatedConfig);
    
    // Initial sync with the manager's state
    const initialState = managerRef.current.getState();
    setIsRunning(initialState.isRunning);
    setIsBreak(initialState.isBreak);
    setRemainingFocus(initialState.remainingFocus);
    setRemainingBreak(initialState.remainingBreak);
    setBreakBank(initialState.breakBank);
    setBreakTimeAwarded(initialState.breakTimeAwarded);
    setBreakTimePotential(initialState.breakTimePotential);
    setElapsedFocus(initialState.elapsedFocus);
    
    // Cleanup on unmount
    return () => {
      if (managerRef.current) {
        managerRef.current.pause();
      }
    };
  }, []);  // Empty dependency array means this runs once on mount

  // Helper function to make sure manager exists before calling methods
  const ensureManager = () => {
    if (!managerRef.current) {
      throw new Error('FocusSessionManager not initialized');
    }
    return managerRef.current;
  };

  // Functions to control the timer
  const start = () => ensureManager().start();
  const pause = () => ensureManager().pause();
  const resume = () => ensureManager().resume();
  const reset = () => ensureManager().reset();
  
  // Function to get the current state directly from the manager
  const getState = () => ensureManager().getState();

  // Return everything needed by components
  return {
    // State variables
    isRunning,
    isBreak,
    remainingFocus,
    remainingBreak,
    breakBank,
    breakTimeAwarded,
    breakTimePotential,
    elapsedFocus,
    
    // Control functions
    start,
    pause,
    resume,
    reset,
    getState
  };
} 