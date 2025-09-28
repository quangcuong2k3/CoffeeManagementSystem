'use client';

import { Navigation } from '@/shared/components';
import ProductsPage from '../../features/product-management/ui/pages/ProductsPage';

export default function AppProductsPage() {
  return (
    <Navigation>
      <ProductsPage />
    </Navigation>
  );
}