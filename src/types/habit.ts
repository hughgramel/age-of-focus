import { Timestamp } from 'firebase/firestore';

// Represents a single habit defined by the user
export interface Habit {
  id: string;
  userId: string;
  title: string;
  actionType: string; // Corresponds to an ID in FOCUS_ACTIONS
  createdAt: Date;
  updatedAt: Date;
}

// Input type for creating a new habit
export interface HabitCreate {
  title: string;
  actionType: string;
}

// Input type for updating an existing habit
export interface HabitUpdate {
  title?: string;
  actionType?: string;
}

// Represents a record of a habit being completed on a specific day
export interface HabitCompletion {
  id: string;
  habitId: string;
  userId: string;
  completionDate: Date; // The date the habit was marked complete
  resourcesGained: Record<string, number>;
  createdAt: Date;
}

// Firestore representation of HabitCompletion (uses Timestamp)
export interface HabitCompletionFirestore {
  habitId: string;
  userId: string;
  completionDate: Timestamp;
  resourcesGained: Record<string, number>;
  createdAt: Timestamp;
} 