import { 
  collection, 
  addDoc, 
  query, 
  where, 
  getDocs, 
  doc, 
  updateDoc, 
  serverTimestamp, 
  orderBy, 
  limit,
  QueryConstraint // Import QueryConstraint for typing
} from 'firebase/firestore';
import { db } from '@/lib/firebase'; // Assuming your Firebase config is here
import { Tag, TagCreate, TagUpdate } from '@/types/tag';

const tagsCollection = collection(db, 'tags');

const DEFAULT_TAG_COLOR = '#d1d5db'; // Default gray color (Tailwind gray-400)

export const TagService = {
  /**
   * Creates a new tag for a user.
   */
  async createTag(userId: string, tagData: Omit<TagCreate, 'color'> & { color?: string }): Promise<Tag> {
    const newTagData = {
      userId,
      name: tagData.name.trim(),
      color: tagData.color || DEFAULT_TAG_COLOR,
      isDeleted: false,
      createdAt: serverTimestamp(),
    };
    const docRef = await addDoc(tagsCollection, newTagData);
    // Assume serverTimestamp resolves correctly or handle potential null
    return { 
        id: docRef.id, 
        userId: userId,
        name: newTagData.name,
        color: newTagData.color,
        isDeleted: newTagData.isDeleted,
        // We don't get the resolved timestamp back immediately, return a Date object
        createdAt: new Date() 
    } as Tag; 
  },

  /**
   * Gets all tags for a user, optionally including soft-deleted ones.
   */
  async getUserTags(userId: string, includeDeleted: boolean = false): Promise<Tag[]> {
    // Type the constraints array for clarity
    const constraints: QueryConstraint[] = [where('userId', '==', userId)];
    if (!includeDeleted) {
      constraints.push(where('isDeleted', '==', false));
    }
    
    // Add orderBy constraint *after* where constraints
    constraints.push(orderBy('createdAt', 'desc')); 
    
    const q = query(tagsCollection, ...constraints);
    const snapshot = await getDocs(q);
    
    return snapshot.docs.map(docSnapshot => {
      const data = docSnapshot.data();
      // Handle potential Firestore Timestamp object for createdAt
      const createdAt = data.createdAt?.toDate ? data.createdAt.toDate() : (data.createdAt || new Date());
      return {
        id: docSnapshot.id,
        userId: data.userId,
        name: data.name,
        color: data.color,
        isDeleted: data.isDeleted,
        createdAt: createdAt
      } as Tag;
    });
  },

  /**
   * Updates the color of a specific tag.
   */
  async updateTagColor(tagId: string, newColor: string): Promise<void> {
    if (!tagId) throw new Error("tagId cannot be empty");
    const tagRef = doc(db, 'tags', tagId);
    // Explicitly pass the update object
    await updateDoc(tagRef, { color: newColor }); 
  },
  
  /**
   * Updates specific fields of a tag (name, color).
   */
  async updateTagDetails(tagId: string, updates: { name?: string; color?: string }): Promise<void> {
      if (!tagId) throw new Error("tagId cannot be empty");
      const tagRef = doc(db, 'tags', tagId);
      // Create an update object with only the fields present in updates
      const updateData: Partial<TagUpdate> = {};
      if (updates.name !== undefined) updateData.name = updates.name.trim();
      if (updates.color !== undefined) updateData.color = updates.color;
      
      if (Object.keys(updateData).length > 0) {
          await updateDoc(tagRef, updateData);
      }
  },

  /**
   * Soft deletes a tag by setting isDeleted to true.
   */
  async softDeleteTag(tagId: string): Promise<void> {
    if (!tagId) throw new Error("tagId cannot be empty");
    const tagRef = doc(db, 'tags', tagId);
    // Explicitly pass the update object
    await updateDoc(tagRef, { isDeleted: true }); 
  },
}; 