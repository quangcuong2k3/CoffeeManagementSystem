/**
 * UserPreferences Service
 * Handles user preferences data from Firestore
 */

import { 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  query, 
  where, 
  orderBy,
  limit as firestoreLimit,
  addDoc,
  updateDoc,
  deleteDoc,
  Timestamp
} from 'firebase/firestore';
import { firestore } from '../../config/firebase';

export interface UserPreference {
  id: string;
  userId: string;
  favorites: string[];
  orderHistory: string[];
  recentSearches: { userId: string }[];
  createdAt?: Date;
  updatedAt?: Date;
}

export interface OrderDetails {
  id: string;
  status: string;
  total: number;
  items: any[];
  createdAt: Date;
  deliveryAddress?: string;
}

export class UserPreferencesService {
  private userPreferencesCollection = 'userPreferences';
  private ordersCollection = 'orders';
  private productsCollection = 'products';
  private coffeesCollection = 'coffees';

  /**
   * Get user preferences by userId
   */
  async getUserPreferences(userId: string): Promise<UserPreference | null> {
    try {
      const q = query(
        collection(firestore, this.userPreferencesCollection),
        where('userId', '==', userId),
        firestoreLimit(1)
      );
      
      const querySnapshot = await getDocs(q);
      
      if (!querySnapshot.empty) {
        const doc = querySnapshot.docs[0];
        const data = doc.data();
        
        return {
          id: doc.id,
          userId: data.userId || userId,
          favorites: data.favorites || [],
          orderHistory: data.orderHistory || [],
          recentSearches: data.recentSearches || [],
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date()
        };
      }
      
      return null;
    } catch (error) {
      console.error('Error fetching user preferences:', error);
      throw error;
    }
  }

  /**
   * Get user's favorite products with details
   */
  async getUserFavoriteProducts(userId: string): Promise<any[]> {
    try {
      const preferences = await this.getUserPreferences(userId);
      if (!preferences || !preferences.favorites.length) {
        return [];
      }

      const favoriteProducts = [];
      
      // Fetch products from both products and coffees collections
      for (const productId of preferences.favorites) {
        try {
          // Try products collection first
          let productDoc = await getDoc(doc(firestore, this.productsCollection, productId));
          
          if (!productDoc.exists()) {
            // Try coffees collection
            productDoc = await getDoc(doc(firestore, this.coffeesCollection, productId));
          }
          
          if (productDoc.exists()) {
            favoriteProducts.push({
              id: productDoc.id,
              ...productDoc.data(),
              type: productDoc.ref.parent.id === 'products' ? 'product' : 'coffee'
            });
          }
        } catch (err) {
          console.warn(`Failed to fetch product ${productId}:`, err);
        }
      }
      
      return favoriteProducts;
    } catch (error) {
      console.error('Error fetching user favorite products:', error);
      throw error;
    }
  }

  /**
   * Get user's order history with details
   */
  async getUserOrderHistory(userId: string, limit = 10): Promise<OrderDetails[]> {
    try {
      const preferences = await this.getUserPreferences(userId);
      if (!preferences || !preferences.orderHistory.length) {
        return [];
      }

      const orders = [];
      
      // Get latest orders (limit the number)
      const orderIds = preferences.orderHistory.slice(-limit);
      
      for (const orderId of orderIds) {
        try {
          const orderDoc = await getDoc(doc(firestore, this.ordersCollection, orderId));
          
          if (orderDoc.exists()) {
            const data = orderDoc.data();
            orders.push({
              id: orderDoc.id,
              status: data.status || 'unknown',
              total: data.total || 0,
              items: data.items || [],
              createdAt: data.createdAt ? 
                (data.createdAt.toDate ? data.createdAt.toDate() : new Date(data.createdAt._seconds * 1000)) 
                : new Date(),
              deliveryAddress: data.deliveryAddress || ''
            });
          }
        } catch (err) {
          console.warn(`Failed to fetch order ${orderId}:`, err);
        }
      }
      
      // Sort by creation date (newest first)
      return orders.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    } catch (error) {
      console.error('Error fetching user order history:', error);
      throw error;
    }
  }

  /**
   * Update user preferences
   */
  async updateUserPreferences(userId: string, updates: Partial<UserPreference>): Promise<UserPreference> {
    try {
      const existing = await this.getUserPreferences(userId);
      
      if (existing) {
        // Update existing preferences
        const docRef = doc(firestore, this.userPreferencesCollection, existing.id);
        await updateDoc(docRef, {
          ...updates,
          updatedAt: Timestamp.fromDate(new Date())
        });
        
        return { ...existing, ...updates };
      } else {
        // Create new preferences
        const newPreferences = {
          userId,
          favorites: [],
          orderHistory: [],
          recentSearches: [],
          ...updates,
          createdAt: Timestamp.fromDate(new Date()),
          updatedAt: Timestamp.fromDate(new Date())
        };
        
        const docRef = await addDoc(collection(firestore, this.userPreferencesCollection), newPreferences);
        
        return {
          id: docRef.id,
          userId,
          favorites: [],
          orderHistory: [],
          recentSearches: [],
          ...updates,
          createdAt: new Date(),
          updatedAt: new Date()
        };
      }
    } catch (error) {
      console.error('Error updating user preferences:', error);
      throw error;
    }
  }
}