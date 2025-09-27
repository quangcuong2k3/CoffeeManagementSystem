'use client';

import { AdminUser } from '../../../entities/admin/types';
import React, { useState, useEffect, useCallback, createContext, useContext } from 'react';
import { useRouter } from 'next/navigation';
import { adminService } from '../service/adminService';
import { LoginFormData, AuthContextValue } from '../../../features/auth/types';

/**
 * Hook for admin authentication management
 */
export const useAuth = () => {
  const [state, setState] = useState({
    isAuthenticated: false,
    user: null as AdminUser | null,
    isLoading: true,
    error: null as string | null
  });

  // Initialize auth state on mount
  useEffect(() => {
    initializeAuth();
  }, []);

  const initializeAuth = async () => {
    try {
      setState(prev => ({ ...prev, isLoading: true }));

      // Initialize default admin if not exists
      await adminService.initializeDefaultAdmin();

      // Check for existing session
      const savedUser = localStorage.getItem('coffee_admin_user');
      if (savedUser) {
        const user = JSON.parse(savedUser);
        
        // Validate session by checking if user still exists
        const currentUser = await adminService.getAdminById(user.id);
        
        if (currentUser && currentUser.isActive) {
          setState(prev => ({
            ...prev,
            isAuthenticated: true,
            user: currentUser,
            isLoading: false
          }));
        } else {
          // Clear invalid session
          localStorage.removeItem('coffee_admin_user');
          setState(prev => ({
            ...prev,
            isAuthenticated: false,
            user: null,
            isLoading: false
          }));
        }
      } else {
        setState(prev => ({
          ...prev,
          isAuthenticated: false,
          user: null,
          isLoading: false
        }));
      }
    } catch (error) {
      console.error('Auth initialization error:', error);
      setState(prev => ({
        ...prev,
        error: 'Failed to initialize authentication system',
        isLoading: false
      }));
    }
  };

  const login = useCallback(async (credentials: LoginFormData) => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));

      const user = await adminService.authenticateAdmin(credentials);

      // Save user to localStorage for persistence
      localStorage.setItem('coffee_admin_user', JSON.stringify(user));

      setState(prev => ({
        ...prev,
        isAuthenticated: true,
        user,
        isLoading: false,
        error: null
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Login failed',
        isLoading: false
      }));
      throw error;
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('coffee_admin_user');
    setState({
      isAuthenticated: false,
      user: null,
      isLoading: false,
      error: null
    });
  }, []);

  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }));
  }, []);

  return {
    ...state,
    login,
    logout,
    clearError
  };
};

/**
 * Hook for login form management
 */
export const useLoginForm = () => {
  const [formData, setFormData] = useState<LoginFormData>({
    email: '',
    password: ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const updateField = useCallback((field: keyof LoginFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear error for this field
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  }, [errors]);

  const validate = useCallback((): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Invalid email format';
    }

    if (!formData.password.trim()) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData]);

  const reset = useCallback(() => {
    setFormData({ email: '', password: '' });
    setErrors({});
  }, []);

  return {
    formData,
    errors,
    updateField,
    validate,
    reset,
    isValid: Object.keys(errors).length === 0
  };
};

/**
 * Auth Context for providing authentication state throughout the app
 */
const AuthContext = createContext<AuthContextValue | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const auth = useAuth();

  return React.createElement(
    AuthContext.Provider,
    { value: auth },
    children
  );
};

export const useAuthContext = (): AuthContextValue => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuthContext must be used within AuthProvider');
  }
  return context;
};

/**
 * Hook for route protection
 */
export const useProtectedRoute = () => {
  const { isAuthenticated, isLoading } = useAuthContext();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/');
    }
  }, [isAuthenticated, isLoading, router]);

  return { isAuthenticated, isLoading };
};