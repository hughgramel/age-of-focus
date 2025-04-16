'use client';
import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode
} from 'react';
import {
  User as FirebaseUser,
  UserCredential,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  GoogleAuthProvider,
  onAuthStateChanged,
  updateProfile as updateFirebaseProfile,
  updateEmail as updateFirebaseEmail,
  updatePassword as updateFirebasePassword,
  deleteUser,
  reauthenticateWithCredential,
  EmailAuthProvider,
} from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc, deleteDoc, Timestamp } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import { AuthService } from '@/services/authService';
import { UserService } from '@/services/userService';

interface UserProfile {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  createdAt: Date;
  lastLogin: Date;
}

interface AuthContextType {
  user: UserProfile | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<UserCredential>;
  signUp: (email: string, password: string, displayName: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (displayName: string, photoURL: string | null) => Promise<void>;
  updateEmail: (newEmail: string, password: string) => Promise<void>;
  updatePassword: (currentPassword: string, newPassword: string) => Promise<void>;
  deleteAccount: (password: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  // Convert Firebase user to UserProfile
  const createUserProfile = (firebaseUser: FirebaseUser, additionalData?: { createdAt?: Date }): UserProfile => {
    return {
      uid: firebaseUser.uid,
      email: firebaseUser.email,
      displayName: firebaseUser.displayName,
      photoURL: firebaseUser.photoURL,
      createdAt: additionalData?.createdAt || new Date(),
      lastLogin: new Date(),
    };
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
        if (userDoc.exists()) {
          const userData = userDoc.data();
          setUser({
            uid: firebaseUser.uid,
            email: firebaseUser.email,
            displayName: firebaseUser.displayName,
            photoURL: firebaseUser.photoURL,
            createdAt: userData.createdAt.toDate(),
            lastLogin: userData.lastLogin.toDate(),
          });
        } else {
          // If somehow the user exists in Firebase Auth but not in Firestore,
          // create the document
          const newUser = createUserProfile(firebaseUser);
          await setDoc(doc(db, 'users', firebaseUser.uid), {
            email: newUser.email,
            displayName: newUser.displayName,
            photoURL: newUser.photoURL,
            createdAt: Timestamp.fromDate(newUser.createdAt),
            lastLogin: Timestamp.fromDate(newUser.lastLogin),
          });
          setUser(newUser);
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const updateUserDocument = async (
    uid: string,
    data: Partial<Omit<UserProfile, 'uid'>>
  ) => {
    const userRef = doc(db, 'users', uid);
    const updateData: Record<string, any> = {};
    
    if (data.email) updateData.email = data.email;
    if (data.displayName) updateData.displayName = data.displayName;
    if (data.photoURL) updateData.photoURL = data.photoURL;
    if (data.lastLogin) updateData.lastLogin = Timestamp.fromDate(data.lastLogin);
    
    await updateDoc(userRef, updateData);
  };

  const signIn = async (email: string, password: string) => {
    const credential = await signInWithEmailAndPassword(auth, email, password);
    await updateUserDocument(credential.user.uid, { lastLogin: new Date() });
    return credential;
  };

  const signUp = async (email: string, password: string, displayName: string) => {
    const credential = await createUserWithEmailAndPassword(auth, email, password);
    await updateFirebaseProfile(credential.user, { displayName });
    
    const newUser = createUserProfile(credential.user, { createdAt: new Date() });
    await setDoc(doc(db, 'users', credential.user.uid), {
      email: newUser.email,
      displayName: newUser.displayName,
      photoURL: newUser.photoURL,
      createdAt: Timestamp.fromDate(newUser.createdAt),
      lastLogin: Timestamp.fromDate(newUser.lastLogin),
    });
  };

  const signInWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    const credential = await signInWithPopup(auth, provider);
    
    const userDoc = await getDoc(doc(db, 'users', credential.user.uid));
    if (!userDoc.exists()) {
      const newUser = createUserProfile(credential.user, { createdAt: new Date() });
      await setDoc(doc(db, 'users', credential.user.uid), {
        email: newUser.email,
        displayName: newUser.displayName,
        photoURL: newUser.photoURL,
        createdAt: Timestamp.fromDate(newUser.createdAt),
        lastLogin: Timestamp.fromDate(newUser.lastLogin),
      });
    } else {
      await updateUserDocument(credential.user.uid, { lastLogin: new Date() });
    }
  };

  const updateProfile = async (displayName: string, photoURL: string | null) => {
    if (!auth.currentUser) throw new Error('No user logged in');
    await updateFirebaseProfile(auth.currentUser, { displayName, photoURL });
    await updateUserDocument(auth.currentUser.uid, { displayName, photoURL });
    if (user) {
      setUser({ ...user, displayName, photoURL });
    }
  };

  const updateEmail = async (newEmail: string, password: string) => {
    if (!auth.currentUser || !user) throw new Error('No user logged in');
    const credential = EmailAuthProvider.credential(auth.currentUser.email!, password);
    await reauthenticateWithCredential(auth.currentUser, credential);
    await updateFirebaseEmail(auth.currentUser, newEmail);
    await updateUserDocument(auth.currentUser.uid, { email: newEmail });
    setUser({ ...user, email: newEmail });
  };

  const updatePassword = async (currentPassword: string, newPassword: string) => {
    if (!auth.currentUser || !user) throw new Error('No user logged in');
    const credential = EmailAuthProvider.credential(auth.currentUser.email!, currentPassword);
    await reauthenticateWithCredential(auth.currentUser, credential);
    await updateFirebasePassword(auth.currentUser, newPassword);
  };

  const deleteAccount = async (password: string) => {
    if (!auth.currentUser || !user) throw new Error('No user logged in');
    const credential = EmailAuthProvider.credential(auth.currentUser.email!, password);
    await reauthenticateWithCredential(auth.currentUser, credential);
    await deleteDoc(doc(db, 'users', auth.currentUser.uid));
    await deleteUser(auth.currentUser);
  };

  const logout = () => signOut(auth);

  const value = {
    user,
    loading,
    signIn,
    signUp,
    signInWithGoogle,
    logout,
    updateProfile,
    updateEmail,
    updatePassword,
    deleteAccount,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
} 