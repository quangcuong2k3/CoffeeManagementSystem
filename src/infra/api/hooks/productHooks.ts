'use client';

import { useState } from 'react';
import { productService } from '../service';
import { Product, ProductFormData, ProductFormDataWithFiles, ProductFilters } from '../../../entities/product/types';

export const useProducts = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchProducts = async (filters: ProductFilters = {}, page = 1, limit = 20) => {
    setLoading(true);
    setError(null);
    try {
      const result = await productService.getProducts(filters, page, limit);
      setProducts(result.products);
      return result;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch products');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const createProduct = async (productData: ProductFormData) => {
    setLoading(true);
    setError(null);
    try {
      const productId = await productService.createProduct(productData);
      // Fetch the created product to add to state
      const createdProduct = await productService.getProductById(productId);
      if (createdProduct) {
        setProducts(prev => [...prev, createdProduct]);
      }
      return productId;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create product');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateProduct = async (id: string, updates: Partial<ProductFormData>) => {
    setLoading(true);
    setError(null);
    try {
      await productService.updateProduct(id, updates);
      // Fetch the updated product
      const updatedProduct = await productService.getProductById(id);
      if (updatedProduct) {
        setProducts(prev => prev.map(p => p.id === id ? updatedProduct : p));
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update product');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deleteProduct = async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      await productService.deleteProduct(id);
      setProducts(prev => prev.filter(p => p.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete product');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    products,
    loading,
    error,
    fetchProducts,
    createProduct,
    updateProduct,
    deleteProduct
  };
};