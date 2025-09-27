/**
 * Admin Entity Types
 * Domain-specific types for admin management
 */

export interface AdminPermission {
  resource: string;
  actions: string[];
}

export interface AdminUser {
  id: string;
  email: string;
  name: string;
  role: 'super_admin';
  hashedPassword: string;
  isActive: boolean;
  permissions: AdminPermission[];
  lastLogin?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthSession {
  user: AdminUser;
  token: string;
  expiresAt: Date;
}

export interface AuthState {
  isAuthenticated: boolean;
  user: AdminUser | null;
  isLoading: boolean;
  error: string | null;
}