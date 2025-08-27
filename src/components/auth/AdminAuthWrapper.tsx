'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { getAdminSession, clearAdminSession, AdminSession } from '@/lib/local-admin-auth';
import { toast } from 'sonner';

interface AdminAuthWrapperProps {
  children: React.ReactNode;
}

export function AdminAuthWrapper({ children }: AdminAuthWrapperProps) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [adminSession, setAdminSession] = useState<AdminSession | null>(null);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Check authentication status
    const session = getAdminSession();
    
    if (!session) {
      setIsAuthenticated(false);
      if (pathname !== '/') {
        toast.error('Session Expired', {
          description: 'Please login again to access the admin panel.',
        });
        router.push('/');
      }
      return;
    }

    // Check if session is expired
    if (session.expiresAt < Date.now()) {
      clearAdminSession();
      setIsAuthenticated(false);
      toast.error('Session Expired', {
        description: 'Your session has expired. Please login again.',
      });
      router.push('/');
      return;
    }

    setIsAuthenticated(true);
    setAdminSession(session);
  }, [pathname, router]);

  // Show loading while checking authentication
  if (isAuthenticated === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-coffee-50 to-orange-100 dark:from-coffee-900 dark:to-orange-900">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-coffee-500 mx-auto"></div>
          <p className="text-coffee-600 dark:text-coffee-400">Verifying authentication...</p>
        </div>
      </div>
    );
  }

  // If not authenticated and not on login page, redirect to login
  if (!isAuthenticated && pathname !== '/') {
    return null;
  }

  // If authenticated or on login page, render children
  return <>{children}</>;
}

export default AdminAuthWrapper;
