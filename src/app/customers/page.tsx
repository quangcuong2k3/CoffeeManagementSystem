'use client';

import { Navigation } from '@/shared/components';
import UserManagementPage from '@/features/user-management/ui/pages/UserManagementPage';

export default function DashboardPage() {
  return (
    <Navigation>
      <UserManagementPage />
    </Navigation>
  );
}