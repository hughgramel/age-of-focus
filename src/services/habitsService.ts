import {
  collection, addDoc, updateDoc, deleteDoc, doc, getDocs, query, where, orderBy, Timestamp, writeBatch, getDoc
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Habit, HabitCreate, HabitUpdate, HabitCompletion, HabitCompletionFirestore } from '@/types/habit';
import { startOfWeek, endOfWeek, eachDayOfInterval, formatISO, parseISO, startOfDay, endOfDay, startOfToday } from 'date-fns'; // Correct date-fns imports

export class HabitsService {
  private static HABITS_COLLECTION = 'habits';
  private static COMPLETIONS_COLLECTION = 'habitCompletions';

  // --- Habit CRUD --- //

  static async createHabit(userId: string, habitData: HabitCreate): Promise<Habit> {
    const habitRef = await addDoc(collection(db, this.HABITS_COLLECTION), {
      ...habitData,
      userId,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    });

    return {
      id: habitRef.id,
      userId,
      ...habitData,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  }

  static async updateHabit(habitId: string, habitData: HabitUpdate): Promise<void> {
    const habitRef = doc(db, this.HABITS_COLLECTION, habitId);
    await updateDoc(habitRef, {
      ...habitData,
      updatedAt: Timestamp.now(),
    });
  }

  static async deleteHabit(habitId: string): Promise<void> {
    // Also delete associated completions
    const batch = writeBatch(db);
    const completionsQuery = query(
      collection(db, this.COMPLETIONS_COLLECTION),
      where('habitId', '==', habitId)
    );
    const completionsSnapshot = await getDocs(completionsQuery);
    completionsSnapshot.docs.forEach(completionDoc => {
      batch.delete(completionDoc.ref);
    });

    // Delete the habit itself
    const habitRef = doc(db, this.HABITS_COLLECTION, habitId);
    batch.delete(habitRef);

    await batch.commit();
  }

  static async getHabits(userId: string): Promise<Habit[]> {
    const habitsQuery = query(
      collection(db, this.HABITS_COLLECTION),
      where('userId', '==', userId),
      orderBy('createdAt', 'asc') // Order by creation time
    );

    const snapshot = await getDocs(habitsQuery);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt.toDate(),
      updatedAt: doc.data().updatedAt.toDate(),
    })) as Habit[];
  }

  // --- Habit Completion --- //

  static async completeHabit(userId: string, habitId: string, completionDate: Date, resourcesGained: Record<string, number>): Promise<HabitCompletion | null> {
    // Check if already completed today
    const start = startOfDay(completionDate); // Use date-fns startOfDay
    const end = endOfDay(completionDate); // Use date-fns endOfDay

    const existingCompletionQuery = query(
      collection(db, this.COMPLETIONS_COLLECTION),
      where('userId', '==', userId),
      where('habitId', '==', habitId),
      where('completionDate', '>=', Timestamp.fromDate(start)),
      where('completionDate', '<=', Timestamp.fromDate(end))
    );

    const existingSnapshot = await getDocs(existingCompletionQuery);
    if (!existingSnapshot.empty) {
      console.log(`Habit ${habitId} already completed on ${formatISO(completionDate)}`);
      return null; // Already completed today
    }

    // Add new completion record including resourcesGained
    const completionData: HabitCompletionFirestore = {
      habitId,
      userId,
      completionDate: Timestamp.fromDate(startOfDay(completionDate)), // Store just the date part
      resourcesGained, // Store the calculated resources
      createdAt: Timestamp.now(),
    };

    const completionRef = await addDoc(collection(db, this.COMPLETIONS_COLLECTION), completionData);

    // Return the full HabitCompletion object
    return {
      id: completionRef.id,
      habitId,
      userId,
      completionDate: startOfDay(completionDate),
      resourcesGained,
      createdAt: new Date(),
    };
  }

  static async getHabitCompletionsForWeek(userId: string, habitId: string, weekStartDate: Date): Promise<Set<string>> {
    const weekEndDate = endOfWeek(weekStartDate, { weekStartsOn: 0 }); // Use endOfWeek
    const startDateTimestamp = Timestamp.fromDate(startOfDay(weekStartDate)); // Use startOfDay
    const endDateTimestamp = Timestamp.fromDate(endOfDay(weekEndDate)); // Use endOfDay

    const completionsQuery = query(
      collection(db, this.COMPLETIONS_COLLECTION),
      where('userId', '==', userId),
      where('habitId', '==', habitId),
      where('completionDate', '>=', startDateTimestamp),
      where('completionDate', '<=', endDateTimestamp)
    );

    const snapshot = await getDocs(completionsQuery);
    const completedDates = new Set<string>();
    snapshot.docs.forEach(doc => {
      const data = doc.data() as HabitCompletionFirestore;
      // Store date as YYYY-MM-DD string for easy comparison
      completedDates.add(formatISO(data.completionDate.toDate(), { representation: 'date' }));
    });
    return completedDates;
  }

  static async getCompletionsForHabitsForWeek(userId: string, habitIds: string[], weekStartDate: Date): Promise<Map<string, Set<string>>> {
    const completionsMap = new Map<string, Set<string>>();
    if (habitIds.length === 0) return completionsMap;

    const weekStartDateCorrected = startOfWeek(weekStartDate, { weekStartsOn: 0 }); // Ensure we start from the actual week start
    const weekEndDate = endOfWeek(weekStartDateCorrected, { weekStartsOn: 0 }); // Use endOfWeek
    const startDateTimestamp = Timestamp.fromDate(startOfDay(weekStartDateCorrected)); // Use startOfDay
    const endDateTimestamp = Timestamp.fromDate(endOfDay(weekEndDate)); // Use endOfDay

    // Firestore 'in' query is limited to 30 elements, chunk if necessary
    const chunkSize = 30;
    for (let i = 0; i < habitIds.length; i += chunkSize) {
      const habitIdChunk = habitIds.slice(i, i + chunkSize);

      const completionsQuery = query(
        collection(db, this.COMPLETIONS_COLLECTION),
        where('userId', '==', userId),
        where('habitId', 'in', habitIdChunk),
        where('completionDate', '>=', startDateTimestamp),
        where('completionDate', '<=', endDateTimestamp)
      );

      const snapshot = await getDocs(completionsQuery);
      snapshot.docs.forEach(doc => {
        const data = doc.data() as HabitCompletionFirestore;
        const dateStr = formatISO(data.completionDate.toDate(), { representation: 'date' });

        if (!completionsMap.has(data.habitId)) {
          completionsMap.set(data.habitId, new Set());
        }
        completionsMap.get(data.habitId)?.add(dateStr);
      });
    }

    // Ensure all requested habitIds have an entry in the map, even if empty
    habitIds.forEach(id => {
        if (!completionsMap.has(id)) {
            completionsMap.set(id, new Set());
        }
    });

    return completionsMap;
  }

  static async uncompleteHabit(userId: string, habitId: string, completionDate: Date): Promise<Record<string, number> | null> {
    const start = startOfDay(completionDate);
    const end = endOfDay(completionDate);

    const completionQuery = query(
      collection(db, this.COMPLETIONS_COLLECTION),
      where('userId', '==', userId),
      where('habitId', '==', habitId),
      where('completionDate', '>=', Timestamp.fromDate(start)),
      where('completionDate', '<=', Timestamp.fromDate(end)),
      // limit(1) // Adding limit for safety, though ideally only one exists
    );

    const snapshot = await getDocs(completionQuery);

    if (snapshot.empty) {
      console.log(`No completion found for habit ${habitId} on ${formatISO(completionDate)} to uncomplete.`);
      return null;
    }

    // Assuming only one completion per day, get the first doc
    const completionDoc = snapshot.docs[0];
    const completionData = completionDoc.data() as HabitCompletionFirestore;
    const resourcesToRemove = completionData.resourcesGained || {}; // Get stored resources

    // Delete the document
    await deleteDoc(completionDoc.ref);

    console.log(`Habit ${habitId} uncompleted for ${formatISO(completionDate)}`);
    return resourcesToRemove; // Return the resources that were stored
  }
} 