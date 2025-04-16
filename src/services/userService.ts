import { 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc,
  serverTimestamp 
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { 
  User, 
  UserPreferences, 
  createNewUserDocument 
} from '@/types/user';

export class UserService {
  private static COLLECTION = 'users';

  static async createUser(
    uid: string,
    email: string,
    displayName: string | null = null,
    photoURL: string | null = null
  ): Promise<void> {
    const userDoc = doc(db, this.COLLECTION, uid);
    const newUser = createNewUserDocument(uid, email, displayName, photoURL);
    await setDoc(userDoc, {
      ...newUser,
      createdAt: serverTimestamp(),
      lastLoginAt: serverTimestamp(),
      lastUpdatedAt: serverTimestamp(),
    });
  }

  static async getUser(uid: string): Promise<User | null> {
    const userDoc = doc(db, this.COLLECTION, uid);
    const userSnap = await getDoc(userDoc);
    
    if (!userSnap.exists()) {
      return null;
    }
    
    return userSnap.data() as User;
  }

  static async updateUserPreferences(
    uid: string,
    preferences: Partial<UserPreferences>
  ): Promise<void> {
    const userDoc = doc(db, this.COLLECTION, uid);
    await updateDoc(userDoc, {
      preferences: preferences,
      lastUpdatedAt: serverTimestamp(),
    });
  }

  static async updateLastLogin(uid: string): Promise<void> {
    const userDoc = doc(db, this.COLLECTION, uid);
    await updateDoc(userDoc, {
      lastLoginAt: serverTimestamp(),
    });
  }

  static async updateAccountType(
    uid: string,
    accountType: User['accountType'],
    subscriptionStatus: User['subscriptionStatus'],
    subscriptionEndDate: Date | null
  ): Promise<void> {
    const userDoc = doc(db, this.COLLECTION, uid);
    await updateDoc(userDoc, {
      accountType,
      subscriptionStatus,
      subscriptionEndDate,
      lastUpdatedAt: serverTimestamp(),
    });
  }
} 