'use client';

import React from 'react';
import { OrdersPage } from '../../features/order-management';
import { Navigation } from '@/shared/components';

function OrdersPageContent() {
  return <OrdersPage />;
}

export default function Orders() {
  return (
    <Navigation>
      <OrdersPageContent />
    </Navigation>
  );
}
  