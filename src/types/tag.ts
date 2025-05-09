import { Timestamp } from 'firebase/firestore';

export interface Tag {
  id: string;
  userId: string;
  name: string;
  color: string; // Store hex code or Tailwind class name
  isDeleted: boolean;
  createdAt?: Timestamp | Date; // Optional for sorting/tracking
}

export interface TagCreate {
  name: string;
  color: string; 
  // userId will be added by the service
  // isDeleted will be false by default
  // createdAt will be added by the service
}

export interface TagUpdate {
  name?: string;
  color?: string;
  isDeleted?: boolean;
} 