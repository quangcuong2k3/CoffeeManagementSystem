import { useState, useEffect, useCallback } from 'react';
import { productService } from '@/infra/api/service/productService';
import { Product, ProductFormData, ProductFilters } from '../../entities/product';
import { ProductManagementState } from './types';

/**
 * Hook for managing products with full CRUD operations
 */
export const useProductManagement = () => {
  const [state, setState] = useState<ProductManagementState>({
    products: [],
    selectedProduct: null,
    isLoading: false,
    error: null,
    filters: {},
    pagination: {
      page: 1,
      limit: 20,
      total: 0
    }
  });

  // Load products with current filters and pagination
  const loadProducts = useCallback(async () => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      const result = await productService.getProducts(
        state.filters,
        state.pagination.page,
        state.pagination.limit
      );

      setState(prev => ({
        ...prev,
        products: result.products,
        pagination: {
          ...prev.pagination,
          total: result.total
        },
        isLoading: false
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to load products',
        isLoading: false
      }));
    }
  }, [state.filters, state.pagination.page, state.pagination.limit]);

  // Create a new product
  const createProduct = useCallback(async (productData: ProductFormData): Promise<string> => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      const productId = await productService.createProduct(productData);
      await loadProducts(); // Reload products list
      
      setState(prev => ({ ...prev, isLoading: false }));
      return productId;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to create product';
      setState(prev => ({
        ...prev,
        error: errorMessage,
        isLoading: false
      }));
      throw new Error(errorMessage);
    }
  }, [loadProducts]);

  // Update an existing product
  const updateProduct = useCallback(async (id: string, productData: Partial<ProductFormData>): Promise<void> => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      await productService.updateProduct(id, productData);
      await loadProducts(); // Reload products list
      
      setState(prev => ({ ...prev, isLoading: false }));
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update product';
      setState(prev => ({
        ...prev,
        error: errorMessage,
        isLoading: false
      }));
      throw new Error(errorMessage);
    }
  }, [loadProducts]);

  // Delete a product
  const deleteProduct = useCallback(async (id: string): Promise<void> => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      await productService.deleteProduct(id);
      await loadProducts(); // Reload products list
      
      setState(prev => ({ ...prev, isLoading: false }));
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete product';
      setState(prev => ({
        ...prev,
        error: errorMessage,
        isLoading: false
      }));
      throw new Error(errorMessage);
    }
  }, [loadProducts]);

  // Get a single product by ID
  const getProduct = useCallback(async (id: string): Promise<Product | null> => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      const product = await productService.getProductById(id);
      setState(prev => ({ ...prev, isLoading: false }));
      return product;
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to get product',
        isLoading: false
      }));
      return null;
    }
  }, []);

  // Search products
  const searchProducts = useCallback(async (searchTerm: string): Promise<Product[]> => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      const products = await productService.searchProducts(searchTerm, state.filters);
      setState(prev => ({ ...prev, isLoading: false }));
      return products;
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to search products',
        isLoading: false
      }));
      return [];
    }
  }, [state.filters]);

  // Get featured products
  const getFeaturedProducts = useCallback(async (limit: number = 10): Promise<Product[]> => {
    try {
      return await productService.getFeaturedProducts(limit);
    } catch (error) {
      console.error('Failed to get featured products:', error);
      return [];
    }
  }, []);

  // Get products by category
  const getProductsByCategory = useCallback(async (category: 'coffee' | 'bean'): Promise<Product[]> => {
    try {
      return await productService.getProductsByCategory(category);
    } catch (error) {
      console.error('Failed to get products by category:', error);
      return [];
    }
  }, []);

  // Get product statistics
  const getProductStats = useCallback(async () => {
    try {
      return await productService.getProductStats();
    } catch (error) {
      console.error('Failed to get product statistics:', error);
      return null;
    }
  }, []);

  // Update filters
  const updateFilters = useCallback((filters: ProductFilters) => {
    setState(prev => ({
      ...prev,
      filters,
      pagination: { ...prev.pagination, page: 1 } // Reset to first page when filters change
    }));
  }, []);

  // Update pagination
  const updatePagination = useCallback((page: number, limit?: number) => {
    setState(prev => ({
      ...prev,
      pagination: {
        ...prev.pagination,
        page,
        ...(limit && { limit })
      }
    }));
  }, []);

  // Clear error
  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }));
  }, []);

  // Select product
  const selectProduct = useCallback((product: Product | null) => {
    setState(prev => ({ ...prev, selectedProduct: product }));
  }, []);

  // Load products when dependencies change
  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  return {
    // State
    products: state.products,
    selectedProduct: state.selectedProduct,
    isLoading: state.isLoading,
    error: state.error,
    filters: state.filters,
    pagination: state.pagination,

    // Actions
    loadProducts,
    createProduct,
    updateProduct,
    deleteProduct,
    getProduct,
    searchProducts,
    getFeaturedProducts,
    getProductsByCategory,
    getProductStats,
    updateFilters,
    updatePagination,
    clearError,
    selectProduct
  };
};

/**
 * Hook for product form management
 */
export const useProductForm = (initialProduct?: Product) => {
  const [formData, setFormData] = useState<ProductFormData>(() => ({
    name: initialProduct?.name || '',
    description: initialProduct?.description || '',
    roasted: initialProduct?.roasted || '',
    ingredients: initialProduct?.ingredients || '',
    special_ingredient: initialProduct?.special_ingredient || '',
    type: initialProduct?.type || 'Coffee',
    category: initialProduct?.category || 'coffee',
    prices: initialProduct?.prices || [
      { size: 'S', price: '0', currency: 'USD' },
      { size: 'M', price: '0', currency: 'USD' },
      { size: 'L', price: '0', currency: 'USD' }
    ],
    images: {
      square: initialProduct?.imageUrlSquare || '',
      portrait: initialProduct?.imageUrlPortrait || ''
    }
  }));

  const [errors, setErrors] = useState<Record<string, string>>({});

  const updateField = useCallback(<K extends keyof ProductFormData>(
    field: K,
    value: ProductFormData[K]
  ) => {
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

  const updatePrice = useCallback((index: number, field: keyof typeof formData.prices[0], value: string) => {
    setFormData(prev => ({
      ...prev,
      prices: prev.prices.map((price, i) => 
        i === index ? { ...price, [field]: value } : price
      )
    }));
  }, []);

  const addPrice = useCallback(() => {
    setFormData(prev => ({
      ...prev,
      prices: [...prev.prices, { size: '', price: '0', currency: 'USD' }]
    }));
  }, []);

  const removePrice = useCallback((index: number) => {
    setFormData(prev => ({
      ...prev,
      prices: prev.prices.filter((_, i) => i !== index)
    }));
  }, []);

  const validate = useCallback((): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Product name is required';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Product description is required';
    }

    if (!formData.prices.length) {
      newErrors.prices = 'At least one price is required';
    } else {
      const invalidPrices = formData.prices.some(price => 
        !price.size.trim() || !price.price || parseFloat(price.price) <= 0
      );
      if (invalidPrices) {
        newErrors.prices = 'All prices must have valid size and price values';
      }
    }

    if (!formData.images.square.trim()) {
      newErrors.imageSquare = 'Square image is required';
    }

    if (!formData.images.portrait.trim()) {
      newErrors.imagePortrait = 'Portrait image is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData]);

  const reset = useCallback(() => {
    setFormData({
      name: initialProduct?.name || '',
      description: initialProduct?.description || '',
      roasted: initialProduct?.roasted || '',
      ingredients: initialProduct?.ingredients || '',
      special_ingredient: initialProduct?.special_ingredient || '',
      type: initialProduct?.type || 'Coffee',
      category: initialProduct?.category || 'coffee',
      prices: initialProduct?.prices || [
        { size: 'S', price: '0', currency: 'USD' },
        { size: 'M', price: '0', currency: 'USD' },
        { size: 'L', price: '0', currency: 'USD' }
      ],
      images: {
        square: initialProduct?.imageUrlSquare || '',
        portrait: initialProduct?.imageUrlPortrait || ''
      }
    });
    setErrors({});
  }, [initialProduct]);

  return {
    formData,
    errors,
    updateField,
    updatePrice,
    addPrice,
    removePrice,
    validate,
    reset,
    isValid: Object.keys(errors).length === 0
  };
};