export type AccountType = 'free' | 'premium' | 'enterprise';

export type FocusSessionDuration = 25 | 30 | 45 | 60;

export interface UserPreferences {
  // Focus session preferences
  defaultSessionDuration: FocusSessionDuration;
  enableSoundEffects: boolean;
  enableNotifications: boolean;
  
  // Game preferences
  autoSaveEnabled: boolean;
  darkMode: boolean;
  showTutorialTips: boolean;
}

export interface UserStats {
  totalFocusSessions: number;
  totalFocusMinutes: number;
  longestStreak: number;
  currentStreak: number;
  lastSessionDate: Date | null;
}

export interface UserProfile {
  displayName: string | null;
  photoURL: string | null;
  timezone: string;
  country: string | null;
}

export interface User {
  // Firebase Auth fields
  uid: string;
  email: string;
  emailVerified: boolean;
  
  // Custom fields
  accountType: AccountType;
  profile: UserProfile;
  preferences: UserPreferences;
  stats: UserStats;
  
  // Subscription info
  subscriptionStatus: 'active' | 'canceled' | 'expired' | null;
  subscriptionEndDate: Date | null;
  
  // Metadata
  createdAt: Date;
  lastLoginAt: Date;
  lastUpdatedAt: Date;
}

// Default values for new users
export const DEFAULT_USER_PREFERENCES: UserPreferences = {
  defaultSessionDuration: 25,
  enableSoundEffects: true,
  enableNotifications: true,
  autoSaveEnabled: true,
  darkMode: true,
  showTutorialTips: true,
};

export const DEFAULT_USER_STATS: UserStats = {
  totalFocusSessions: 0,
  totalFocusMinutes: 0,
  longestStreak: 0,
  currentStreak: 0,
  lastSessionDate: null,
};

// Helper function to create a new user document
export function createNewUserDocument(
  uid: string,
  email: string,
  displayName: string | null = null,
  photoURL: string | null = null
): Omit<User, 'emailVerified'> {
  const now = new Date();
  
  return {
    uid,
    email,
    accountType: 'free',
    profile: {
      displayName,
      photoURL,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      country: null,
    },
    preferences: DEFAULT_USER_PREFERENCES,
    stats: DEFAULT_USER_STATS,
    subscriptionStatus: null,
    subscriptionEndDate: null,
    createdAt: now,
    lastLoginAt: now,
    lastUpdatedAt: now,
  };
} 