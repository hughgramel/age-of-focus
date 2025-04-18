export interface FocusSession {
  id?: string;
  userId: string;
  timestamp: Date;
  duration: number; // planned duration in minutes
  elapsedFocus: number; // actual time spent focusing in minutes
  breakTimeAwarded: number; // minutes of break time awarded
  breakBank: number; // remaining break time in bank
  wasCompleted: boolean; // whether the session was completed fully
  actionPointsAwarded: number; // number of action points awarded for this session
}

export interface ActiveSession {
  userId: string;
  state: {
    isRunning: boolean;
    isBreak: boolean;
    remainingFocus: number;
    remainingBreak: number;
    breakBank: number;
    breakTimeAwarded: number;
    breakTimePotential: number;
    elapsedFocus: number;
    startTimestamp: number;
    lastUpdated: Date;
  };
  config: {
    focusDuration: number;
    rewardInterval: number;
    rewardAmount: number;
  };
}

export const DEFAULT_SESSION_CONFIG = {
  focusDuration: 25, // Default 25 minute focus sessions
  rewardInterval: 5, // Earn rewards every 5 minutes
  rewardAmount: 5 // Get 5 minutes of break time
}; 