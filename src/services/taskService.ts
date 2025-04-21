import { collection, addDoc, updateDoc, deleteDoc, doc, getDocs, query, where, orderBy, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Task, TaskCreate, TaskUpdate } from '@/types/task';
import { executeActions, FOCUS_ACTIONS } from '@/data/actions';
import { ActionUpdate } from '@/services/actionService';

export class TaskService {
  private static COLLECTION = 'tasks';

  static async createTask(userId: string, taskData: TaskCreate): Promise<Task> {
    const taskRef = await addDoc(collection(db, this.COLLECTION), {
      ...taskData,
      userId,
      completed: false,
      actionCompleted: false,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    });

    return {
      id: taskRef.id,
      userId,
      ...taskData,
      completed: false,
      actionCompleted: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  }

  static async updateTask(taskId: string, taskData: TaskUpdate): Promise<void> {
    const taskRef = doc(db, this.COLLECTION, taskId);
    await updateDoc(taskRef, {
      ...taskData,
      updatedAt: Timestamp.now(),
    });
  }

  static async deleteTask(taskId: string): Promise<void> {
    const taskRef = doc(db, this.COLLECTION, taskId);
    await deleteDoc(taskRef);
  }

  static async getUserTasks(userId: string): Promise<Task[]> {
    const tasksQuery = query(
      collection(db, this.COLLECTION),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    );

    const snapshot = await getDocs(tasksQuery);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt.toDate(),
      updatedAt: doc.data().updatedAt.toDate(),
      dueDate: doc.data().dueDate?.toDate(),
    })) as Task[];
  }

  static async completeTask(taskId: string, task: Task): Promise<void> {
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
  }
} 