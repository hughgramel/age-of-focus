import { Timestamp } from 'firebase/firestore';

export interface Task {
  id: string;
  userId: string;
  title: string;
  description?: string;
  completed: boolean;
  createdAt: Timestamp | Date;
  actionType: string;
  actionCompleted?: boolean;
  tagId?: string | null;
}

export interface TaskCreate {
  title: string;
  description?: string;
  actionType: string;
  tagId?: string | null;
}

export interface TaskUpdate {
  title?: string;
  description?: string;
  completed?: boolean;
  actionType?: string;
  actionCompleted?: boolean;
  tagId?: string | null;
} 