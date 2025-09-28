/**
 * User Entity Service
 * Contains business logic and rules for user management
 */

import { UserRepository } from './repository';
import { FirestoreUserRepository } from './firestoreRepository';
import { 
  User, 
  CreateUserData, 
  UpdateUserData, 
  UserFilters,
  UserStats,
  UserStatus,
  AccountType,
  MembershipTier,
  UserPreferences
} from './types';

export class UserService {
  private repository: UserRepository;

  constructor(repository?: UserRepository) {
    this.repository = repository || new FirestoreUserRepository();
  }

  // User CRUD operations
  async getUser(id: string): Promise<User | null> {
    return this.repository.findById(id);
  }

  async getUserByEmail(email: string): Promise<User | null> {
    return this.repository.findByEmail(email);
  }

  async getUserByUid(uid: string): Promise<User | null> {
    return this.repository.findByUid(uid);
  }

  async getUsers(filters?: UserFilters, limit = 20, offset = 0) {
    return this.repository.findAll(filters, limit, offset);
  }

  async createUser(userData: CreateUserData): Promise<User> {
    // Validate user data
    this.validateCreateUserData(userData);

    // Check if user already exists
    const existingUser = await this.repository.findByEmail(userData.email);
    if (existingUser) {
      throw new Error('User with this email already exists');
    }

    return this.repository.create(userData);
  }

  async updateUser(id: string, userData: UpdateUserData): Promise<User> {
    // Validate update data
    this.validateUpdateUserData(userData);

    // Check if user exists
    const existingUser = await this.repository.findById(id);
    if (!existingUser) {
      throw new Error('User not found');
    }

    return this.repository.update(id, userData);
  }

  async deleteUser(id: string): Promise<void> {
    // Check if user exists
    const existingUser = await this.repository.findById(id);
    if (!existingUser) {
      throw new Error('User not found');
    }

    // Business rule: Cannot delete users with recent orders
    if (existingUser.lastOrderDate) {
      const daysSinceLastOrder = Math.floor((Date.now() - existingUser.lastOrderDate.getTime()) / (1000 * 60 * 60 * 24));
      if (daysSinceLastOrder < 30) {
        throw new Error('Cannot delete users with orders in the last 30 days');
      }
    }

    return this.repository.delete(id);
  }

  // User statistics and analytics
  async getUserStats(): Promise<UserStats> {
    return this.repository.getStats();
  }

  async getUserOrderHistory(userId: string, limit = 10) {
    return this.repository.getUserOrderHistory(userId, limit);
  }

  async getUserFavoriteProducts(userId: string): Promise<string[]> {
    return this.repository.getUserFavoriteProducts(userId);
  }

  // User preferences management
  async getUserPreferences(userId: string): Promise<UserPreferences | null> {
    return this.repository.getUserPreferences(userId);
  }

  async updateUserPreferences(userId: string, preferences: Partial<UserPreferences>): Promise<UserPreferences> {
    return this.repository.updateUserPreferences(userId, preferences);
  }

  // User engagement and loyalty
  async updateUserActivity(userId: string): Promise<void> {
    await this.repository.updateLastActive(userId);
  }

  async awardLoyaltyPoints(userId: string, points: number): Promise<void> {
    if (points < 0) {
      throw new Error('Cannot award negative loyalty points');
    }

    const user = await this.repository.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    const newPoints = user.loyaltyPoints + points;
    await this.repository.updateLoyaltyPoints(userId, newPoints);

    // Check for tier upgrades
    await this.checkMembershipTierUpgrade(userId, newPoints);
  }

  async deductLoyaltyPoints(userId: string, points: number): Promise<void> {
    if (points < 0) {
      throw new Error('Cannot deduct negative loyalty points');
    }

    const user = await this.repository.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    if (user.loyaltyPoints < points) {
      throw new Error('Insufficient loyalty points');
    }

    const newPoints = user.loyaltyPoints - points;
    await this.repository.updateLoyaltyPoints(userId, newPoints);
  }

  // User status management
  async activateUser(userId: string): Promise<User> {
    return this.updateUser(userId, { status: 'active' });
  }

  async deactivateUser(userId: string): Promise<User> {
    return this.updateUser(userId, { status: 'inactive' });
  }

  async suspendUser(userId: string): Promise<User> {
    return this.updateUser(userId, { status: 'suspended' });
  }

  async promoteToAccount(userId: string, accountType: AccountType): Promise<User> {
    const validAccountTypes: AccountType[] = ['regular', 'premium', 'vip'];
    if (!validAccountTypes.includes(accountType)) {
      throw new Error('Invalid account type');
    }

    return this.updateUser(userId, { accountType });
  }

  // Business logic helpers
  private async checkMembershipTierUpgrade(userId: string, loyaltyPoints: number): Promise<void> {
    let newTier: MembershipTier;

    if (loyaltyPoints >= 10000) {
      newTier = 'platinum';
    } else if (loyaltyPoints >= 5000) {
      newTier = 'gold';
    } else if (loyaltyPoints >= 2500) {
      newTier = 'silver';
    } else {
      newTier = 'bronze';
    }

    const user = await this.repository.findById(userId);
    if (user && user.membershipTier !== newTier) {
      await this.repository.update(userId, { membershipTier: newTier });
    }
  }

  private validateCreateUserData(userData: CreateUserData): void {
    if (!userData.email || !this.isValidEmail(userData.email)) {
      throw new Error('Valid email is required');
    }

    if (!userData.displayName || userData.displayName.trim().length < 2) {
      throw new Error('Display name must be at least 2 characters long');
    }

    if (userData.phoneNumber && !this.isValidPhoneNumber(userData.phoneNumber)) {
      throw new Error('Invalid phone number format');
    }
  }

  private validateUpdateUserData(userData: UpdateUserData): void {
    if (userData.displayName !== undefined) {
      if (!userData.displayName || userData.displayName.trim().length < 2) {
        throw new Error('Display name must be at least 2 characters long');
      }
    }

    if (userData.phoneNumber && !this.isValidPhoneNumber(userData.phoneNumber)) {
      throw new Error('Invalid phone number format');
    }

    if (userData.status) {
      const validStatuses: UserStatus[] = ['active', 'inactive', 'suspended', 'pending_verification'];
      if (!validStatuses.includes(userData.status)) {
        throw new Error('Invalid user status');
      }
    }

    if (userData.accountType) {
      const validAccountTypes: AccountType[] = ['regular', 'premium', 'vip'];
      if (!validAccountTypes.includes(userData.accountType)) {
        throw new Error('Invalid account type');
      }
    }

    if (userData.loyaltyPoints !== undefined && userData.loyaltyPoints < 0) {
      throw new Error('Loyalty points cannot be negative');
    }
  }

  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  private isValidPhoneNumber(phoneNumber: string): boolean {
    const phoneRegex = /^\+?[\d\s\-\(\)]{10,}$/;
    return phoneRegex.test(phoneNumber);
  }
}