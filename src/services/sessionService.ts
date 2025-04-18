import {
    collection, getDocs, setDoc, addDoc, updateDoc, getDoc, doc, deleteDoc, where, query, orderBy, limit,
    getCountFromServer, DocumentData, QuerySnapshot, QueryDocumentSnapshot, serverTimestamp
} from "firebase/firestore";
import { db } from '@/lib/firebase';
import { Session, SessionInsert, SessionState, SessionUpdate } from '@/types/session';

// Sessions collection reference
const sessionsCollectionRef = collection(db, "sessions");

/**
 * Parse a Firestore QuerySnapshot into an array of Session objects
 * 
 * @param snapshot Firestore QuerySnapshot
 * @returns Array of parsed Session objects
 */
const parseSessionSnapshot = (snapshot: QuerySnapshot<DocumentData, DocumentData>): Session[] => {
    return snapshot.docs.map((doc: QueryDocumentSnapshot<DocumentData, DocumentData>) => {
        const data = doc.data();
        return {
            id: doc.id,
            user_id: data.user_id,
            break_end_time: data.break_end_time ?? null,
            break_minutes_remaining: data.break_minutes_remaining,
            break_start_time: data.break_start_time ?? null,
            focus_end_time: data.focus_end_time ?? null,
            focus_start_time: data.focus_start_time ?? null,
            planned_minutes: data.planned_minutes,
            session_state: data.session_state ?? null,
            total_minutes_done: data.total_minutes_done ?? null,
            createdAt: data.createdAt,
        } as Session;
    });
};

export class SessionService {
    /**
     * Retrieves active sessions for a specific user.
     * Only one active session per user is allowed.
     *
     * @param userId - The ID of the user to get active sessions for
     * @returns Promise<Session[]> - Array containing the active session (if any)
     * @throws Error if database query fails
     */
    static async getActiveUserSessions(userId: string): Promise<Session[]> {
        try {
            const sessionsQuery = query(
                sessionsCollectionRef,
                where('user_id', '==', userId),
                where('session_state', 'in', ['focus', 'break'])
            );

            const data = await getDocs(sessionsQuery);
            return parseSessionSnapshot(data);
        } catch (error) {
            console.error('Error fetching active sessions:', error);
            throw error;
        }
    }

    /**
     * Retrieves completed sessions for a specific user.
     *
     * @param userId - The ID of the user to get sessions for
     * @returns Promise<Session[]> - Array containing completed sessions
     * @throws Error if database query fails
     */
    static async getCompleteUserSessions(userId: string): Promise<Session[]> {
        try {
            const sessionsQuery = query(
                sessionsCollectionRef,
                where('user_id', '==', userId),
                where('session_state', '==', 'complete')
            );

            const data = await getDocs(sessionsQuery);
            return parseSessionSnapshot(data);
        } catch (error) {
            console.error('Error fetching completed sessions:', error);
            throw error;
        }
    }

    /**
     * Retrieves all sessions for a specific user.
     *
     * @param userId - The ID of the user to get sessions for
     * @returns Promise<Session[]> - Array containing all user sessions
     * @throws Error if database query fails
     */
    static async getAllUserSessions(userId: string): Promise<Session[]> {
        try {
            const sessionsQuery = query(
                sessionsCollectionRef,
                where('user_id', '==', userId)
            );

            const data = await getDocs(sessionsQuery);
            return parseSessionSnapshot(data);
        } catch (error) {
            console.error('Error fetching all sessions:', error);
            throw error;
        }
    }

    /**
     * Creates a new session in the database.
     *
     * @param sessionData - Object containing the session data to be created
     * @returns Promise<Session> - The newly created session
     * @throws Error if database insert fails
     */
    static async createSession(sessionData: SessionInsert): Promise<Session> {
        try {
            const newDocRef = doc(collection(db, "sessions"));

            // Build the new session object with defaults for missing fields
            const newSession: Session = {
                id: newDocRef.id,
                user_id: sessionData.user_id!,
                break_end_time: sessionData.break_end_time ?? null,
                break_minutes_remaining: sessionData.break_minutes_remaining ?? 0,
                break_start_time: sessionData.break_start_time ?? null,
                focus_end_time: sessionData.focus_end_time ?? null,
                focus_start_time: sessionData.focus_start_time ?? null,
                planned_minutes: sessionData.planned_minutes ?? 0,
                session_state: sessionData.session_state ?? null,
                total_minutes_done: sessionData.total_minutes_done ?? null,
                createdAt: sessionData.createdAt ?? serverTimestamp(),
            };

            // Save the new session to Firestore
            await setDoc(newDocRef, newSession);

            return newSession;
        } catch (error) {
            console.error('Error creating session:', error);
            throw error;
        }
    }

    /**
     * Updates an existing session with new data.
     *
     * @param sessionId - ID of the session to update
     * @param sessionData - Object containing the fields to update
     * @returns Promise<Session> - The updated session
     * @throws Error if database update fails
     */
    static async updateSession(sessionId: string, sessionData: SessionUpdate): Promise<Session> {
        try {
            const sessionDoc = doc(db, "sessions", sessionId);

            // Convert SessionUpdate to a plain object to avoid type issues with updateDoc
            const updateData: Record<string, any> = {};
            
            if (sessionData.break_end_time !== undefined) updateData.break_end_time = sessionData.break_end_time;
            if (sessionData.break_minutes_remaining !== undefined) updateData.break_minutes_remaining = sessionData.break_minutes_remaining;
            if (sessionData.break_start_time !== undefined) updateData.break_start_time = sessionData.break_start_time;
            if (sessionData.focus_end_time !== undefined) updateData.focus_end_time = sessionData.focus_end_time;
            if (sessionData.focus_start_time !== undefined) updateData.focus_start_time = sessionData.focus_start_time;
            if (sessionData.planned_minutes !== undefined) updateData.planned_minutes = sessionData.planned_minutes;
            if (sessionData.session_state !== undefined) updateData.session_state = sessionData.session_state;
            if (sessionData.total_minutes_done !== undefined) updateData.total_minutes_done = sessionData.total_minutes_done;
            if (sessionData.user_id !== undefined) updateData.user_id = sessionData.user_id;

            // Update the document
            await updateDoc(sessionDoc, updateData);

            // Fetch the updated document
            const updatedDoc = await getDoc(sessionDoc);

            if (!updatedDoc.exists()) {
                throw new Error('Updated session not found');
            }

            const data = updatedDoc.data() as DocumentData;

            const updatedSession: Session = {
                id: updatedDoc.id,
                user_id: data.user_id,
                break_end_time: data.break_end_time ?? null,
                break_minutes_remaining: data.break_minutes_remaining,
                break_start_time: data.break_start_time ?? null,
                focus_end_time: data.focus_end_time ?? null,
                focus_start_time: data.focus_start_time ?? null,
                planned_minutes: data.planned_minutes,
                session_state: data.session_state ?? null,
                total_minutes_done: data.total_minutes_done ?? null,
                createdAt: data.createdAt,
            };

            return updatedSession;
        } catch (error) {
            console.error("Error updating session:", error);
            throw error;
        }
    }

    /**
     * Deletes a session from the database.
     *
     * @param sessionId - ID of the session to delete
     * @returns Promise<void>
     * @throws Error if database delete operation fails
     */
    static async deleteSession(sessionId: string): Promise<void> {
        try {
            const sessionDoc = doc(db, "sessions", sessionId);
            await deleteDoc(sessionDoc);
        } catch (error) {
            console.error('Error deleting session:', error);
            throw error;
        }
    }

    /**
     * Retrieves recent completed sessions for a specific user.
     *
     * @param userId - The ID of the user to get sessions for
     * @param limitNum - Maximum number of sessions to retrieve (default: 3)
     * @returns Promise<Session[]> - Array containing recent completed sessions
     * @throws Error if database query fails
     */
    static async getRecentUserSessions(userId: string, limitNum: number = 3): Promise<Session[]> {
        try {
            const sessionsQuery = query(
                sessionsCollectionRef,
                where('user_id', '==', userId),
                where('session_state', '==', 'complete'),
                orderBy('createdAt'),
                limit(limitNum)
            );

            const data = await getDocs(sessionsQuery);
            return parseSessionSnapshot(data);
        } catch (error) {
            console.error('Error fetching recent sessions:', error);
            throw error;
        }
    }

    /**
     * Calculates the total number of completed sessions for a user.
     *
     * @param userId - The ID of the user
     * @returns Promise<number> - Total number of completed sessions
     * @throws Error if database query fails
     */
    static async getTotalSessionsCount(userId: string): Promise<number> {
        try {
            const sessionsQuery = query(
                sessionsCollectionRef,
                where("user_id", "==", userId),
                where("session_state", "==", "complete")
            );

            // Get the count of matching documents
            const snapshot = await getCountFromServer(sessionsQuery);
            return snapshot.data().count || 0;
        } catch (error) {
            console.error("Error getting total sessions count:", error);
            throw error;
        }
    }

    /**
     * Calculates the total hours a user has spent in focus sessions.
     *
     * @param userId - The ID of the user
     * @returns Promise<number> - Total hours (as a decimal)
     * @throws Error if database query fails
     */
    static async getTotalHours(userId: string): Promise<number> {
        try {
            const sessionsQuery = query(
                sessionsCollectionRef,
                where('user_id', '==', userId),
                where('session_state', '==', 'complete')
            );

            const data = await getDocs(sessionsQuery);

            // Sum up total_minutes_done
            const totalMinutes = data.docs.reduce((sum, doc) => {
                const sessionData = doc.data();
                return sum + (sessionData.total_minutes_done || 0);
            }, 0);

            return totalMinutes / 60; // Return total hours
        } catch (error) {
            console.error('Error calculating total hours:', error);
            throw error;
        }
    }

    /**
     * Counts sessions by level (L0, L1, L2, L3) for a specific user.
     * Level is determined by planned_minutes duration.
     *
     * @param userId - The ID of the user
     * @returns Promise<{L0: number, L1: number, L2: number, L3: number}> - Count of sessions by level
     * @throws Error if database query fails
     */
    static async getSessionsByLevel(userId: string): Promise<{L0: number, L1: number, L2: number, L3: number}> {
        try {
            const sessionsQuery = query(
                sessionsCollectionRef,
                where("user_id", "==", userId),
                where("session_state", "==", "complete")
            );

            const querySnapshot = await getDocs(sessionsQuery);

            // Initialize counters
            const result = {
                L0: 0,
                L1: 0,
                L2: 0,
                L3: 0
            };

            // Categorize sessions by planned duration
            querySnapshot.forEach(doc => {
                const sessionData = doc.data();
                const minutes = sessionData.planned_minutes || 0;

                if (minutes < 60) result.L0++;
                else if (minutes <= 120) result.L1++;
                else if (minutes <= 180) result.L2++;
                else result.L3++;
            });

            return result;
        } catch (error) {
            console.error("Error getting sessions by level:", error);
            throw error;
        }
    }
} 