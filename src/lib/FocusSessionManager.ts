export interface FocusSessionConfig {
  focusDuration: number; // in minutes
  rewardInterval: number; // in minutes
  rewardAmount: number; // in minutes
  onTick?: (state: FocusSessionState) => void;
  onSessionEnd?: (state: FocusSessionState) => void;
}

export interface FocusSessionState {
  isRunning: boolean;
  isBreak: boolean;
  remainingFocus: number; // in minutes
  remainingBreak: number; // in minutes
  breakBank: number; // in minutes
  breakTimeAwarded: number; // in minutes
  breakTimePotential: number; // in minutes
  elapsedFocus: number; // in minutes
  startTimestamp: number; // timestamp in ms
}

export class FocusSessionManager {
  private config: FocusSessionConfig;
  private isRunning: boolean;
  private isBreak: boolean;
  private remainingFocus: number;
  private remainingBreak: number;
  private breakBank: number;
  private breakTimeAwarded: number;
  private breakTimePotential: number;
  private elapsedFocus: number;
  private startTimestamp: number;
  private intervalId: number | null;

  constructor(config: FocusSessionConfig) {
    this.config = config;
    this.isRunning = false;
    this.isBreak = false;
    this.remainingFocus = config.focusDuration;
    this.remainingBreak = 0;
    this.breakBank = config.rewardAmount;
    this.breakTimeAwarded = config.rewardAmount;
    this.breakTimePotential = config.rewardAmount;
    this.elapsedFocus = 0;
    this.startTimestamp = Date.now();
    this.intervalId = null;
  }

  start(): void {
    if (this.isBreak) {
      this.startBreakTimer();
    } else {
      this.startFocusTimer();
    }
  }

  private startFocusTimer(): void {
    this.isBreak = false;
    this.isRunning = true;
    this.startTimestamp = Date.now();
    
    // Clear any existing interval
    if (this.intervalId !== null) {
      window.clearInterval(this.intervalId);
    }
    
    // Start a new interval
    this.intervalId = window.setInterval(() => this.tick(), 1000);
    
    // Call onTick immediately to update UI
    if (this.config.onTick) {
      this.config.onTick(this.getState());
    }
  }

  private startBreakTimer(): void {
    this.isBreak = true;
    this.isRunning = true;
    this.startTimestamp = Date.now();
    
    // Determine break duration
    if (this.breakBank >= this.config.rewardAmount) {
      this.remainingBreak = this.config.rewardAmount;
      this.breakBank -= this.config.rewardAmount;
    } else {
      this.remainingBreak = this.breakBank;
      this.breakBank = 0;
    }
    
    // Clear any existing interval
    if (this.intervalId !== null) {
      window.clearInterval(this.intervalId);
    }
    
    // Start a new interval
    this.intervalId = window.setInterval(() => this.tick(), 1000);
    
    // Call onTick immediately to update UI
    if (this.config.onTick) {
      this.config.onTick(this.getState());
    }
  }

  private tick(): void {
    const now = Date.now();
    // Convert from ms to minutes
    const delta = (now - this.startTimestamp) / (1000 * 60);
    this.startTimestamp = now;

    if (this.isBreak) {
      this.remainingBreak -= delta;
      
      if (this.remainingBreak <= 0) {
        if (this.intervalId !== null) {
          window.clearInterval(this.intervalId);
          this.intervalId = null;
        }
        
        if (this.config.onTick) {
          this.config.onTick(this.getState());
        }
        
        this.startFocusTimer();
        return;
      }
    } else {
      this.remainingFocus -= delta;
      this.elapsedFocus += delta;
      
      // Calculate potential break time based on elapsed focus time
      this.breakTimePotential = Math.floor(this.elapsedFocus / this.config.rewardInterval) * this.config.rewardAmount;
      
      // Award any new break time earned
      if (this.breakTimeAwarded < this.breakTimePotential) {
        const diff = this.breakTimePotential - this.breakTimeAwarded;
        this.breakBank += diff;
        this.breakTimeAwarded = this.breakTimePotential;
      }
      
      if (this.remainingFocus <= 0) {
        if (this.intervalId !== null) {
          window.clearInterval(this.intervalId);
          this.intervalId = null;
        }
        
        if (this.config.onSessionEnd) {
          this.config.onSessionEnd(this.getState());
        }
        
        if (this.breakBank > 0) {
          this.startBreakTimer();
        } else {
          // Reset the focus timer
          this.remainingFocus = this.config.focusDuration;
          if (this.config.onTick) {
            this.config.onTick(this.getState());
          }
        }
        
        return;
      }
    }

    // Call the onTick callback with the updated state
    if (this.config.onTick) {
      this.config.onTick(this.getState());
    }
  }

  pause(): void {
    if (this.intervalId !== null) {
      window.clearInterval(this.intervalId);
      this.intervalId = null;
    }
    
    this.isRunning = false;
    
    if (this.config.onTick) {
      this.config.onTick(this.getState());
    }
  }

  resume(): void {
    this.isRunning = true;
    this.startTimestamp = Date.now();
    
    if (this.intervalId !== null) {
      window.clearInterval(this.intervalId);
    }
    
    this.intervalId = window.setInterval(() => this.tick(), 1000);
    
    if (this.config.onTick) {
      this.config.onTick(this.getState());
    }
  }

  reset(): void {
    if (this.intervalId !== null) {
      window.clearInterval(this.intervalId);
      this.intervalId = null;
    }
    
    this.isRunning = false;
    this.isBreak = false;
    this.remainingFocus = this.config.focusDuration;
    this.elapsedFocus = 0;
    
    if (this.config.onTick) {
      this.config.onTick(this.getState());
    }
  }

  getState(): FocusSessionState {
    return {
      isRunning: this.isRunning,
      isBreak: this.isBreak,
      remainingFocus: this.remainingFocus,
      remainingBreak: this.remainingBreak,
      breakBank: this.breakBank,
      breakTimeAwarded: this.breakTimeAwarded,
      breakTimePotential: this.breakTimePotential,
      elapsedFocus: this.elapsedFocus,
      startTimestamp: this.startTimestamp
    };
  }
} 