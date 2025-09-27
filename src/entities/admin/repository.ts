import { 
  collection, 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc,
  query,
  where,
  getDocs
} from 'firebase/firestore';
import { firestore } from '../../infra/config/firebase';
import { AdminUser, LoginCredentials } from './types';

export class AdminRepository {
  private collectionName = 'admins';

  /**
   * Get admin by email
   */
  async getAdminByEmail(email: string): Promise<AdminUser | null> {
    try {
      const q = query(
        collection(firestore, this.collectionName),
        where('email', '==', email)
      );

      const querySnapshot = await getDocs(q);
      
      if (querySnapshot.empty) return null;

      const doc = querySnapshot.docs[0];
      const data = doc.data();
      
      return {
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date(),
        lastLogin: data.lastLogin?.toDate()
      } as AdminUser;
    } catch (error) {
      console.error('Error fetching admin by email:', error);
      throw new Error('Failed to fetch admin');
    }
  }

  /**
   * Get admin by ID
   */
  async getAdminById(id: string): Promise<AdminUser | null> {
    try {
      const docRef = doc(firestore, this.collectionName, id);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const data = docSnap.data();
        return {
          id: docSnap.id,
          ...data,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date(),
          lastLogin: data.lastLogin?.toDate()
        } as AdminUser;
      }

      return null;
    } catch (error) {
      console.error('Error fetching admin by ID:', error);
      throw new Error('Failed to fetch admin');
    }
  }

  /**
   * Create admin user
   */
  async createAdmin(adminData: Omit<AdminUser, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    try {
      const now = new Date();
      const admin = {
        ...adminData,
        createdAt: now,
        updatedAt: now,
      };

      const docRef = doc(collection(firestore, this.collectionName));
      await setDoc(docRef, admin);
      return docRef.id;
    } catch (error) {
      console.error('Error creating admin:', error);
      throw new Error('Failed to create admin');
    }
  }

  /**
   * Update admin user
   */
  async updateAdmin(id: string, adminData: Partial<AdminUser>): Promise<void> {
    try {
      const docRef = doc(firestore, this.collectionName, id);
      await updateDoc(docRef, {
        ...adminData,
        updatedAt: new Date(),
      });
    } catch (error) {
      console.error('Error updating admin:', error);
      throw new Error('Failed to update admin');
    }
  }

  /**
   * Update last login
   */
  async updateLastLogin(id: string): Promise<void> {
    try {
      const docRef = doc(firestore, this.collectionName, id);
      await updateDoc(docRef, {
        lastLogin: new Date(),
        updatedAt: new Date(),
      });
    } catch (error) {
      console.error('Error updating last login:', error);
      throw new Error('Failed to update last login');
    }
  }
}

export const adminRepository = new AdminRepository();