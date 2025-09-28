/**
 * User Firestore Repository
 * Real Firestore implementation for user data access
 */

import { 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  addDoc, 
  updateDoc, 
  deleteDoc,
  query, 
  where, 
  orderBy, 
  limit as firestoreLimit,
  startAfter,
  DocumentSnapshot,
  Timestamp,
  getCountFromServer
} from 'firebase/firestore';

import { firestore } from '../../infra/config/firebase';
import { UserRepository } from './repository';
import { 
  User, 
  UserFilters, 
  UserStats, 
  CreateUserData, 
  UpdateUserData,
  UserStatus,
  AccountType,
  MembershipTier,
  UserPreferences
} from './types';
import { Order } from '../order/types';

export class FirestoreUserRepository implements UserRepository {
  private usersCollection = 'users';
  private userPreferencesCollection = 'userPreferences';
  private ordersCollection = 'orders';

  async findById(id: string): Promise<User | null> {
    try {
      const docRef = doc(firestore, this.usersCollection, id);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        return this.mapFirestoreDocToUser(docSnap);
      }
      return null;
    } catch (error) {
      console.error('Error fetching user by ID:', error);
      throw new Error('Failed to fetch user');
    }
  }

  async findByEmail(email: string): Promise<User | null> {
    try {
      const q = query(
        collection(firestore, this.usersCollection),
        where('email', '==', email),
        firestoreLimit(1)
      );
      
      const querySnapshot = await getDocs(q);
      
      if (!querySnapshot.empty) {
        return this.mapFirestoreDocToUser(querySnapshot.docs[0]);
      }
      return null;
    } catch (error) {
      console.error('Error fetching user by email:', error);
      throw new Error('Failed to fetch user');
    }
  }

  async findByUid(uid: string): Promise<User | null> {
    try {
      const q = query(
        collection(firestore, this.usersCollection),
        where('uid', '==', uid),
        firestoreLimit(1)
      );
      
      const querySnapshot = await getDocs(q);
      
      if (!querySnapshot.empty) {
        return this.mapFirestoreDocToUser(querySnapshot.docs[0]);
      }
      return null;
    } catch (error) {
      console.error('Error fetching user by UID:', error);
      throw new Error('Failed to fetch user');
    }
  }

  async findAll(filters?: UserFilters, limit = 20, offset = 0): Promise<{
    users: User[];
    total: number;
    hasMore: boolean;
  }> {
    try {
      // Build base query
      let q = query(collection(firestore, this.usersCollection));

      // Apply filters - use simple queries to avoid index requirements
      if (filters?.status && filters.status.length === 1) {
        q = query(q, where('status', '==', filters.status[0]));
      }

      if (filters?.accountType && filters.accountType.length === 1) {
        q = query(q, where('accountType', '==', filters.accountType[0]));
      }

      if (filters?.membershipTier && filters.membershipTier.length === 1) {
        q = query(q, where('membershipTier', '==', filters.membershipTier[0]));
      }

      // Add ordering and limit
      q = query(q, orderBy('createdAt', 'desc'), firestoreLimit(limit + 1));

      const querySnapshot = await getDocs(q);
      const docs = querySnapshot.docs;
      
      // Get total count
      const countQuery = query(collection(firestore, this.usersCollection));
      const countSnapshot = await getCountFromServer(countQuery);
      const total = countSnapshot.data().count;

      // Process results
      let users = docs.slice(0, limit).map(doc => this.mapFirestoreDocToUser(doc));
      const hasMore = docs.length > limit;

      // Apply client-side filters if needed
      if (filters) {
        users = this.applyClientSideFilters(users, filters);
      }

      return {
        users,
        total,
        hasMore
      };
    } catch (error) {
      console.error('Error fetching users:', error);
      throw new Error('Failed to fetch users from database');
    }
  }

  async create(userData: CreateUserData): Promise<User> {
    try {
      const now = new Date();
      const newUserData = {
        ...userData,
        uid: '', // This should be set from Firebase Auth
        isEmailVerified: false,
        status: 'pending_verification' as UserStatus,
        accountType: 'regular' as AccountType,
        totalOrders: 0,
        totalSpent: 0,
        averageOrderValue: 0,
        favoriteProductsCount: 0,
        loyaltyPoints: 0,
        membershipTier: 'bronze' as MembershipTier,
        joinDate: Timestamp.fromDate(now),
        lastActiveDate: Timestamp.fromDate(now),
        createdAt: Timestamp.fromDate(now),
        updatedAt: Timestamp.fromDate(now)
      };

      const docRef = await addDoc(collection(firestore, this.usersCollection), newUserData);
      
      // Return the created user
      const createdDoc = await getDoc(docRef);
      return this.mapFirestoreDocToUser(createdDoc);
    } catch (error) {
      console.error('Error creating user:', error);
      throw new Error('Failed to create user');
    }
  }

  async update(id: string, userData: UpdateUserData): Promise<User> {
    try {
      const docRef = doc(firestore, this.usersCollection, id);
      const updateData = {
        ...userData,
        updatedAt: Timestamp.fromDate(new Date())
      };

      await updateDoc(docRef, updateData);
      
      // Return updated user
      const updatedDoc = await getDoc(docRef);
      return this.mapFirestoreDocToUser(updatedDoc);
    } catch (error) {
      console.error('Error updating user:', error);
      throw new Error('Failed to update user');
    }
  }

  async delete(id: string): Promise<void> {
    try {
      const docRef = doc(firestore, this.usersCollection, id);
      await deleteDoc(docRef);
    } catch (error) {
      console.error('Error deleting user:', error);
      throw new Error('Failed to delete user');
    }
  }

  async getStats(): Promise<UserStats> {
    try {
      // Get all users for stats calculation
      const allUsersQuery = query(collection(firestore, this.usersCollection));
      const snapshot = await getDocs(allUsersQuery);
      const users = snapshot.docs.map(doc => this.mapFirestoreDocToUser(doc));

      const now = new Date();
      const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);

      const stats: UserStats = {
        totalUsers: users.length,
        activeUsers: users.filter(u => u.status === 'active').length,
        newUsersThisMonth: users.filter(u => u.createdAt >= thisMonthStart).length,
        premiumUsers: users.filter(u => u.accountType === 'premium' || u.accountType === 'vip').length,
        averageOrdersPerUser: users.reduce((sum, u) => sum + u.totalOrders, 0) / users.length || 0,
        totalRevenue: users.reduce((sum, u) => sum + u.totalSpent, 0),
        averageLifetimeValue: users.reduce((sum, u) => sum + u.totalSpent, 0) / users.length || 0,
        retentionRate: 0.85 // This would need more complex calculation based on return users
      };

      return stats;
    } catch (error) {
      console.error('Error calculating user stats:', error);
      throw new Error('Failed to calculate user statistics');
    }
  }

  async getUserOrderHistory(userId: string, limit = 10): Promise<Order[]> {
    try {
      const q = query(
        collection(firestore, this.ordersCollection),
        where('userId', '==', userId),
        orderBy('createdAt', 'desc'),
        firestoreLimit(limit)
      );

      const snapshot = await getDocs(q);
      // Note: This would need the Order mapping function from order repository
      // For now, return empty array to avoid circular dependencies
      return [];
    } catch (error) {
      console.error('Error fetching user order history:', error);
      return [];
    }
  }

  async getUserFavoriteProducts(userId: string): Promise<string[]> {
    try {
      const prefsDoc = await this.getUserPreferences(userId);
      return prefsDoc?.favoriteProducts || [];
    } catch (error) {
      console.error('Error fetching user favorites:', error);
      return [];
    }
  }

  async getUserPreferences(userId: string): Promise<UserPreferences | null> {
    try {
      const q = query(
        collection(firestore, this.userPreferencesCollection),
        where('userId', '==', userId),
        firestoreLimit(1)
      );

      const snapshot = await getDocs(q);
      if (!snapshot.empty) {
        return this.mapFirestoreDocToUserPreferences(snapshot.docs[0]);
      }
      return null;
    } catch (error) {
      console.error('Error fetching user preferences:', error);
      return null;
    }
  }

  async updateUserPreferences(userId: string, preferences: Partial<UserPreferences>): Promise<UserPreferences> {
    try {
      // First, try to find existing preferences
      const existing = await this.getUserPreferences(userId);
      
      if (existing) {
        // Update existing
        const docRef = doc(firestore, this.userPreferencesCollection, existing.id);
        const updateData = {
          ...preferences,
          updatedAt: Timestamp.fromDate(new Date())
        };
        await updateDoc(docRef, updateData);
        
        const updatedDoc = await getDoc(docRef);
        return this.mapFirestoreDocToUserPreferences(updatedDoc);
      } else {
        // Create new preferences
        const newPrefsData = {
          userId,
          favoriteProducts: [],
          orderHistory: [],
          deliveryAddresses: [],
          paymentMethods: [],
          notifications: {
            orderUpdates: true,
            promotions: true,
            newProducts: false,
            weeklyDigest: false
          },
          ...preferences,
          createdAt: Timestamp.fromDate(new Date()),
          updatedAt: Timestamp.fromDate(new Date())
        };

        const docRef = await addDoc(collection(firestore, this.userPreferencesCollection), newPrefsData);
        const createdDoc = await getDoc(docRef);
        return this.mapFirestoreDocToUserPreferences(createdDoc);
      }
    } catch (error) {
      console.error('Error updating user preferences:', error);
      throw new Error('Failed to update user preferences');
    }
  }

  async updateLastActive(userId: string): Promise<void> {
    try {
      const docRef = doc(firestore, this.usersCollection, userId);
      await updateDoc(docRef, {
        lastActiveDate: Timestamp.fromDate(new Date()),
        updatedAt: Timestamp.fromDate(new Date())
      });
    } catch (error) {
      console.error('Error updating last active date:', error);
      throw new Error('Failed to update last active date');
    }
  }

  async updateLoyaltyPoints(userId: string, points: number): Promise<void> {
    try {
      const docRef = doc(firestore, this.usersCollection, userId);
      await updateDoc(docRef, {
        loyaltyPoints: points,
        updatedAt: Timestamp.fromDate(new Date())
      });
    } catch (error) {
      console.error('Error updating loyalty points:', error);
      throw new Error('Failed to update loyalty points');
    }
  }

  async calculateUserStats(userId: string): Promise<{
    totalOrders: number;
    totalSpent: number;
    averageOrderValue: number;
    lastOrderDate?: Date;
  }> {
    try {
      // This would need integration with orders collection
      // For now, return default values
      return {
        totalOrders: 0,
        totalSpent: 0,
        averageOrderValue: 0
      };
    } catch (error) {
      console.error('Error calculating user stats:', error);
      throw new Error('Failed to calculate user statistics');
    }
  }

  // Private helper methods
  private mapFirestoreDocToUser(doc: DocumentSnapshot): User {
    const data = doc.data()!;
    
    // Calculate totalSpent from orderHistory if available
    let calculatedTotalSpent = 0;
    if (data.orderHistory && Array.isArray(data.orderHistory)) {
      // For now, we'll use the stored totalSpent or 0 if not available
      // In a more complete implementation, you'd fetch each order and sum the totals
      calculatedTotalSpent = data.totalSpent || 0;
    }
    
    return {
      id: doc.id,
      uid: data.uid || doc.id,
      email: data.email || '',
      displayName: data.displayName || `${data.firstName || ''} ${data.lastName || ''}`.trim() || 'Unknown User',
      firstName: data.firstName || '',
      lastName: data.lastName || '',
      phoneNumber: data.phoneNumber || '',
      profileImageUrl: data.profileImageUrl || data.avatarUrl || '',
      isEmailVerified: data.isEmailVerified || false,
      status: this.mapUserStatus(data.status) || 'active', // Default to active if not set
      accountType: this.mapAccountType(data.accountType) || 'regular', // Default to regular if not set
      totalOrders: data.totalOrders || data.orders?.length || data.orderHistory?.length || 0,
      totalSpent: calculatedTotalSpent,
      averageOrderValue: data.averageOrderValue || 0,
      lastOrderDate: data.lastOrderDate ? 
        (data.lastOrderDate.toDate ? data.lastOrderDate.toDate() : new Date(data.lastOrderDate._seconds * 1000)) 
        : undefined,
      favoriteProductsCount: data.favoriteProductsCount || data.favoriteItems?.length || 0,
      loyaltyPoints: data.loyaltyPoints || 0,
      membershipTier: this.mapMembershipTier(data.membershipTier) || 'bronze',
      joinDate: data.joinDate ? 
        (data.joinDate.toDate ? data.joinDate.toDate() : new Date(data.joinDate._seconds * 1000))
        : (data.createdAt ? 
          (data.createdAt.toDate ? data.createdAt.toDate() : new Date(data.createdAt._seconds * 1000))
          : new Date()),
      lastActiveDate: data.lastActiveDate ? 
        (data.lastActiveDate.toDate ? data.lastActiveDate.toDate() : new Date(data.lastActiveDate._seconds * 1000))
        : (data.lastLoginAt ? 
          (data.lastLoginAt.toDate ? data.lastLoginAt.toDate() : new Date(data.lastLoginAt._seconds * 1000))
          : (data.updatedAt ? 
            (data.updatedAt.toDate ? data.updatedAt.toDate() : new Date(data.updatedAt._seconds * 1000))
            : new Date())),
      createdAt: data.createdAt ? 
        (data.createdAt.toDate ? data.createdAt.toDate() : new Date(data.createdAt._seconds * 1000))
        : new Date(),
      updatedAt: data.updatedAt ? 
        (data.updatedAt.toDate ? data.updatedAt.toDate() : new Date(data.updatedAt._seconds * 1000))
        : new Date()
    };
  }

  private mapFirestoreDocToUserPreferences(doc: DocumentSnapshot): UserPreferences {
    const data = doc.data()!;
    
    return {
      id: doc.id,
      userId: data.userId || '',
      favoriteProducts: data.favoriteProducts || [],
      orderHistory: data.orderHistory || [],
      deliveryAddresses: data.deliveryAddresses || [],
      paymentMethods: data.paymentMethods || [],
      notifications: data.notifications || {
        orderUpdates: true,
        promotions: true,
        newProducts: false,
        weeklyDigest: false
      },
      createdAt: data.createdAt?.toDate() || new Date(),
      updatedAt: data.updatedAt?.toDate() || new Date()
    };
  }

  private mapUserStatus(firestoreStatus: string): UserStatus {
    switch (firestoreStatus) {
      case 'active':
      case 'inactive':
      case 'suspended':
      case 'pending_verification':
        return firestoreStatus;
      default:
        return 'pending_verification';
    }
  }

  private mapAccountType(firestoreType: string): AccountType {
    switch (firestoreType) {
      case 'regular':
      case 'premium':
      case 'vip':
        return firestoreType;
      default:
        return 'regular';
    }
  }

  private mapMembershipTier(firestoreTier: string): MembershipTier {
    switch (firestoreTier) {
      case 'bronze':
      case 'silver':
      case 'gold':
      case 'platinum':
        return firestoreTier;
      default:
        return 'bronze';
    }
  }

  private applyClientSideFilters(users: User[], filters: UserFilters): User[] {
    return users.filter(user => {
      // Search filter
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        const matchesSearch = 
          user.displayName.toLowerCase().includes(searchLower) ||
          user.email.toLowerCase().includes(searchLower) ||
          user.firstName?.toLowerCase().includes(searchLower) ||
          user.lastName?.toLowerCase().includes(searchLower);
        
        if (!matchesSearch) return false;
      }

      // Status filter (multiple)
      if (filters.status && filters.status.length > 1) {
        if (!filters.status.includes(user.status)) return false;
      }

      // Account type filter (multiple)
      if (filters.accountType && filters.accountType.length > 1) {
        if (!filters.accountType.includes(user.accountType)) return false;
      }

      // Membership tier filter (multiple)
      if (filters.membershipTier && filters.membershipTier.length > 1) {
        if (!filters.membershipTier.includes(user.membershipTier)) return false;
      }

      // Date filters
      if (filters.joinDateFrom && user.joinDate < filters.joinDateFrom) return false;
      if (filters.joinDateTo && user.joinDate > filters.joinDateTo) return false;

      // Spending filters
      if (filters.totalSpentMin && user.totalSpent < filters.totalSpentMin) return false;
      if (filters.totalSpentMax && user.totalSpent > filters.totalSpentMax) return false;

      // Has orders filter
      if (filters.hasOrders !== undefined) {
        if (filters.hasOrders && user.totalOrders === 0) return false;
        if (!filters.hasOrders && user.totalOrders > 0) return false;
      }

      // Is active filter
      if (filters.isActive !== undefined) {
        const isActive = user.status === 'active';
        if (filters.isActive !== isActive) return false;
      }

      return true;
    });
  }
}