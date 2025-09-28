/**
 * User Entity Types
 * Defines user domain types and interfaces based on Firestore structure
 */

export interface UserPreferences {
  id: string;
  userId: string;
  favoriteProducts: string[];
  orderHistory: string[];
  deliveryAddresses: DeliveryAddress[];
  paymentMethods: PaymentMethodInfo[];
  notifications: NotificationSettings;
  createdAt: Date;
  updatedAt: Date;
}

export interface DeliveryAddress {
  id: string;
  label: string; // 'Home', 'Office', etc.
  address: string;
  city: string;
  postalCode: string;
  isDefault: boolean;
  coordinates?: {
    latitude: number;
    longitude: number;
  };
}

export interface PaymentMethodInfo {
  id: string;
  type: 'card' | 'digital_wallet' | 'bank_transfer';
  label: string;
  lastFour?: string;
  isDefault: boolean;
  expiryDate?: string;
}

export interface NotificationSettings {
  orderUpdates: boolean;
  promotions: boolean;
  newProducts: boolean;
  weeklyDigest: boolean;
}

export interface User {
  id: string;
  uid: string; // Firebase Auth UID
  email: string;
  displayName: string;
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  profileImageUrl?: string;
  isEmailVerified: boolean;
  
  // User status
  status: UserStatus;
  accountType: AccountType;
  
  // Statistics
  totalOrders: number;
  totalSpent: number;
  averageOrderValue: number;
  lastOrderDate?: Date;
  favoriteProductsCount: number;
  
  // Loyalty & engagement
  loyaltyPoints: number;
  membershipTier: MembershipTier;
  joinDate: Date;
  lastActiveDate: Date;
  
  // Timestamps
  createdAt: Date;
  updatedAt: Date;
}

export type UserStatus = 'active' | 'inactive' | 'suspended' | 'pending_verification';
export type AccountType = 'regular' | 'premium' | 'vip';
export type MembershipTier = 'bronze' | 'silver' | 'gold' | 'platinum';

export interface UserFilters {
  search?: string;
  status?: UserStatus[];
  accountType?: AccountType[];
  membershipTier?: MembershipTier[];
  joinDateFrom?: Date;
  joinDateTo?: Date;
  totalSpentMin?: number;
  totalSpentMax?: number;
  hasOrders?: boolean;
  isActive?: boolean;
}

export interface UserStats {
  totalUsers: number;
  activeUsers: number;
  newUsersThisMonth: number;
  premiumUsers: number;
  //vipUsers: number;
  averageOrdersPerUser: number;
  totalRevenue: number;
  averageLifetimeValue: number;
  retentionRate: number;
}

export interface CreateUserData {
  email: string;
  displayName: string;
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  profileImageUrl?: string;
}

export interface UpdateUserData {
  displayName?: string;
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  profileImageUrl?: string;
  status?: UserStatus;
  accountType?: AccountType;
  loyaltyPoints?: number;
  membershipTier?: MembershipTier;
}