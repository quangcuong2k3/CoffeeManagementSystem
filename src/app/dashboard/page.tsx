'use client';

import { Navigation } from '@/shared/components';
import DashboardContent from '@/features/dashboard/ui/components/DashboardContent';

export default function DashboardPage() {
  return (
    <Navigation>
      <DashboardContent />
    </Navigation>
  );
}