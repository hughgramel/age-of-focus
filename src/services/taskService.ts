import { collection, addDoc, updateDoc, deleteDoc, doc, getDocs, query, where, orderBy, Timestamp, serverTimestamp, limit, QueryConstraint } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Task, TaskCreate, TaskUpdate } from '@/types/task';
import { executeActions, FOCUS_ACTIONS } from '@/data/actions';
import { ActionUpdate } from '@/services/actionService';

const tasksCollection = collection(db, 'tasks');

export const TaskService = {
  /**
   * Creates a new task for a user.
   */
  async createTask(userId: string, taskData: TaskCreate): Promise<Task> {
    const newTaskData = {
      ...taskData,
      userId,
      completed: false,
      createdAt: serverTimestamp(),
      actionCompleted: false,
      // Ensure tagId is included, defaulting to null if undefined
      tagId: taskData.tagId !== undefined ? taskData.tagId : null, 
    };
    const docRef = await addDoc(tasksCollection, newTaskData);
    // Return with ID and local timestamp for immediate use
    return { 
        id: docRef.id, 
        ...newTaskData, 
        createdAt: new Date() // Use local Date for immediate object consistency
    } as Task;
  },

  /**
   * Gets all tasks for a user, optionally filtering by completion status.
   */
  async getUserTasks(userId: string, status: 'all' | 'active' | 'completed' = 'all'): Promise<Task[]> {
    const constraints: QueryConstraint[] = [where('userId', '==', userId)];
    if (status === 'active') {
      constraints.push(where('completed', '==', false));
    } else if (status === 'completed') {
      constraints.push(where('completed', '==', true));
    }
    constraints.push(orderBy('createdAt', 'desc'));
    // Consider adding limit if task list can grow very large, e.g., limit(100)

    const q = query(tasksCollection, ...constraints);
    const snapshot = await getDocs(q);
    
    return snapshot.docs.map(docSnapshot => {
      const data = docSnapshot.data();
      // Handle potential Firestore Timestamp object for createdAt
      const createdAt = data.createdAt?.toDate ? data.createdAt.toDate() : (data.createdAt || new Date());
      return {
        id: docSnapshot.id,
        userId: data.userId,
        title: data.title,
        description: data.description,
        completed: data.completed,
        createdAt: createdAt,
        actionType: data.actionType,
        actionCompleted: data.actionCompleted,
        tagId: data.tagId // Ensure tagId is mapped
      } as Task;
    });
  },

  /**
   * Updates a specific task.
   */
  async updateTask(taskId: string, updates: TaskUpdate): Promise<void> {
    const taskRef = doc(db, 'tasks', taskId);
    // Build the update object explicitly to satisfy TypeScript
    const updateData: { [key: string]: any } = {}; 
    if (updates.title !== undefined) updateData.title = updates.title;
    if (updates.description !== undefined) updateData.description = updates.description;
    if (updates.completed !== undefined) updateData.completed = updates.completed;
    if (updates.actionType !== undefined) updateData.actionType = updates.actionType;
    if (updates.actionCompleted !== undefined) updateData.actionCompleted = updates.actionCompleted;
    if (updates.tagId !== undefined) updateData.tagId = updates.tagId; // Can be string or null

    // Add updatedAt timestamp if needed for tracking
    // updateData.updatedAt = serverTimestamp(); 

    if (Object.keys(updateData).length > 0) {
        await updateDoc(taskRef, updateData);
    }
  },

  /**
   * Updates only the tagId of a specific task.
   */
  async updateTaskTag(taskId: string, tagId: string | null): Promise<void> {
    const taskRef = doc(db, 'tasks', taskId);
    await updateDoc(taskRef, { tagId: tagId }); // Explicitly update tagId
  },

  /**
   * Marks a task as complete.
   */
  async completeTask(taskId: string, task: Task): Promise<void> {
    if (!task.actionCompleted) {
      const action = FOCUS_ACTIONS.find(a => a.id === task.actionType);
      if (action) {
        // Execute the associated action
        await executeActions(
          [action],
          true,
          (actionUpdate: Omit<ActionUpdate, 'target'>) => {
            console.log(`Executing action update:`, actionUpdate);
            return Promise.resolve();
          },
          {
            playerGold: 0,
            playerIndustry: 0,
            playerPopulation: 0,
            playerArmy: 0
          }
        );
      }
    }

    await this.updateTask(taskId, {
      completed: true,
      actionCompleted: true,
    });
  },

  /**
   * Deletes a specific task.
   */
  async deleteTask(taskId: string): Promise<void> {
    const taskRef = doc(db, 'tasks', taskId);
    await deleteDoc(taskRef);
  },
}; 