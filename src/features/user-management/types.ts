/**
 * User Management Feature Types
 */

import { User, UserFilters, UserStats } from '../../entities/user';

export interface UseUsersResult {
  users: User[];
  loading: boolean;
  error: string | null;
  totalUsers: number;
  hasMore: boolean;
  stats: UserStats | null;
  
  // Actions
  fetchUsers: (filters?: UserFilters, page?: number) => Promise<void>;
  refreshUsers: () => Promise<void>;
  updateUserStatus: (userId: string, status: User['status']) => Promise<void>;
  updateUserAccount: (userId: string, accountType: User['accountType']) => Promise<void>;
  deleteUser: (userId: string) => Promise<void>;
  awardPoints: (userId: string, points: number) => Promise<void>;
  clearError: () => void;
}

export interface UseUserResult {
  user: User | null;
  loading: boolean;
  error: string | null;
  orderHistory: any[];
  favoriteProducts: string[];
  preferences: any;
  
  // Actions
  fetchUser: (userId: string) => Promise<void>;
  updateUser: (userId: string, data: any) => Promise<void>;
  fetchOrderHistory: (userId: string) => Promise<void>;
  fetchFavorites: (userId: string) => Promise<void>;
  fetchPreferences: (userId: string) => Promise<void>;
  clearError: () => void;
}

export type ViewMode = 'grid' | 'list';
export type SortOption = 'name' | 'joinDate' | 'totalSpent' | 'totalOrders' | 'lastActive';