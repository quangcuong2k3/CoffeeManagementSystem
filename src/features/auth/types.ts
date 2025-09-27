/**
 * Auth Feature Types
 */

import { AdminUser, AuthState } from '../../entities/admin';

export interface LoginFormData {
  email: string;
  password: string;
}

export interface LoginFormProps {
  onSubmit: (data: LoginFormData) => Promise<void>;
  isLoading?: boolean;
  error?: string;
}

export interface AuthContextValue extends AuthState {
  login: (credentials: LoginFormData) => Promise<void>;
  logout: () => void;
  clearError: () => void;
}

export interface ProtectedRouteProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}