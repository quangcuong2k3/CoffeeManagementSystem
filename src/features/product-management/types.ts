/**
 * Product Management Feature Types
 */

import { Product, ProductFormData, ProductFilters } from '../../entities/product';

export interface ProductManagementState {
  products: Product[];
  selectedProduct: Product | null;
  isLoading: boolean;
  error: string | null;
  filters: ProductFilters;
  pagination: {
    page: number;
    limit: number;
    total: number;
  };
}

export interface ProductFormProps {
  product?: Product;
  onSubmit: (data: ProductFormData) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

export interface ProductListProps {
  products: Product[];
  onProductSelect: (product: Product) => void;
  onProductEdit: (product: Product) => void;
  onProductDelete: (productId: string) => Promise<void>;
  isLoading?: boolean;
}

export interface ProductFiltersProps {
  filters: ProductFilters;
  onFiltersChange: (filters: ProductFilters) => void;
  onReset: () => void;
}