'use client';

import { Navigation } from '../../shared/components/layout/NavigationEnhanced';
import ProductsPage from '../../features/product-management/ui/pages/ProductsPage';

export default function AppProductsPage() {
  return (
    <Navigation>
      <ProductsPage />
    </Navigation>
  );
}