import { 
  doc, 
  collection,
  getDoc, 
  getDocs,
  setDoc, 
  query,
  where,
  orderBy,
  limit as firestoreLimit,
  deleteDoc,
  serverTimestamp,
  Timestamp
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { FocusSession, ActiveSession } from '@/types/focusSession';

export class FocusSessionService {
  private static SESSIONS_COLLECTION = 'focusSessions';
  private static ACTIVE_SESSION_COLLECTION = 'activeSession';

  // Save a completed focus session
  static async saveSession(session: Omit<FocusSession, 'id'>): Promise<string> {
    const sessionsCollection = collection(db, 'users', session.userId, this.SESSIONS_COLLECTION);
    const sessionDoc = doc(sessionsCollection);
    
    // Convert any Date objects to Firestore Timestamps
    const firestoreSession = {
      ...session,
      timestamp: Timestamp.fromDate(session.timestamp)
    };
    
    await setDoc(sessionDoc, firestoreSession);
    return sessionDoc.id;
  }

  // Get a specific session by ID
  static async getSession(userId: string, sessionId: string): Promise<FocusSession | null> {
    const sessionDoc = doc(db, 'users', userId, this.SESSIONS_COLLECTION, sessionId);
    const docSnap = await getDoc(sessionDoc);
    
    if (!docSnap.exists()) {
      return null;
    }
    
    const data = docSnap.data();
    return {
      id: docSnap.id,
      ...data,
      timestamp: data.timestamp.toDate()
    } as FocusSession;
  }

  // Get all sessions for a user
  static async getUserSessions(userId: string, limitCount: number = 20): Promise<FocusSession[]> {
    const sessionsCollection = collection(db, 'users', userId, this.SESSIONS_COLLECTION);
    const q = query(
      sessionsCollection,
      orderBy('timestamp', 'desc'),
      firestoreLimit(limitCount)
    );
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        timestamp: data.timestamp.toDate()
      } as FocusSession;
    });
  }

  // Get today's sessions for a user
  static async getTodaySessions(userId: string): Promise<FocusSession[]> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const sessionsCollection = collection(db, 'users', userId, this.SESSIONS_COLLECTION);
    const q = query(
      sessionsCollection,
      where('timestamp', '>=', Timestamp.fromDate(today)),
      orderBy('timestamp', 'desc')
    );
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        timestamp: data.timestamp.toDate()
      } as FocusSession;
    });
  }

  // Delete a session
  static async deleteSession(userId: string, sessionId: string): Promise<void> {
    const sessionDoc = doc(db, 'users', userId, this.SESSIONS_COLLECTION, sessionId);
    await deleteDoc(sessionDoc);
  }

  // Save active session state (for resuming sessions)
  static async saveActiveSession(userId: string, activeSession: Omit<ActiveSession, 'userId'>): Promise<void> {
    const sessionDoc = doc(db, 'users', userId, this.ACTIVE_SESSION_COLLECTION, 'current');
    
    // Convert Date objects to Firestore Timestamps
    const firestoreSession = {
      userId,
      ...activeSession,
      state: {
        ...activeSession.state,
        lastUpdated: serverTimestamp()
      }
    };
    
    await setDoc(sessionDoc, firestoreSession);
  }

  // Get active session (if any)
  static async getActiveSession(userId: string): Promise<ActiveSession | null> {
    const sessionDoc = doc(db, 'users', userId, this.ACTIVE_SESSION_COLLECTION, 'current');
    const docSnap = await getDoc(sessionDoc);
    
    if (!docSnap.exists()) {
      return null;
    }
    
    const data = docSnap.data();
    
    // Convert Firestore Timestamps back to Date objects
    const lastUpdated = data.state?.lastUpdated;
    
    return {
      ...data,
      state: {
        ...data.state,
        lastUpdated: lastUpdated && typeof lastUpdated === 'object' && 'toDate' in lastUpdated && typeof lastUpdated.toDate === 'function'
          ? lastUpdated.toDate()
          : new Date()
      }
    } as ActiveSession;
  }

  // Clear active session
  static async clearActiveSession(userId: string): Promise<void> {
    const sessionDoc = doc(db, 'users', userId, this.ACTIVE_SESSION_COLLECTION, 'current');
    await deleteDoc(sessionDoc);
  }

  // Get session statistics
  static async getSessionStats(userId: string): Promise<{
    totalSessions: number;
    totalMinutes: number;
    completedSessions: number;
    avgSessionLength: number;
  }> {
    const sessionsCollection = collection(db, 'users', userId, this.SESSIONS_COLLECTION);
    const querySnapshot = await getDocs(sessionsCollection);
    
    let totalMinutes = 0;
    let completedSessions = 0;
    
    querySnapshot.forEach(doc => {
      const session = doc.data() as FocusSession;
      totalMinutes += session.elapsedFocus;
      if (session.wasCompleted) {
        completedSessions++;
      }
    });
    
    const totalSessions = querySnapshot.size;
    const avgSessionLength = totalSessions > 0 ? totalMinutes / totalSessions : 0;
    
    return {
      totalSessions,
      totalMinutes,
      completedSessions,
      avgSessionLength
    };
  }
} 