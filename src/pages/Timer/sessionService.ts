import {db} from '../../services/firebase/firebase-config'
import {
    collection, getDocs, setDoc, addDoc, updateDoc, getDoc, doc, deleteDoc, where, query, FieldValue, orderBy, limit,
    getCountFromServer, DocumentData, QuerySnapshot, QueryDocumentSnapshot, serverTimestamp
} from "firebase/firestore";

const userCollectionRef = collection(db, "sessions")



export type SessionState = "focus" | "break" | "complete" | "complete_and_reviewed"

export type Session = {
    break_end_time: string | null
    break_minutes_remaining: number
    break_start_time: string | null
    focus_end_time: string | null
    focus_start_time: string | null
    id: string
    planned_minutes: number
    session_state: SessionState | null
    total_minutes_done: number | null
    user_id: string
    createdAt: FieldValue
}

export type SessionInsert = {
    break_end_time?: string | null
    break_minutes_remaining?: number
    break_start_time?: string | null
    focus_end_time?: string | null
    focus_start_time?: string | null
    id?: string
    planned_minutes?: number
    session_state?: SessionState | null
    total_minutes_done?: number | null
    user_id?: string
    createdAt?: FieldValue
}

export type SessionUpdate = {
    break_end_time?: string | null
    break_minutes_remaining?: number
    break_start_time?: string | null
    focus_end_time?: string | null
    focus_start_time?: string | null
    id?: number
    planned_minutes?: number
    session_state?: SessionState | null
    total_minutes_done?: number | null
    user_id?: string
}


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
}



export const sessionsService = {
    /**
     * Retrieves active sessions for a specific user.
     * Only one active session per user is allowed.
     *
     * @param userId - The ID of the user to get active sessions for
     * @returns Promise<Session[]> - Array containing the active session (if any)
     * @throws Error if multiple active sessions are found or if database query fails
     *
     * @example
     * try {
     *   const activeSessions = await sessionsService.getActiveUserSessions(1);
     *   if (activeSessions.length > 0) {
     *     console.log('Active session found:', activeSessions[0]);
     *   }
     * } catch (error) {
     *   console.error('Error fetching active sessions:', error);
     * }
     */
    getActiveUserSessions: async (userId: string) => {
        try {
            const newQuery =
                query(userCollectionRef,
                where('user_id', '==', userId),
                where('session_state', 'in', ['focus', 'break']))

            const data = await getDocs(newQuery)
            return parseSessionSnapshot(data)
        } catch (error) {
            console.error('Error fetching sessions:', error);
            throw error;
        }
    },


    getCompleteUserSessions: async (userId: string) => {
        try {
            const newQuery =
                query(userCollectionRef,
                    where('user_id', '==', userId),
                    where('session_state', '==', 'complete'))

            const data = await getDocs(newQuery)
            return parseSessionSnapshot(data)
        } catch (error) {
            console.error('Error fetching sessions:', error);
            throw error;
        }
    },

    getAllUserSessions: async (userId: string) => {
        try {
            const newQuery =
                query(userCollectionRef,
                    where('user_id', '==', userId))

            const data = await getDocs(newQuery)
            return parseSessionSnapshot(data)
        } catch (error) {
            console.error('Error fetching sessions:', error);
            throw error;
        }
    },

    /**
     * Creates a new session in the database.
     * Includes protection against duplicate session creation.
     *
     * @param sessionData - Object containing the session data to be created
     * @returns Promise<Session[]> - Array containing the newly created session
     * @throws Error if database insert fails, or if user already has an active session
     *
     * @example
     * try {
     *   const newSessionData = {
     *     user_id: 1,
     *     session_start: new Date().toISOString(),
     *     session_state: 'focus',
     *     planned_duration_minutes: 60,
     *     available_break_time_minutes: 5
     *   };
     *   const createdSession = await sessionsService.createSession(newSessionData);
     *   console.log('New session created:', createdSession[0]);
     * } catch (error) {
     *   console.error('Failed to create session:', error);
     * }
     */
    createSession: async (sessionData: SessionInsert) => {

        try {

            const newDocRef = doc(collection(db, "sessions"));

            // Build the new session object.
            // Note: For required fields, we provide defaults if missing.
            const newSession: Session = {
                id: newDocRef.id, // Use the generated document ID
                user_id: sessionData.user_id!, // Make sure this is provided; otherwise, add proper validation
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
    },

    /**
     * Updates an existing session with new data.
     *
     * @param sessionId - ID of the session to update
     * @param sessionData - Object containing the fields to update
     * @returns Promise<void>
     * @throws Error if database update fails
     *
     * @example
     * try {
     *   // Update session state to break mode
     *   await sessionsService.updateSession(123, {
     *     session_state: 'break',
     *     current_break_session_start: new Date().toISOString(),
     *     current_break_session_planned_duration: 5
     *   });
     *   console.log('Session updated successfully');
     * } catch (error) {
     *   console.error('Failed to update session:', error);
     * }
     */
    updateSession: async (sessionId: string, sessionData: SessionUpdate) => {
        // Working
        try {
            const userDoc = doc(db, "sessions", sessionId);

            // Update the document
            await updateDoc(userDoc, sessionData);

            // Fetch the updated document
            const updatedDoc = await getDoc(userDoc);

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
            // Return updated object
        } catch (error) {
            console.error("Error updating session:", error);
            throw error;
        }
    },

    /**
     * Deletes a session from the database.
     * Should only be used when discarding an unwanted session.
     *
     * @param sessionId - ID of the session to delete
     * @returns Promise<void>
     * @throws Error if database delete operation fails
     *
     * @example
     * try {
     *   await sessionsService.deleteSession(123);
     *   console.log('Session deleted successfully');
     * } catch (error) {
     *   console.error('Failed to delete session:', error);
     * }
     */
    deleteSession: async (sessionId: string) => {
        try {
            const userDoc = doc(db, "sessions", sessionId)
            await deleteDoc(userDoc)

        } catch (error) {
            console.error('Error deleting session:', error);
            throw error;
        }
    },



    /**
     * Retrieves recent completed sessions for a specific user.
     *
     * @param userId - The ID of the user to get sessions for
     * @param limit - Maximum number of sessions to retrieve (default: 3)
     * @returns Promise<Session[]> - Array containing recent completed sessions
     * @throws Error if database query fails
     *
     * @example
     * try {
     *   const recentSessions = await sessionsService.getRecentUserSessions(1, 3);
     *   console.log('Recent sessions:', recentSessions);
     * } catch (error) {
     *   console.error('Error fetching recent sessions:', error);
     * }
     */
    getRecentUserSessions: async (userId: string, limitNum: number = 3) => {
        try {
            const newQuery =
                query(userCollectionRef,
                    where('user_id', '==', userId),
                    where('session_state', '==', 'complete'),
                    orderBy('createdAt'),
                    limit(limitNum)
                )

            const data = await getDocs(newQuery)
            return parseSessionSnapshot(data)
        } catch (error) {
            console.error('Error fetching sessions:', error);
            throw error;
        }
        },




    /**
     * Calculates the total number of completed sessions for a user.
     *
     * @param userId - The ID of the user
     * @returns Promise<number> - Total number of completed sessions
     * @throws Error if database query fails
     */
    getTotalSessionsCount: async (userId: string): Promise<number> => {
        try {
            const sessionsRef = collection(db, "sessions");

            // Construct query to filter completed sessions for the user
            const sessionsQuery = query(
                sessionsRef,
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
    },

    /**
     * Calculates the total hours a user has spent in focus sessions.
     * Uses total_minutes_done to calculate the total hours.
     *
     * @param userId - The ID of the user
     * @returns Promise<number> - Total hours (as a decimal)
     * @throws Error if database query fails
     */
    getTotalHours: async (userId: string): Promise<number> => {
        try {
            const newQuery = query(
                userCollectionRef,
                where('user_id', '==', userId),
                where('session_state', '==', 'complete')
            );

            const data = await getDocs(newQuery);

            // Sum up total_minutes_done
            const totalMinutes = data.docs.reduce((sum, doc) => {
                const sessionData = doc.data();
                return sum + (sessionData.total_minutes_done || 0);
            }, 0);

            return totalMinutes / 60; // Return total hours
        } catch (error) {
            console.error('Error fetching sessions:', error);
            throw error;
        }
    },

    /**
     * Counts sessions by level (L0, L1, L2, L3) for a specific user.
     * Level is determined by planned_minutes duration:
     * - L0: < 60 minutes
     * - L1: 60-120 minutes
     * - L2: 121-180 minutes
     * - L3: > 180 minutes
     *
     * @param userId - The ID of the user
     * @returns Promise<{L0: number, L1: number, L2: number, L3: number}> - Count of sessions by level
     * @throws Error if database query fails
     */
    getSessionsByLevel: async (userId: string): Promise<{L0: number, L1: number, L2: number, L3: number}> => {
        try {
            const sessionsRef = collection(db, "sessions");

            // Query for completed sessions of the user
            const sessionsQuery = query(
                sessionsRef,
                where("user_id", "==", userId),
                where("session_state", "==", "complete")
            );

            // Fetch the matching documents
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
    },
};