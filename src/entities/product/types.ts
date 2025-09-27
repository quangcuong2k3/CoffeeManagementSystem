/**
 * Product Entity Types
 * Domain-specific types for product management
 */

export interface Product {
  id: string;
  name: string;
  description: string;
  roasted: string;
  imageUrlSquare: string;
  imageUrlPortrait: string;
  ingredients: string;
  special_ingredient: string;
  prices: ProductPrice[];
  average_rating: number;
  ratings_count: string;
  favourite: boolean;
  type: 'Coffee' | 'Bean';
  index: number;
  category: 'coffee' | 'bean';
  createdAt: Date;
  updatedAt: Date;
}

export interface ProductPrice {
  size: string;
  price: string;
  currency: string;
  quantity?: number;
}

export interface ProductFormData {
  name: string;
  description: string;
  roasted: string;
  ingredients: string;
  special_ingredient: string;
  type: 'Coffee' | 'Bean';
  category: 'coffee' | 'bean';
  prices: ProductPrice[];
  images: {
    square: string;
    portrait: string;
  };
}

export interface ProductFilters {
  category?: 'coffee' | 'bean';
  type?: 'Coffee' | 'Bean';
  priceRange?: {
    min: number;
    max: number;
  };
  rating?: number;
  search?: string;
}

export interface ProductSearchResult {
  products: Product[];
  total: number;
  page: number;
  limit: number;
}