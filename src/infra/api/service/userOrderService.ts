/**
 * User Order Service for User Management
 * Handles fetching order data and preferences for specific users
 */

import { 
  collection, 
  query, 
  getDocs, 
  doc, 
  getDoc,
  where,
  orderBy,
  limit as firestoreLimit 
} from 'firebase/firestore';
import { firestore } from '../../config/firebase';

export interface OrderItem {
  id: string;
  name: string;
  type: string;
  imageUrlSquare?: string;
  prices: Array<{
    size: string;
    price: string;
    currency: string;
    quantity: number;
  }>;
  description?: string;
  special_ingredient?: string;
}

export interface UserOrder {
  id: string;
  orderId: string;
  userId: string;
  items: OrderItem[];
  totalAmount: number;
  status: string;
  orderDate: Date;
  createdAt: Date;
  customerInfo: {
    name: string;
    email: string;
    phone?: string;
  };
  deliveryAddress: string;
  paymentMethod: string;
  paymentId: string;
}

export interface UserPreferenceData {
  id: string;
  userId: string;
  favorites: string[];
  orderHistory: string[];
  recentSearches: Array<{ userId: string }>;
  createdAt?: Date;
  updatedAt?: Date;
}

export class UserOrderService {
  private ordersCollection = 'orders';
  private userPreferencesCollection = 'userPreferences';

  /**
   * Fetch user orders from user subcollection
   */
  async getUserOrders(userId: string, limitCount = 50): Promise<UserOrder[]> {
    try {
      // Try to fetch from user subcollection first
      const userOrdersRef = collection(firestore, 'users', userId, 'orders');
      
      let userOrdersSnapshot;
      try {
        const userOrdersQuery = query(
          userOrdersRef, 
          orderBy('createdAt', 'desc'),
          firestoreLimit(limitCount)
        );
        userOrdersSnapshot = await getDocs(userOrdersQuery);
      } catch (error) {
        // If ordering fails, try without ordering
        console.log('Ordering failed, fetching without order:', error);
        const userOrdersQuery = query(userOrdersRef, firestoreLimit(limitCount));
        userOrdersSnapshot = await getDocs(userOrdersQuery);
      }
      
      if (!userOrdersSnapshot.empty) {
        let orders = userOrdersSnapshot.docs.map(doc => this.mapFirestoreDocToOrder(doc));
        // Sort in memory if we couldn't sort in Firestore
        orders.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
        return orders;
      }

      // If no orders in subcollection, try to fetch from main orders collection
      const ordersRef = collection(firestore, this.ordersCollection);
      
      let ordersSnapshot;
      try {
        // Try simple query first - just by userId without ordering to avoid index requirement
        const ordersQuery = query(
          ordersRef,
          where('userId', '==', userId),
          firestoreLimit(limitCount)
        );
        ordersSnapshot = await getDocs(ordersQuery);
      } catch (error) {
        console.log('Main orders query failed:', error);
        return []; // Return empty array if both methods fail
      }

      let orders = ordersSnapshot.docs.map(doc => this.mapFirestoreDocToOrder(doc));
      // Sort in memory
      orders.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
      return orders.slice(0, limitCount);

    } catch (error) {
      console.error('Error fetching user orders:', error);
      return [];
    }
  }

  /**
   * Fetch user preferences
   */
  async getUserPreferences(userId: string): Promise<UserPreferenceData | null> {
    try {
      // First try to find by userId field
      const preferencesRef = collection(firestore, this.userPreferencesCollection);
      const preferencesQuery = query(
        preferencesRef,
        where('userId', '==', userId),
        firestoreLimit(1)
      );

      const preferencesSnapshot = await getDocs(preferencesQuery);
      
      if (!preferencesSnapshot.empty) {
        const doc = preferencesSnapshot.docs[0];
        return this.mapFirestoreDocToPreferences(doc);
      }

      // If not found, try by document ID
      const preferencesDocRef = doc(firestore, this.userPreferencesCollection, userId);
      const preferencesDoc = await getDoc(preferencesDocRef);
      
      if (preferencesDoc.exists()) {
        return this.mapFirestoreDocToPreferences(preferencesDoc);
      }

      return null;
    } catch (error) {
      console.error('Error fetching user preferences:', error);
      return null;
    }
  }

  /**
   * Calculate user statistics from orders
   */
  async calculateUserStats(userId: string): Promise<{
    totalOrders: number;
    totalSpent: number;
    averageOrderValue: number;
    lastOrderDate?: Date;
  }> {
    try {
      const orders = await this.getUserOrders(userId, 1000); // Get all orders for calculation
      
      const totalOrders = orders.length;
      const totalSpent = orders.reduce((sum, order) => sum + (order.totalAmount || 0), 0);
      const averageOrderValue = totalOrders > 0 ? totalSpent / totalOrders : 0;
      const lastOrderDate = orders.length > 0 ? orders[0].orderDate : undefined;

      return {
        totalOrders,
        totalSpent,
        averageOrderValue,
        lastOrderDate
      };
    } catch (error) {
      console.error('Error calculating user stats:', error);
      return {
        totalOrders: 0,
        totalSpent: 0,
        averageOrderValue: 0
      };
    }
  }

  /**
   * Get favorite products for a user
   */
  async getUserFavorites(userId: string): Promise<string[]> {
    try {
      const preferences = await this.getUserPreferences(userId);
      return preferences?.favorites || [];
    } catch (error) {
      console.error('Error fetching user favorites:', error);
      return [];
    }
  }

  /**
   * Map Firestore document to Order
   */
  private mapFirestoreDocToOrder(doc: any): UserOrder {
    const data = doc.data();
    
    return {
      id: doc.id,
      orderId: data.orderId || doc.id,
      userId: data.userId || '',
      items: data.items || [],
      totalAmount: data.totalAmount || 0,
      status: data.status || 'unknown',
      orderDate: data.orderDate ? 
        (data.orderDate.toDate ? data.orderDate.toDate() : new Date(data.orderDate._seconds * 1000))
        : new Date(),
      createdAt: data.createdAt ?
        (data.createdAt.toDate ? data.createdAt.toDate() : new Date(data.createdAt._seconds * 1000))
        : new Date(),
      customerInfo: data.customerInfo || {
        name: '',
        email: '',
        phone: ''
      },
      deliveryAddress: data.deliveryAddress || '',
      paymentMethod: data.paymentMethod || '',
      paymentId: data.paymentId || ''
    };
  }

  /**
   * Map Firestore document to UserPreferences
   */
  private mapFirestoreDocToPreferences(doc: any): UserPreferenceData {
    const data = doc.data();
    
    return {
      id: doc.id,
      userId: data.userId || doc.id,
      favorites: data.favorites || [],
      orderHistory: data.orderHistory || [],
      recentSearches: data.recentSearches || [],
      createdAt: data.createdAt ?
        (data.createdAt.toDate ? data.createdAt.toDate() : new Date(data.createdAt._seconds * 1000))
        : undefined,
      updatedAt: data.updatedAt ?
        (data.updatedAt.toDate ? data.updatedAt.toDate() : new Date(data.updatedAt._seconds * 1000))
        : undefined
    };
  }
}

export default UserOrderService;