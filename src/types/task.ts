import { ActionType } from './action';

export interface Task {
  id: string;
  userId: string;
  title: string;
  description?: string;
  completed: boolean;
  createdAt: Date;
  updatedAt: Date;
  dueDate?: Date;
  actionType: ActionType;
  actionCompleted: boolean;
}

export interface TaskCreate {
  title: string;
  description?: string;
  dueDate?: Date;
  actionType: ActionType;
}

export interface TaskUpdate {
  title?: string;
  description?: string;
  completed?: boolean;
  dueDate?: Date;
  actionType?: ActionType;
  actionCompleted?: boolean;
} 