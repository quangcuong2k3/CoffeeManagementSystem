'use client';

import { Navigation } from '../../shared/components/layout/NavigationEnhanced';
import DashboardContent from '@/features/dashboard/ui/components/DashboardContent';

export default function DashboardPage() {
  return (
    <Navigation>
      <DashboardContent />
    </Navigation>
  );
}