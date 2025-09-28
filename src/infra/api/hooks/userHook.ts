/**
 * User Management Hooks
 * React hooks for user management state and operations
 */

import { useState, useCallback, useEffect, useMemo } from 'react';
import { UserService, UserPreferencesService, UserOrderService } from '@/infra/api/service';
import { User, UserFilters,UserStats } from '@/entities';
import { UseUsersResult,UseUserResult } from '@/features/user-management/types';
import { UserOrder, UserPreferenceData } from '../service/userOrderService';

// User preferences types
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

export interface UseUserDetailsResult {
  user: User | null;
  preferences: UserPreferenceData | null;
  favoriteProducts: any[];
  orderHistory: UserOrder[];
  loading: boolean;
  error: string | null;
  realStats?: {
    totalOrders: number;
    totalSpent: number;
    averageOrderValue: number;
    lastOrderDate?: Date;
  } | null;
  fetchUserDetails: (userId: string) => Promise<void>;
  updateUserInfo: (userId: string, updates: Partial<User>) => Promise<void>;
  clearError: () => void;
}
// Main users management hook
export const useUsers = (initialFilters?: UserFilters, limit = 20): UseUsersResult => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [totalUsers, setTotalUsers] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [stats, setStats] = useState<UserStats | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  const userService = new UserService();

  const fetchUsers = useCallback(async (filters?: UserFilters, page = 1) => {
    try {
      setLoading(true);
      setError(null);

      const offset = (page - 1) * limit;
      const result = await userService.getUsers(filters, limit, offset);
      
      // Fetch real stats for each user and update totalSpent
      const userOrderService = new UserOrderService();
      const usersWithRealStats = await Promise.all(
        result.users.map(async (user) => {
          try {
            const realStats = await userOrderService.calculateUserStats(user.id);
            return {
              ...user,
              totalSpent: realStats.totalSpent,
              totalOrders: realStats.totalOrders,
              averageOrderValue: realStats.averageOrderValue,
              lastOrderDate: realStats.lastOrderDate
            };
          } catch (error) {
            console.log(`Failed to fetch stats for user ${user.id}:`, error);
            return user; // Return original user if stats fetch fails
          }
        })
      );

      if (page === 1) {
        setUsers(usersWithRealStats);
      } else {
        setUsers(prev => [...prev, ...usersWithRealStats]);
      }

      setTotalUsers(result.total);
      setHasMore(result.hasMore);
      setCurrentPage(page);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch users');
    } finally {
      setLoading(false);
    }
  }, [limit, userService]);

  const refreshUsers = useCallback(async () => {
    await fetchUsers(initialFilters, 1);
  }, [fetchUsers, initialFilters]);

  const fetchStats = useCallback(async () => {
    try {
      const userStats = await userService.getUserStats();
      setStats(userStats);
    } catch (err) {
      console.error('Failed to fetch user stats:', err);
    }
  }, [userService]);

  const updateUserStatus = useCallback(async (userId: string, status: User['status']) => {
    try {
      setError(null);
      await userService.updateUser(userId, { status });
      
      // Update user in local state
      setUsers(prev => prev.map(user => 
        user.id === userId ? { ...user, status } : user
      ));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update user status');
      throw err;
    }
  }, [userService]);

  const updateUserAccount = useCallback(async (userId: string, accountType: User['accountType']) => {
    try {
      setError(null);
      await userService.updateUser(userId, { accountType });
      
      // Update user in local state
      setUsers(prev => prev.map(user => 
        user.id === userId ? { ...user, accountType } : user
      ));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update user account');
      throw err;
    }
  }, [userService]);

  const deleteUser = useCallback(async (userId: string) => {
    try {
      setError(null);
      await userService.deleteUser(userId);
      
      // Remove user from local state
      setUsers(prev => prev.filter(user => user.id !== userId));
      setTotalUsers(prev => prev - 1);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete user');
      throw err;
    }
  }, [userService]);

  const awardPoints = useCallback(async (userId: string, points: number) => {
    try {
      setError(null);
      await userService.awardLoyaltyPoints(userId, points);
      
      // Refresh user data to get updated points and tier
      const updatedUser = await userService.getUser(userId);
      if (updatedUser) {
        setUsers(prev => prev.map(user => 
          user.id === userId ? updatedUser : user
        ));
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to award points');
      throw err;
    }
  }, [userService]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Fetch users and stats on mount
  useEffect(() => {
    fetchUsers(initialFilters, 1);
    fetchStats();
  }, [fetchUsers, fetchStats, initialFilters]);

  return {
    users,
    loading,
    error,
    totalUsers,
    hasMore,
    stats,
    fetchUsers,
    refreshUsers,
    updateUserStatus,
    updateUserAccount,
    deleteUser,
    awardPoints,
    clearError
  };
};

// Individual user management hook
export const useUser = (initialUserId?: string): UseUserResult => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [orderHistory, setOrderHistory] = useState<any[]>([]);
  const [favoriteProducts, setFavoriteProducts] = useState<string[]>([]);
  const [preferences, setPreferences] = useState<any>(null);

  const userService = new UserService();

  const fetchUser = useCallback(async (userId: string) => {
    try {
      setLoading(true);
      setError(null);
      
      const userData = await userService.getUser(userId);
      setUser(userData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch user');
    } finally {
      setLoading(false);
    }
  }, [userService]);

  const updateUser = useCallback(async (userId: string, data: any) => {
    try {
      setError(null);
      const updatedUser = await userService.updateUser(userId, data);
      setUser(updatedUser);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update user');
      throw err;
    }
  }, [userService]);

  const fetchOrderHistory = useCallback(async (userId: string) => {
    try {
      const orders = await userService.getUserOrderHistory(userId, 10);
      setOrderHistory(orders);
    } catch (err) {
      console.error('Failed to fetch order history:', err);
    }
  }, [userService]);

  const fetchFavorites = useCallback(async (userId: string) => {
    try {
      const favorites = await userService.getUserFavoriteProducts(userId);
      setFavoriteProducts(favorites);
    } catch (err) {
      console.error('Failed to fetch favorites:', err);
    }
  }, [userService]);

  const fetchPreferences = useCallback(async (userId: string) => {
    try {
      const userPrefs = await userService.getUserPreferences(userId);
      setPreferences(userPrefs);
    } catch (err) {
      console.error('Failed to fetch preferences:', err);
    }
  }, [userService]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Fetch user on mount if ID provided
  useEffect(() => {
    if (initialUserId) {
      fetchUser(initialUserId);
      fetchOrderHistory(initialUserId);
      fetchFavorites(initialUserId);
      fetchPreferences(initialUserId);
    }
  }, [initialUserId, fetchUser, fetchOrderHistory, fetchFavorites, fetchPreferences]);

  return {
    user,
    loading,
    error,
    orderHistory,
    favoriteProducts,
    preferences,
    fetchUser,
    updateUser,
    fetchOrderHistory,
    fetchFavorites,
    fetchPreferences,
    clearError
  };
};

// User statistics hook
export const useUserStats = () => {
  const [stats, setStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const userService = new UserService();

  const fetchStats = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const userStats = await userService.getUserStats();
      setStats(userStats);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch user statistics');
    } finally {
      setLoading(false);
    }
  }, [userService]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  return {
    stats,
    loading,
    error,
    fetchStats,
    clearError
  };
};

// User details hook with preferences and order history
export const useUserDetails = (): UseUserDetailsResult => {
  const [user, setUser] = useState<User | null>(null);
  const [preferences, setPreferences] = useState<UserPreferenceData | null>(null);
  const [favoriteProducts, setFavoriteProducts] = useState<any[]>([]);
  const [orderHistory, setOrderHistory] = useState<UserOrder[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [realStats, setRealStats] = useState<{
    totalOrders: number;
    totalSpent: number;
    averageOrderValue: number;
    lastOrderDate?: Date;
  } | null>(null);

  // Create service instances only once to avoid dependency issues
  const userService = useMemo(() => new UserService(), []);
  const userOrderService = useMemo(() => new UserOrderService(), []);

  const fetchUserDetails = useCallback(async (userId: string) => {
    setLoading(true);
    setError(null);
    try {
      //console.log('Fetching user details for:', userId);
      
      // Fetch all user details in parallel
      const [userData, preferencesData, ordersData, statsData] = await Promise.all([
        userService.getUser(userId),
        userOrderService.getUserPreferences(userId),
        userOrderService.getUserOrders(userId, 50),
        userOrderService.calculateUserStats(userId)
      ]);

      // console.log('Fetched data:', { 
      //   userData, 
      //   preferencesData, 
      //   ordersCount: ordersData.length, 
      //   statsData 
      // });

      setUser(userData);
      setPreferences(preferencesData);
      setOrderHistory(ordersData);
      setRealStats(statsData);
      
      // Set favorites from preferences
      if (preferencesData?.favorites) {
        // For now, just store the product IDs. In a real app, you'd fetch product details
        setFavoriteProducts(preferencesData.favorites.map((id: string) => ({ id, name: `Product ${id}` })));
      }

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch user details');
      console.error('Error fetching user details:', err);
    } finally {
      setLoading(false);
    }
  }, [userService, userOrderService]);

  const updateUserInfo = useCallback(async (userId: string, updates: Partial<User>) => {
    try {
      const updatedUser = await userService.updateUser(userId, updates);
      setUser(updatedUser);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update user');
      throw err;
    }
  }, [userService]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    user,
    preferences,
    favoriteProducts,
    orderHistory,
    loading,
    error,
    realStats,
    fetchUserDetails,
    updateUserInfo,
    clearError
  };
};