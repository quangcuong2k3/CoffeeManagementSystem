/**
 * User Repository Interface
 * Defines data access methods for users
 */

import { 
  User, 
  UserFilters, 
  UserStats, 
  CreateUserData, 
  UpdateUserData,
  UserPreferences
} from './types';
import { Order } from '../order/types';

export interface UserRepository {
  // User CRUD operations
  findById(id: string): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
  findByUid(uid: string): Promise<User | null>;
  findAll(filters?: UserFilters, limit?: number, offset?: number): Promise<{
    users: User[];
    total: number;
    hasMore: boolean;
  }>;
  create(userData: CreateUserData): Promise<User>;
  update(id: string, userData: UpdateUserData): Promise<User>;
  delete(id: string): Promise<void>;
  
  // User analytics
  getStats(): Promise<UserStats>;
  getUserOrderHistory(userId: string, limit?: number): Promise<Order[]>;
  getUserFavoriteProducts(userId: string): Promise<string[]>;
  getUserPreferences(userId: string): Promise<UserPreferences | null>;
  updateUserPreferences(userId: string, preferences: Partial<UserPreferences>): Promise<UserPreferences>;
  
  // User engagement
  updateLastActive(userId: string): Promise<void>;
  updateLoyaltyPoints(userId: string, points: number): Promise<void>;
  calculateUserStats(userId: string): Promise<{
    totalOrders: number;
    totalSpent: number;
    averageOrderValue: number;
    lastOrderDate?: Date;
  }>;
}